import { Router, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { createOrder, findOrderById, findUserById, updateOrderStatus, updateUserPlan } from '../db'

const router = Router()

// ========== 价格配置 ==========
const PRICES: Record<string, { amount: number; label: string }> = {
  full: { amount: 1990, label: '高级版 ¥19.9' },
  premium: { amount: 9900, label: '纪念版 ¥99' },
}

// ========== 创建订单 ==========
router.post('/create-order', (req: Request, res: Response) => {
  try {
    const { userId, plan, channel } = req.body

    if (!userId || !plan || !channel) {
      return res.status(400).json({ error: '缺少必要参数' })
    }

    if (!PRICES[plan]) {
      return res.status(400).json({ error: '无效的套餐类型' })
    }

    if (!['wechat', 'alipay'].includes(channel)) {
      return res.status(400).json({ error: '无效的支付渠道' })
    }

    const orderId = uuidv4()
    const price = PRICES[plan]
    const now = new Date().toISOString().replace('T', ' ').replace(/\.\d+Z$/, '')

    createOrder({
      id: orderId,
      user_id: userId,
      plan,
      amount: price.amount,
      channel,
      status: 'pending',
      trade_no: '',
      created_at: now,
      paid_at: '',
    })

    // 根据支付渠道生成支付参数
    if (channel === 'wechat') {
      return generateWechatPay(orderId, price.amount)
    } else {
      return generateAlipay(orderId, price.amount)
    }

    async function generateWechatPay(orderId: string, amount: number) {
      const appId = process.env.WECHAT_APP_ID
      const mchId = process.env.WECHAT_MCH_ID

      if (!appId || !mchId) {
        return res.json({
          orderId,
          channel: 'wechat',
          devMode: true,
          prepayId: `mock_prepay_${orderId}`,
          timeStamp: String(Math.floor(Date.now() / 1000)),
          nonceStr: uuidv4().replace(/-/g, ''),
          package: `prepay_id=mock_prepay_${orderId}`,
          signType: 'RSA',
          paySign: 'mock_sign',
          amount,
          description: PRICES[plan].label,
        })
      }

      return res.json({
        orderId,
        channel: 'wechat',
        devMode: true,
        message: '请配置微信支付商户证书',
        prepayId: `prep_${orderId}`,
        timeStamp: String(Math.floor(Date.now() / 1000)),
        nonceStr: uuidv4().replace(/-/g, ''),
        package: `prepay_id=prep_${orderId}`,
        signType: 'RSA',
        paySign: 'mock',
        amount,
      })
    }

    async function generateAlipay(orderId: string, amount: number) {
      const appId = process.env.ALIPAY_APP_ID

      if (!appId) {
        return res.json({
          orderId,
          channel: 'alipay',
          devMode: true,
          payUrl: `https://openapi.alipay.com/gateway.do?mock=true&orderId=${orderId}`,
          amount,
          description: PRICES[plan].label,
        })
      }

      return res.json({
        orderId,
        channel: 'alipay',
        devMode: true,
        payUrl: `https://openapi.alipay.com/gateway.do?mock=true&orderId=${orderId}`,
        amount,
      })
    }
  } catch (err: unknown) {
    console.error('[Pay] 创建订单失败:', err)
    return res.status(500).json({ error: '创建订单失败' })
  }
})

// ========== 微信支付回调 ==========
router.post('/wechat/notify', (req: Request, res: Response) => {
  try {
    const { event_type } = req.body

    if (event_type === 'TRANSACTION.SUCCESS') {
      const orderId = req.body.orderId || req.query.orderId
      if (orderId && typeof orderId === 'string') {
        handlePaymentSuccess(orderId, 'wechat', '')
      }
    }

    res.json({ code: 'SUCCESS', message: '成功' })
  } catch (err) {
    console.error('[WeChat Notify] 处理失败:', err)
    res.status(500).json({ code: 'FAIL', message: '处理失败' })
  }
})

// ========== 支付宝回调 ==========
router.post('/alipay/notify', (req: Request, res: Response) => {
  try {
    const { out_trade_no, trade_no, trade_status } = req.body

    if (trade_status === 'TRADE_SUCCESS' || trade_status === 'TRADE_FINISHED') {
      handlePaymentSuccess(out_trade_no, 'alipay', trade_no)
    }

    res.send('success')
  } catch (err) {
    console.error('[Alipay Notify] 处理失败:', err)
    res.send('fail')
  }
})

// ========== 查询订单状态 ==========
router.get('/order/:orderId', (req: Request, res: Response) => {
  try {
    const order = findOrderById(req.params.orderId)

    if (!order) {
      return res.status(404).json({ error: '订单不存在' })
    }

    return res.json({
      orderId: order.id,
      plan: order.plan,
      amount: order.amount,
      channel: order.channel,
      status: order.status,
      createdAt: order.created_at,
      paidAt: order.paid_at,
    })
  } catch (err) {
    return res.status(500).json({ error: '查询失败' })
  }
})

// ========== 查询用户付费状态 ==========
router.get('/status/:userId', (req: Request, res: Response) => {
  try {
    const user = findUserById(req.params.userId)

    return res.json({
      plan: user?.plan || 'free',
      isPaid: user?.plan !== undefined && user.plan !== 'free',
    })
  } catch (err) {
    return res.status(500).json({ error: '查询失败' })
  }
})

// ========== 开发环境：模拟支付成功 ==========
router.post('/dev/simulate-pay', (req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: '生产环境不可用' })
  }

  const { orderId } = req.body
  if (!orderId) {
    return res.status(400).json({ error: '缺少 orderId' })
  }

  handlePaymentSuccess(orderId, 'dev', `dev_${Date.now()}`)
  return res.json({ success: true })
})

// ========== 支付成功处理 ==========
function handlePaymentSuccess(orderId: string, channel: string, tradeNo: string) {
  const order = findOrderById(orderId)
  if (!order || order.status === 'paid') return

  const now = new Date().toISOString().replace('T', ' ').replace(/\.\d+Z$/, '')
  updateOrderStatus(orderId, 'paid', tradeNo, now)
  updateUserPlan(order.user_id, order.plan)

  console.log(`[Pay] 支付成功: orderId=${orderId}, plan=${order.plan}, channel=${channel}`)
}

export default router
