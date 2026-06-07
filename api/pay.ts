import type { VercelRequest, VercelResponse } from '@vercel/node'
import { initDB, getDB } from './_db'

// 初始化数据库
initDB()

// 价格配置
const PRICES: Record<string, { amount: number; label: string }> = {
  full: { amount: 1990, label: '完整版 ¥19.9' },
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
        return await createOrder(req, res)
      case 'confirm-pay':
        return await confirmPay(req, res)
      case 'order-status':
        return await orderStatus(req, res)
      case 'user-status':
        return await userStatus(req, res)
      default:
        return res.status(400).json({ error: '未知操作' })
    }
  } catch (err: any) {
    console.error('[Pay Error]', err)
    return res.status(500).json({ error: '服务错误' })
  }
}

// ========== 创建订单 ==========
async function createOrder(req: VercelRequest, res: VercelResponse) {
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

  const db = getDB()
  db.prepare(`
    INSERT INTO orders (id, user_id, plan, amount, channel, status)
    VALUES (?, ?, ?, ?, 'qrcode', 'pending')
  `).run(orderId, userId, plan, price.amount)

  return res.json({
    orderId,
    amount: price.amount,
    description: price.label,
    // 前端展示收款二维码，用户扫码付款
    // 付款后在备注中填写订单号后6位
    payHint: `请扫码支付 ¥${(price.amount / 100).toFixed(1)}，付款备注填写：${orderId.slice(-6)}`,
    orderSuffix: orderId.slice(-6),
  })
}

// ========== 用户确认已付款 ==========
async function confirmPay(req: VercelRequest, res: VercelResponse) {
  const { orderId, userId } = req.body

  if (!orderId || !userId) {
    return res.status(400).json({ error: '缺少参数' })
  }

  const db = getDB()
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(orderId, userId) as any

  if (!order) {
    return res.status(404).json({ error: '订单不存在' })
  }

  if (order.status === 'paid') {
    return res.json({ success: true, message: '已支付' })
  }

  // 标记为待确认（用户声称已付款，等管理员确认）
  db.prepare(`
    UPDATE orders SET status = 'confirming', paid_at = datetime('now')
    WHERE id = ?
  `).run(orderId)

  // 自动确认：为 MVP 简化流程，用户确认即视为支付成功
  // 生产环境可改为管理员手动确认
  db.prepare(`
    UPDATE orders SET status = 'paid', trade_no = ?
    WHERE id = ?
  `).run(`manual_${Date.now()}`, orderId)

  db.prepare(`
    UPDATE users SET plan = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(order.plan, userId)

  return res.json({ success: true, plan: order.plan })
}

// ========== 查询订单状态 ==========
async function orderStatus(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: '缺少订单 ID' })
  }

  const db = getDB()
  const order = db.prepare('SELECT id, plan, amount, status, created_at, paid_at FROM orders WHERE id = ?').get(id) as any

  if (!order) {
    return res.status(404).json({ error: '订单不存在' })
  }

  return res.json(order)
}

// ========== 查询用户付费状态 ==========
async function userStatus(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: '缺少用户 ID' })
  }

  const db = getDB()
  const user = db.prepare('SELECT plan FROM users WHERE id = ?').get(id) as any

  return res.json({
    plan: user?.plan || 'free',
    isPaid: user?.plan && user.plan !== 'free',
  })
}
