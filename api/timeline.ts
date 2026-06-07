import type { VercelRequest, VercelResponse } from '@vercel/node'
import { initDB, getDB } from './_db'

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
        return await createUser(req, res)
      case 'timeline':
        return await getTimeline(req, res)
      case 'upload':
        return await uploadNode(req, res)
      case 'update':
        return await updateNode(req, res)
      case 'delete':
        return await deleteNode(req, res)
      default:
        return res.status(400).json({ error: '未知操作' })
    }
  } catch (err: any) {
    console.error('[Timeline Error]', err)
    return res.status(500).json({ error: '服务错误' })
  }
}

async function createUser(req: VercelRequest, res: VercelResponse) {
  const { openId, nickname } = req.body
  const db = getDB()

  let user = db.prepare('SELECT * FROM users WHERE open_id = ?').get(openId) as any
  if (!user) {
    const { v4: uuidv4 } = await import('uuid')
    const userId = uuidv4()
    db.prepare('INSERT INTO users (id, open_id, nickname) VALUES (?, ?, ?)').run(userId, openId, nickname || '用户')
    user = { id: userId, plan: 'free', nickname: nickname || '用户' }
  }

  return res.json({ userId: user.id, plan: user.plan, nickname: user.nickname })
}

async function getTimeline(req: VercelRequest, res: VercelResponse) {
  const { userId } = req.query
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: '缺少用户 ID' })
  }

  const db = getDB()
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any
  if (!user) return res.status(404).json({ error: '用户不存在' })

  const nodes = db.prepare('SELECT * FROM timeline_nodes WHERE user_id = ? ORDER BY sort_order ASC').all(userId)
  const totalNodes = nodes.length
  const nodesWithPosition = (nodes as any[]).map((node, index) => ({
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

async function uploadNode(req: VercelRequest, res: VercelResponse) {
  const { userId, year, title, description, imageUrl } = req.body

  if (!userId) return res.status(400).json({ error: '缺少用户 ID' })

  const { v4: uuidv4 } = await import('uuid')
  const db = getDB()
  const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM timeline_nodes WHERE user_id = ?').get(userId) as any
  const sortOrder = (maxOrder?.max || 0) + 1

  // 本地 AI 模板生成文案
  const aiDesc = description || generateLocalDescription(year, title)

  const nodeId = uuidv4()
  db.prepare(`
    INSERT INTO timeline_nodes (id, user_id, year, title, description, image_url, sort_order, ai_generated)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(nodeId, userId, year || null, title || '未命名时刻', aiDesc, imageUrl || '', sortOrder, description ? 0 : 1)

  return res.json({
    id: nodeId,
    year: year || null,
    title: title || '未命名时刻',
    description: aiDesc,
    imageUrl: imageUrl || '',
    aiGenerated: !description,
  })
}

async function updateNode(req: VercelRequest, res: VercelResponse) {
  const { nodeId, year, title, description } = req.body
  if (!nodeId) return res.status(400).json({ error: '缺少节点 ID' })

  const db = getDB()
  db.prepare('UPDATE timeline_nodes SET year=?, title=?, description=?, updated_at=datetime(\'now\') WHERE id=?')
    .run(year, title, description, nodeId)

  return res.json({ success: true })
}

async function deleteNode(req: VercelRequest, res: VercelResponse) {
  const { nodeId } = req.query
  if (!nodeId || typeof nodeId !== 'string') return res.status(400).json({ error: '缺少节点 ID' })

  const db = getDB()
  db.prepare('DELETE FROM timeline_nodes WHERE id = ?').run(nodeId)
  return res.json({ success: true })
}

// ========== 本地 AI 文案模板（零外部依赖） ==========
function generateLocalDescription(year?: number, title?: string): string {
  const y = year || new Date().getFullYear()
  const t = title || ''

  const templates: Record<string, string[]> = {
    '出生': [
      `一声啼哭划破了${y}年的清晨，你带着全家的期盼来到这个世界。小小的拳头紧握着，仿佛在说：我来了。`,
      `${y}年，你来了。从此，这个世界上多了一个让所有人牵挂的小生命。`,
    ],
    '降生': [
      `一声啼哭划破了${y}年的清晨，你带着全家的期盼来到这个世界。小小的拳头紧握着，仿佛在说：我来了。`,
    ],
    '求学': [
      `背着比身体还大的书包，踏进了校门。黑板上的粉笔字，操场上的欢笑声，${y}年的校园时光，是生命中最纯粹的章节。`,
      `${y}年，知识的大门为你打开。那些挑灯夜读的日子，后来都变成了最珍贵的回忆。`,
    ],
    '青春': [
      `${y}年的夏天，阳光热烈而滚烫。篮球场上的汗水，课桌下的纸条，青春就是这样，来不及好好告别就散场了。`,
    ],
    '工作': [
      `${y}年，你第一次穿上正装走进写字楼。城市很大，你很小，但你的眼睛里有光。`,
      `初入职场的${y}年，加班到深夜的出租车上，你看着窗外的霓虹灯，心想：这就是大人的世界吗？`,
    ],
    '职场': [
      `${y}年，你第一次穿上正装走进写字楼。城市很大，你很小，但你的眼睛里有光。`,
    ],
    '遇见': [
      `${y}年的某个午后，你遇见了那个让心跳漏了一拍的人。从此，所有的巧合都有了意义。`,
      `有些人，一旦遇见便是一生。${y}年，命运把你带到了我面前。`,
    ],
    '恋爱': [
      `${y}年，你终于明白了那些情歌里唱的是什么。牵手的温度，对视的心跳，原来爱情是这个样子。`,
    ],
    '结婚': [
      `${y}年，你说出了那句"我愿意"。从此，一个人的路变成了两个人的家。`,
      `白纱、红毯、誓言和泪水。${y}年的这一天，你们把彼此的名字写进了对方的人生。`,
    ],
    '宠物': [
      `${y}年的秋天，一个小家伙怯怯地探出脑袋。湿漉漉的眼睛望着你，也望进了你的心里。从此，家里多了一个永远在门口等你的小家伙。`,
      `那个${y}年的午后，你把它抱回家的那一刻，它就成了你生命中最柔软的部分。`,
    ],
    '猫': [
      `${y}年，一只小猫跳进了你的生活。它高冷、傲娇，却总在你难过的时候蹭过来。`,
    ],
    '狗': [
      `${y}年，一只小狗摇着尾巴跑向你。从那天起，你的每一次回家都变成了最幸福的时刻。`,
    ],
    '宝宝': [
      `${y}年，你第一次当上了父母。那个小小的生命，让你明白了什么叫做无条件的爱。`,
    ],
    '父母': [
      `${y}年，你抱着自己的宝宝，突然理解了父母当年的心情。原来爱，是会遗传的。`,
    ],
    '搬家': [
      `${y}年，你搬进了新家。钥匙转动锁芯的声音，是生活给你的新承诺。`,
    ],
    '旅行': [
      `${y}年，你踏上了旅途。陌生的城市，未知的风景，每一步都在拓展生命的边界。`,
    ],
    '挫折': [
      `${y}年，生活给了你一记重拳。但你知道，黎明前的黑暗最深沉，而你的故事还远没有结束。`,
    ],
    '风雨': [
      `${y}年，风雨来了。但你们手牵着手，一起走过。那些一起扛过的日子，反而成了最深的羁绊。`,
    ],
    '幸福': [
      `${y}年的幸福，不是轰轰烈烈的大事，而是清晨的阳光、晚上的热汤、和身边人安静的微笑。`,
    ],
    '岁月': [
      `${y}年，你学会了和岁月和解。不再追逐远方的风景，而是珍惜眼前的每一个平凡日子。`,
    ],
    '退休': [
      `${y}年，你终于放下了忙碌了大半辈子的工作。回头看，那些年的辛苦，都变成了此刻的从容。`,
    ],
  }

  // 按关键词匹配
  for (const [key, pool] of Object.entries(templates)) {
    if (t.includes(key)) {
      return pool[Math.floor(Math.random() * pool.length)]
    }
  }

  // 默认模板
  const defaults = [
    `那是${y}年的故事，时光在那一刻定格，成为星轨上永恒的光点。每一个瞬间都值得被铭记，每一段经历都是生命中最珍贵的篇章。`,
    `${y}年，平凡的日子里藏着不平凡的感动。这一刻的温暖，将永远镌刻在记忆的星河中。`,
    `岁月流转，${y}年的这一刻如同星空中最亮的那颗星，照亮了来时的路，也温暖了前行的方向。`,
  ]
  return defaults[Math.floor(Math.random() * defaults.length)]
}
