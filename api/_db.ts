import fs from 'fs'
import path from 'path'

// Vercel Serverless 环境使用 /tmp 目录
const DB_DIR = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'data')
const DB_PATH = path.join(DB_DIR, 'starorbit.json')

// 数据结构类型定义
interface UserData {
  id: string
  open_id: string
  nickname: string
  avatar_url: string
  plan: string
  created_at: string
  updated_at: string
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

interface TimelineNodeData {
  id: string
  user_id: string
  year: number | null
  title: string
  description: string
  image_url: string
  sort_order: number
  ai_generated: number
  created_at: string
  updated_at: string
}

interface DBSchema {
  users: Record<string, UserData>
  orders: Record<string, OrderData>
  nodes: Record<string, TimelineNodeData>
}

// 内存缓存
let memoryDB: DBSchema | null = null

function getDefaultDB(): DBSchema {
  return {
    users: {},
    orders: {},
    nodes: {},
  }
}

function nowISO(): string {
  return new Date().toISOString().replace('T', ' ').replace(/\.\d+Z$/, '')
}

export function initDB(): DBSchema {
  if (memoryDB) return memoryDB

  // 确保目录存在
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true })
  }

  // 尝试从 JSON 文件加载
  if (fs.existsSync(DB_PATH)) {
    try {
      const raw = fs.readFileSync(DB_PATH, 'utf-8')
      memoryDB = JSON.parse(raw) as DBSchema
      return memoryDB
    } catch {
      // 文件损坏，使用默认数据
    }
  }

  memoryDB = getDefaultDB()
  saveToFile()
  return memoryDB
}

function saveToFile(): void {
  if (!memoryDB) return
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true })
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(memoryDB, null, 2), 'utf-8')
  } catch {
    // Vercel /tmp 可能不可写，静默失败
  }
}

export function getDB(): DBSchema {
  return initDB()
}

// ========== 用户操作 ==========

export function findUserByOpenId(openId: string): UserData | undefined {
  const db = getDB()
  return Object.values(db.users).find((u) => u.open_id === openId)
}

export function findUserById(userId: string): UserData | undefined {
  const db = getDB()
  return db.users[userId]
}

export function createUser(id: string, openId: string, nickname: string): UserData {
  const db = getDB()
  const user: UserData = {
    id,
    open_id: openId,
    nickname,
    avatar_url: '',
    plan: 'free',
    created_at: nowISO(),
    updated_at: nowISO(),
  }
  db.users[id] = user
  saveToFile()
  return user
}

export function updateUserPlan(userId: string, plan: string): void {
  const db = getDB()
  if (db.users[userId]) {
    db.users[userId].plan = plan
    db.users[userId].updated_at = nowISO()
    saveToFile()
  }
}

// ========== 订单操作 ==========

export function createOrderRecord(order: OrderData): void {
  const db = getDB()
  db.orders[order.id] = order
  saveToFile()
}

export function findOrderById(orderId: string): OrderData | undefined {
  const db = getDB()
  return db.orders[orderId]
}

export function findOrderByIdAndUser(orderId: string, userId: string): OrderData | undefined {
  const db = getDB()
  const order = db.orders[orderId]
  if (order && order.user_id === userId) return order
  return undefined
}

export function updateOrderStatus(orderId: string, status: string, tradeNo?: string, paidAt?: string): void {
  const db = getDB()
  if (db.orders[orderId]) {
    db.orders[orderId].status = status
    if (tradeNo) db.orders[orderId].trade_no = tradeNo
    if (paidAt) db.orders[orderId].paid_at = paidAt
    saveToFile()
  }
}

// ========== 时间线节点操作 ==========

export function findNodesByUserId(userId: string): TimelineNodeData[] {
  const db = getDB()
  return Object.values(db.nodes)
    .filter((n) => n.user_id === userId)
    .sort((a, b) => a.sort_order - b.sort_order)
}

export function createNode(node: TimelineNodeData): void {
  const db = getDB()
  db.nodes[node.id] = node
  saveToFile()
}

export function updateNode(nodeId: string, year: number | null, title: string, description: string): void {
  const db = getDB()
  if (db.nodes[nodeId]) {
    db.nodes[nodeId].year = year
    db.nodes[nodeId].title = title
    db.nodes[nodeId].description = description
    db.nodes[nodeId].updated_at = nowISO()
    saveToFile()
  }
}

export function deleteNode(nodeId: string): void {
  const db = getDB()
  delete db.nodes[nodeId]
  saveToFile()
}

export function getMaxSortOrder(userId: string): number {
  const nodes = findNodesByUserId(userId)
  if (nodes.length === 0) return 0
  return Math.max(...nodes.map((n) => n.sort_order))
}
