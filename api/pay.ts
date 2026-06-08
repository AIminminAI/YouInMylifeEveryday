import type { VercelRequest, VercelResponse } from '@vercel/node'
import { initDB, createOrder, findOrderByIdAndUser, updateOrderStatus, updateUserPlan } from './_db'

// 初始化数据库
initDB()

// 价格配置
const PRICES: Record<string, { amount: number; label: string }> = {
  full: { amount: 1990, label: '高级版 ¥19.9' },
  premium: { amount: 9900, label: '纪念版 ¥99' },
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { action } = req.query

  try {
    switch (action) {
      case 'create-order':
        return await handleCreateOrder(req, res)
      case 'confirm-pay':
        return await handleConfirmPay(req, res)
      case 'order-status':
        return await handleOrderStatus(req, res)
      case 'user-status':
        return await handleUserStatus(req, res)
      default:
        return res.status(400).json({ error: '未知操作' })
    }
  } catch (err: unknown) {
    console.error('[Pay Error]', err)
    return res.status(500).json({ error: '服务错误' })
  }
}

// ========== 创建订单 ==========
async function handleCreateOrder(req: VercelRequest, res: VercelResponse) {
  const { userId, plan } = req.body

  if (!userId || !plan) {
    return res.status(400).json({ error: '缺少参数' })
  }
  if (!PRICES[plan]) {
    return res.status(400).json({ error: '无效套餐' })
  }

  const { v4: uuidv4 } = await import('uuid')
  const orderId = uuidv4()
  const price = PRICES[plan]

  createOrder({
    id: orderId,
    user_id: userId,
    plan,
    amount: price.amount,
    channel: 'qrcode',
    status: 'pending',
    trade_no: '',
    created_at: new Date().toISOString().replace('T', ' ').replace(/\.\d+Z$/, ''),
    paid_at: '',
  })

  return res.json({
    orderId,
    amount: price.amount,
    description: price.label,
    payHint: `请扫码支付 ¥${(price.amount / 100).toFixed(1)}，付款备注填写：${orderId.slice(-6)}`,
    orderSuffix: orderId.slice(-6),
  })
}

// ========== 用户确认已付款 ==========
async function handleConfirmPay(req: VercelRequest, res: VercelResponse) {
  const { orderId, userId } = req.body

  if (!orderId || !userId) {
    return res.status(400).json({ error: '缺少参数' })
  }

  const order = findOrderByIdAndUser(orderId, userId)

  if (!order) {
    return res.status(404).json({ error: '订单不存在' })
  }

  if (order.status === 'paid') {
    return res.json({ success: true, message: '已支付' })
  }

  // 标记为待确认，然后自动确认（MVP 简化流程）
  const now = new Date().toISOString().replace('T', ' ').replace(/\.\d+Z$/, '')
  updateOrderStatus(orderId, 'confirming', undefined, now)
  updateOrderStatus(orderId, 'paid', `manual_${Date.now()}`, now)

  updateUserPlan(userId, order.plan)

  return res.json({ success: true, plan: order.plan })
}

// ========== 查询订单状态 ==========
async function handleOrderStatus(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: '缺少订单 ID' })
  }

  const { findOrderById } = await import('./_db')
  const order = findOrderById(id)

  if (!order) {
    return res.status(404).json({ error: '订单不存在' })
  }

  return res.json({
    id: order.id,
    plan: order.plan,
    amount: order.amount,
    status: order.status,
    created_at: order.created_at,
    paid_at: order.paid_at,
  })
}

// ========== 查询用户付费状态 ==========
async function handleUserStatus(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: '缺少用户 ID' })
  }

  const { findUserById } = await import('./_db')
  const user = findUserById(id)

  return res.json({
    plan: user?.plan || 'free',
    isPaid: user?.plan !== undefined && user.plan !== 'free',
  })
}
