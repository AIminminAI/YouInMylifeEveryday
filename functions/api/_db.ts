// 纯内存存储（Serverless 无状态，每次冷启动数据会清空）
// 对于 MVP 阶段足够，付费状态由前端 localStorage 维护

interface UserData {
  id: string
  plan: string
}

interface OrderData {
  id: string
  user_id: string
  plan: string
  amount: number
  channel: string
  status: string
  trade_no: string
  created_at: string
  paid_at: string
}

const users: Record<string, UserData> = {}
const orders: Record<string, OrderData> = {}

export function findUserById(userId: string): UserData | undefined {
  return users[userId]
}

export function getOrCreateUser(userId: string): UserData {
  if (!users[userId]) {
    users[userId] = { id: userId, plan: 'free' }
  }
  return users[userId]
}

export function updateUserPlan(userId: string, plan: string): void {
  const user = getOrCreateUser(userId)
  user.plan = plan
}

export function createOrderRecord(order: OrderData): void {
  orders[order.id] = order
}

export function findOrderById(orderId: string): OrderData | undefined {
  return orders[orderId]
}

export function findOrderByIdAndUser(orderId: string, userId: string): OrderData | undefined {
  const order = orders[orderId]
  if (order && order.user_id === userId) return order
  return undefined
}

export function updateOrderStatus(orderId: string, status: string, tradeNo: string, paidAt: string): void {
  const order = orders[orderId]
  if (order) {
    order.status = status
    order.trade_no = tradeNo
    order.paid_at = paidAt
  }
}
