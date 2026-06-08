const {
  createOrderRecord,
  findOrderByIdAndUser,
  updateOrderStatus,
  updateUserPlan,
  findOrderById,
  findUserById,
} = require('./_db.cjs')

const PRICES = {
  full: { amount: 1990, label: '高级版 ¥19.9' },
  premium: { amount: 9900, label: '纪念版 ¥99' },
}

function simpleId() {
  return 'xxxx-xxxx-xxxx'.replace(/x/g, () => Math.floor(Math.random() * 16).toString(16))
}

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const action = req.query.action

  try {
    if (action === 'create-order' && req.method === 'POST') {
      const { userId, plan } = req.body
      if (!userId || !plan || !PRICES[plan]) {
        return res.status(400).json({ error: '参数错误' })
      }
      const orderId = simpleId() + '-' + Date.now()
      const price = PRICES[plan]
      createOrderRecord({
        id: orderId, user_id: userId, plan, amount: price.amount,
        channel: 'qrcode', status: 'pending', trade_no: '',
        created_at: new Date().toISOString(), paid_at: '',
      })
      return res.json({
        orderId, amount: price.amount, description: price.label,
        payHint: '请扫码支付 ¥' + (price.amount / 100).toFixed(1) + '，备注：' + orderId.slice(-6),
        orderSuffix: orderId.slice(-6),
      })
    }

    if (action === 'confirm-pay' && req.method === 'POST') {
      const { orderId, userId } = req.body
      if (!orderId || !userId) return res.status(400).json({ error: '参数错误' })
      const order = findOrderByIdAndUser(orderId, userId)
      if (!order) return res.status(404).json({ error: '订单不存在' })
      if (order.status === 'paid') return res.json({ success: true, plan: order.plan })
      const now = new Date().toISOString()
      updateOrderStatus(orderId, 'paid', 'manual_' + Date.now(), now)
      updateUserPlan(userId, order.plan)
      return res.json({ success: true, plan: order.plan })
    }

    if (action === 'order-status') {
      const id = req.query.id
      if (!id) return res.status(400).json({ error: '缺少 ID' })
      const order = findOrderById(id)
      if (!order) return res.status(404).json({ error: '订单不存在' })
      return res.json({ id: order.id, plan: order.plan, amount: order.amount, status: order.status })
    }

    if (action === 'user-status') {
      const id = req.query.id
      if (!id) return res.status(400).json({ error: '缺少 ID' })
      const user = findUserById(id)
      return res.json({ plan: user ? user.plan : 'free', isPaid: !!(user && user.plan !== 'free') })
    }

    return res.status(400).json({ error: '未知操作' })
  } catch (err) {
    console.error('[Pay Error]', err)
    return res.status(500).json({ error: '服务错误' })
  }
}
