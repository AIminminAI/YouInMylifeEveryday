import { Router, Request, Response } from 'express'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs'
import { createNode, findNodesByUserId, updateNode, deleteNode, getMaxSortOrder } from '../db'
import { generateDescription } from '../services/ai'

const router = Router()

// 确保 uploads 目录存在
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads')
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

// multer 配置
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${uuidv4()}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowed.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error('仅支持 JPG/PNG/WebP/GIF 格式'))
    }
  },
})

// ========== 上传照片 + AI 生成文案 ==========
router.post('/photo', upload.single('photo'), async (req: Request, res: Response) => {
  try {
    const { userId, year, title } = req.body
    const file = req.file

    if (!file) {
      return res.status(400).json({ error: '请上传照片' })
    }
    if (!userId) {
      return res.status(400).json({ error: '缺少用户 ID' })
    }

    const imageUrl = `/uploads/${file.filename}`

    let description = ''
    let aiGenerated = 0

    try {
      const aiResult = await generateDescription({
        imageUrl: path.join(UPLOAD_DIR, file.filename),
        year: year ? parseInt(year) : undefined,
        title: title || undefined,
      })
      description = aiResult.description
      aiGenerated = 1
    } catch (err) {
      console.error('[AI] 文案生成失败，使用默认文案:', err)
      description = '这是属于你的珍贵时刻。'
    }

    const nodeId = uuidv4()
    const sortOrder = getMaxSortOrder(userId) + 1
    const now = new Date().toISOString().replace('T', ' ').replace(/\.\d+Z$/, '')

    createNode({
      id: nodeId,
      user_id: userId,
      year: year ? parseInt(year) : null,
      title: title || '未命名时刻',
      description,
      image_url: imageUrl,
      sort_order: sortOrder,
      ai_generated: aiGenerated,
      created_at: now,
      updated_at: now,
    })

    return res.json({
      id: nodeId,
      year: year ? parseInt(year) : null,
      title: title || '未命名时刻',
      description,
      imageUrl,
      aiGenerated,
    })
  } catch (err: unknown) {
    console.error('[Upload] 上传失败:', err)
    return res.status(500).json({ error: '上传失败' })
  }
})

// ========== 获取用户所有节点 ==========
router.get('/nodes/:userId', (req: Request, res: Response) => {
  try {
    const nodes = findNodesByUserId(req.params.userId)
    return res.json({ nodes })
  } catch (err) {
    return res.status(500).json({ error: '查询失败' })
  }
})

// ========== 更新节点 ==========
router.put('/node/:nodeId', (req: Request, res: Response) => {
  try {
    const { year, title, description } = req.body
    updateNode(req.params.nodeId, year, title, description)
    return res.json({ success: true })
  } catch (err) {
    return res.status(500).json({ error: '更新失败' })
  }
})

// ========== 删除节点 ==========
router.delete('/node/:nodeId', (req: Request, res: Response) => {
  try {
    deleteNode(req.params.nodeId)
    return res.json({ success: true })
  } catch (err) {
    return res.status(500).json({ error: '删除失败' })
  }
})

export default router
