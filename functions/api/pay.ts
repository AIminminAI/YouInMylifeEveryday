import {
  createOrderRecord,
  findOrderByIdAndUser,
  updateOrderStatus,
  updateUserPlan,
  findOrderById,
  findUserById,
} from './_db'

const PRICES: Record<string, { amount: number; label: string }> = {
  full: { amount: 1990, label: '高级版 ¥19.9' },
  premium: { amount: 9900, label: '纪念版 ¥99' },
}

function simpleId(): string {
  return 'xxxx-xxxx-xxxx'.replace(/x/g, () => Math.floor(Math.random() * 16).toString(16))
}

function jsonResp(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export const onRequest: PagesFunction = async (context) => {
  const { request } = context
  const url = new URL(request.url)
  const action = url.searchParams.get('action')

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }

  try {
    if (action === 'create-order' && request.method === 'POST') {
      const body = await request.json() as { userId: string; plan: string }
      const { userId, plan } = body
      if (!userId || !plan || !PRICES[plan]) {
        return jsonResp({ error: '参数错误' }, 400)
      }
      const orderId = simpleId() + '-' + Date.now()
      const price = PRICES[plan]
      createOrderRecord({
        id: orderId, user_id: userId, plan, amount: price.amount,
        channel: 'qrcode', status: 'pending', trade_no: '',
        created_at: new Date().toISOString(), paid_at: '',
      })
      return jsonResp({
        orderId, amount: price.amount, description: price.label,
        payHint: '请扫码支付 ¥' + (price.amount / 100).toFixed(1) + '，备注：' + orderId.slice(-6),
        orderSuffix: orderId.slice(-6),
      })
    }

    if (action === 'confirm-pay' && request.method === 'POST') {
      const body = await request.json() as { orderId: string; userId: string }
      const { orderId, userId } = body
      if (!orderId || !userId) return jsonResp({ error: '参数错误' }, 400)
      const order = findOrderByIdAndUser(orderId, userId)
      if (!order) return jsonResp({ error: '订单不存在' }, 404)
      if (order.status === 'paid') return jsonResp({ success: true, plan: order.plan })
      const now = new Date().toISOString()
      updateOrderStatus(orderId, 'paid', 'manual_' + Date.now(), now)
      updateUserPlan(userId, order.plan)
      return jsonResp({ success: true, plan: order.plan })
    }

    if (action === 'order-status') {
      const id = url.searchParams.get('id')
      if (!id) return jsonResp({ error: '缺少 ID' }, 400)
      const order = findOrderById(id)
      if (!order) return jsonResp({ error: '订单不存在' }, 404)
      return jsonResp({ id: order.id, plan: order.plan, amount: order.amount, status: order.status })
    }

    if (action === 'user-status') {
      const id = url.searchParams.get('id')
      if (!id) return jsonResp({ error: '缺少 ID' }, 400)
      const user = findUserById(id)
      return jsonResp({ plan: user ? user.plan : 'free', isPaid: !!(user && user.plan !== 'free') })
    }

    return jsonResp({ error: '未知操作' }, 400)
  } catch (err) {
    console.error('[Pay Error]', err)
    return jsonResp({ error: '服务错误' }, 500)
  }
}
