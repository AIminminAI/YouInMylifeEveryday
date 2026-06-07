// API 基础路径（Vercel 部署后自动同域，开发环境走本地）
const API_BASE = import.meta.env.VITE_API_URL || '/api'

// ========== 用户 ==========
export async function createOrGetUser(openId: string, nickname?: string) {
  const res = await fetch(`${API_BASE}/timeline?action=create-user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ openId, nickname }),
  })
  return res.json()
}

export async function getUserTimeline(userId: string) {
  const res = await fetch(`${API_BASE}/timeline?action=timeline&userId=${userId}`)
  return res.json()
}

// ========== 支付（收款码模式） ==========
export interface CreateOrderResult {
  orderId: string
  amount: number
  description: string
  payHint: string
  orderSuffix: string
}

export async function createOrder(userId: string, plan: 'full' | 'premium') {
  const res = await fetch(`${API_BASE}/pay?action=create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, plan }),
  })
  return res.json() as Promise<CreateOrderResult>
}

export async function confirmPay(orderId: string, userId: string) {
  const res = await fetch(`${API_BASE}/pay?action=confirm-pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, userId }),
  })
  return res.json()
}

export async function getOrderStatus(orderId: string) {
  const res = await fetch(`${API_BASE}/pay?action=order-status&id=${orderId}`)
  return res.json()
}

export async function getPaymentStatus(userId: string) {
  const res = await fetch(`${API_BASE}/pay?action=user-status&id=${userId}`)
  return res.json()
}

// ========== 时间线节点 ==========
export async function addTimelineNode(
  userId: string,
  data: { year?: number; title?: string; description?: string; imageUrl?: string }
) {
  const res = await fetch(`${API_BASE}/timeline?action=upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, ...data }),
  })
  return res.json()
}

export async function updateNode(
  nodeId: string,
  data: { year?: number; title?: string; description?: string }
) {
  const res = await fetch(`${API_BASE}/timeline?action=update`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nodeId, ...data }),
  })
  return res.json()
}

export async function deleteNode(nodeId: string) {
  const res = await fetch(`${API_BASE}/timeline?action=delete&nodeId=${nodeId}`, {
    method: 'DELETE',
  })
  return res.json()
}

// ========== 支付轮询 ==========
export function pollOrderStatus(
  orderId: string,
  onPaid: () => void,
  interval = 2000,
  maxAttempts = 60
): () => void {
  let attempts = 0
  const timer = setInterval(async () => {
    attempts++
    try {
      const order = await getOrderStatus(orderId)
      if (order.status === 'paid') {
        clearInterval(timer)
        onPaid()
      }
    } catch { /* ignore */ }
    if (attempts >= maxAttempts) clearInterval(timer)
  }, interval)
  return () => clearInterval(timer)
}
