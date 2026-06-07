import { Router, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getDB } from '../db'

const router = Router()

// ========== 创建/获取用户 ==========
router.post('/user', (req: Request, res: Response) => {
  try {
    const { openId, nickname, avatarUrl } = req.body
    const db = getDB()

    // 查找已有用户
    let user = db.prepare('SELECT * FROM users WHERE open_id = ?').get(openId) as any

    if (!user) {
      const userId = uuidv4()
      db.prepare(`
        INSERT INTO users (id, open_id, nickname, avatar_url)
        VALUES (?, ?, ?, ?)
      `).run(userId, openId, nickname || '用户', avatarUrl || '')

      user = { id: userId, plan: 'free' }
    }

    return res.json({
      userId: user.id,
      plan: user.plan,
      nickname: user.nickname,
    })
  } catch (err) {
    return res.status(500).json({ error: '创建用户失败' })
  }
})

// ========== 获取用户时间线数据 ==========
router.get('/:userId', (req: Request, res: Response) => {
  try {
    const db = getDB()
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.userId) as any

    if (!user) {
      return res.status(404).json({ error: '用户不存在' })
    }

    const nodes = db.prepare(
      'SELECT * FROM timeline_nodes WHERE user_id = ? ORDER BY sort_order ASC'
    ).all(req.params.userId)

    // 计算每个节点的 curvePosition
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
  } catch (err) {
    return res.status(500).json({ error: '获取数据失败' })
  }
})

export default router
