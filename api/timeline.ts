import type { VercelRequest, VercelResponse } from '@vercel/node'
import { initDB, findUserByOpenId, findUserById, createUser, findNodesByUserId, createNode, updateNode, deleteNode, getMaxSortOrder } from './_db'

initDB()

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { action } = req.query

  try {
    switch (action) {
      case 'create-user':
        return await handleCreateUser(req, res)
      case 'timeline':
        return await handleGetTimeline(req, res)
      case 'upload':
        return await handleUploadNode(req, res)
      case 'update':
        return await handleUpdateNode(req, res)
      case 'delete':
        return await handleDeleteNode(req, res)
      default:
        return res.status(400).json({ error: '未知操作' })
    }
  } catch (err: unknown) {
    console.error('[Timeline Error]', err)
    return res.status(500).json({ error: '服务错误' })
  }
}

async function handleCreateUser(req: VercelRequest, res: VercelResponse) {
  const { openId, nickname } = req.body

  let user = findUserByOpenId(openId)
  if (!user) {
    const { v4: uuidv4 } = await import('uuid')
    const userId = uuidv4()
    user = createUser(userId, openId, nickname || '用户')
  }

  return res.json({ userId: user.id, plan: user.plan, nickname: user.nickname })
}

async function handleGetTimeline(req: VercelRequest, res: VercelResponse) {
  const { userId } = req.query
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: '缺少用户 ID' })
  }

  const user = findUserById(userId)
  if (!user) return res.status(404).json({ error: '用户不存在' })

  const nodes = findNodesByUserId(userId)
  const totalNodes = nodes.length
  const nodesWithPosition = nodes.map((node, index) => ({
    ...node,
    curvePosition: totalNodes <= 1 ? 0 : index / (totalNodes - 1),
  }))

  return res.json({
    title: `${user.nickname || '我'}的星轨`,
    subtitle: '那些年，我们一起走过的时光',
    nodes: nodesWithPosition,
    plan: user.plan,
  })
}

async function handleUploadNode(req: VercelRequest, res: VercelResponse) {
  const { userId, year, title, description, imageUrl } = req.body

  if (!userId) return res.status(400).json({ error: '缺少用户 ID' })

  const { v4: uuidv4 } = await import('uuid')
  const sortOrder = getMaxSortOrder(userId) + 1

  const aiDesc = description || generateLocalDescription(year, title)

  const nodeId = uuidv4()
  const now = new Date().toISOString().replace('T', ' ').replace(/\.\d+Z$/, '')
  createNode({
    id: nodeId,
    user_id: userId,
    year: year || null,
    title: title || '未命名时刻',
    description: aiDesc,
    image_url: imageUrl || '',
    sort_order: sortOrder,
    ai_generated: description ? 0 : 1,
    created_at: now,
    updated_at: now,
  })

  return res.json({
    id: nodeId,
    year: year || null,
    title: title || '未命名时刻',
    description: aiDesc,
    imageUrl: imageUrl || '',
    aiGenerated: !description,
  })
}

async function handleUpdateNode(req: VercelRequest, res: VercelResponse) {
  const { nodeId, year, title, description } = req.body
  if (!nodeId) return res.status(400).json({ error: '缺少节点 ID' })

  updateNode(nodeId, year, title, description)

  return res.json({ success: true })
}

async function handleDeleteNode(req: VercelRequest, res: VercelResponse) {
  const { nodeId } = req.query
  if (!nodeId || typeof nodeId !== 'string') return res.status(400).json({ error: '缺少节点 ID' })

  deleteNode(nodeId)
  return res.json({ success: true })
}

// ========== 本地 AI 文案模板（零外部依赖） ==========
function generateLocalDescription(year?: number, title?: string): string {
  const y = year || new Date().getFullYear()
  const t = title || ''

  const templates: Record<string, string[]> = {
    '出生': [
      `${y}年，你来到了这个世界。`,
      `${y}年，一个新的生命诞生了。`,
    ],
    '上学': [
      `${y}年，你踏进了校门，开始了求学的旅程。`,
      `${y}年，背着书包走进校园，知识的种子从此生根。`,
    ],
    '毕业': [
      `${y}年，毕业了。校园里的日子成为回忆，新的篇章即将开始。`,
      `${y}年，告别校园，带着知识和梦想走向远方。`,
    ],
    '工作': [
      `${y}年，你走进了职场，开始了新的征程。`,
      `${y}年，第一份工作，第一次独立面对社会。`,
    ],
    '恋爱': [
      `${y}年，你遇见了那个特别的人。`,
      `${y}年，生活里多了一份甜蜜的牵挂。`,
    ],
    '养宠': [
      `${y}年，家里多了一个毛茸茸的小家伙。`,
      `${y}年，一只小动物走进了你的生活，带来了许多温暖。`,
    ],
    '结婚': [
      `${y}年，你们走进了婚姻的殿堂。`,
      `${y}年，两个人的故事有了新的开始。`,
    ],
    '为人父母': [
      `${y}年，你成为了一名父母，生命有了新的意义。`,
      `${y}年，一个新生命的到来，让一切都不一样了。`,
    ],
    '中年': [
      `${y}年，你学会了与生活和解，珍惜眼前的每一天。`,
      `${y}年，经历了风雨，更懂得平淡中的幸福。`,
    ],
    '暮年': [
      `${y}年，回望来路，每一步都值得。`,
      `${y}年，岁月沉淀下来的，是最珍贵的记忆。`,
    ],
  }

  for (const [key, pool] of Object.entries(templates)) {
    if (t.includes(key)) {
      return pool[Math.floor(Math.random() * pool.length)]
    }
  }

  const defaults = [
    `${y}年，生命中值得铭记的一年。`,
    `${y}年，平凡的日子里藏着不平凡的意义。`,
    `${y}年，这一刻值得被记录。`,
  ]
  return defaults[Math.floor(Math.random() * defaults.length)]
}
