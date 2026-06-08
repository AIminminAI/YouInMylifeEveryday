// 纯内存存储（Vercel Serverless 无状态，每次冷启动数据会清空）
// 对于 MVP 阶段足够，付费状态由前端 localStorage 维护

const users = {}
const orders = {}

export function findUserById(userId) {
  return users[userId]
}

export function getOrCreateUser(userId) {
  if (!users[userId]) {
    users[userId] = { id: userId, plan: 'free' }
  }
  return users[userId]
}

export function updateUserPlan(userId, plan) {
  const user = getOrCreateUser(userId)
  user.plan = plan
}

export function createOrderRecord(order) {
  orders[order.id] = order
}

export function findOrderById(orderId) {
  return orders[orderId]
}

export function findOrderByIdAndUser(orderId, userId) {
  const order = orders[orderId]
  if (order && order.user_id === userId) return order
  return undefined
}

export function updateOrderStatus(orderId, status, tradeNo, paidAt) {
  const order = orders[orderId]
  if (order) {
    order.status = status
    order.trade_no = tradeNo
    order.paid_at = paidAt
  }
}
