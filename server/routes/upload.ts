import { Router, Request, Response } from 'express'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs'
import { getDB } from '../db'
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
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

    // 图片 URL（生产环境应上传到 OSS/CDN）
    const imageUrl = `/uploads/${file.filename}`

    // AI 生成文案
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
      description = '这是属于你的珍贵时刻，每一个瞬间都值得被铭记。'
    }

    // 保存到数据库
    const nodeId = uuidv4()
    const db = getDB()

    // 获取当前最大排序号
    const maxOrder = db.prepare(
      'SELECT MAX(sort_order) as max FROM timeline_nodes WHERE user_id = ?'
    ).get(userId) as any

    const sortOrder = (maxOrder?.max || 0) + 1

    db.prepare(`
      INSERT INTO timeline_nodes (id, user_id, year, title, description, image_url, sort_order, ai_generated)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      nodeId,
      userId,
      year ? parseInt(year) : null,
      title || '未命名时刻',
      description,
      imageUrl,
      sortOrder,
      aiGenerated,
    )

    return res.json({
      id: nodeId,
      year: year ? parseInt(year) : null,
      title: title || '未命名时刻',
      description,
      imageUrl,
      aiGenerated,
    })
  } catch (err: any) {
    console.error('[Upload] 上传失败:', err)
    return res.status(500).json({ error: '上传失败' })
  }
})

// ========== 获取用户所有节点 ==========
router.get('/nodes/:userId', (req: Request, res: Response) => {
  try {
    const db = getDB()
    const nodes = db.prepare(
      'SELECT * FROM timeline_nodes WHERE user_id = ? ORDER BY sort_order ASC'
    ).all(req.params.userId)

    return res.json({ nodes })
  } catch (err) {
    return res.status(500).json({ error: '查询失败' })
  }
})

// ========== 更新节点 ==========
router.put('/node/:nodeId', (req: Request, res: Response) => {
  try {
    const { year, title, description } = req.body
    const db = getDB()

    db.prepare(`
      UPDATE timeline_nodes
      SET year = ?, title = ?, description = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(year, title, description, req.params.nodeId)

    return res.json({ success: true })
  } catch (err) {
    return res.status(500).json({ error: '更新失败' })
  }
})

// ========== 删除节点 ==========
router.delete('/node/:nodeId', (req: Request, res: Response) => {
  try {
    const db = getDB()

    // 获取节点信息以删除图片文件
    const node = db.prepare('SELECT image_url FROM timeline_nodes WHERE id = ?').get(req.params.nodeId) as any

    if (node?.image_url) {
      const imagePath = path.join(process.cwd(), node.image_url)
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath)
      }
    }

    db.prepare('DELETE FROM timeline_nodes WHERE id = ?').run(req.params.nodeId)

    return res.json({ success: true })
  } catch (err) {
    return res.status(500).json({ error: '删除失败' })
  }
})

export default router
