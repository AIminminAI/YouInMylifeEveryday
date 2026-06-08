// 纯内存存储（Vercel Serverless 无状态，每次冷启动数据会清空）
// 对于 MVP 阶段足够，付费状态由前端 localStorage 维护

const users = {}
const orders = {}

function findUserById(userId) {
  return users[userId]
}

function getOrCreateUser(userId) {
  if (!users[userId]) {
    users[userId] = { id: userId, plan: 'free' }
  }
  return users[userId]
}

function updateUserPlan(userId, plan) {
  const user = getOrCreateUser(userId)
  user.plan = plan
}

function createOrderRecord(order) {
  orders[order.id] = order
}

function findOrderById(orderId) {
  return orders[orderId]
}

function findOrderByIdAndUser(orderId, userId) {
  const order = orders[orderId]
  if (order && order.user_id === userId) return order
  return undefined
}

function updateOrderStatus(orderId, status, tradeNo, paidAt) {
  const order = orders[orderId]
  if (order) {
    order.status = status
    order.trade_no = tradeNo
    order.paid_at = paidAt
  }
}

module.exports = {
  findUserById,
  getOrCreateUser,
  updateUserPlan,
  createOrderRecord,
  findOrderById,
  findOrderByIdAndUser,
  updateOrderStatus,
}
