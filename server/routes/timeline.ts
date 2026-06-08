import { Router, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { findUserByOpenId, findUserById, findNodesByUserId, createUser } from '../db'

const router = Router()

// ========== 创建/获取用户 ==========
router.post('/user', (req: Request, res: Response) => {
  try {
    const { openId, nickname } = req.body

    let user = findUserByOpenId(openId)
    if (!user) {
      const userId = uuidv4()
      user = createUser(userId, openId, nickname || '用户')
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
    const user = findUserById(req.params.userId)

    if (!user) {
      return res.status(404).json({ error: '用户不存在' })
    }

    const nodes = findNodesByUserId(req.params.userId)

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
  } catch (err) {
    return res.status(500).json({ error: '获取数据失败' })
  }
})

export default router
