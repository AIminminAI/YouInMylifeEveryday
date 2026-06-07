import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import path from 'path'
import { initDB } from './db'
import payRouter from './routes/pay'
import uploadRouter from './routes/upload'
import timelineRouter from './routes/timeline'

const app = express()
const PORT = process.env.PORT || 3001

// 中间件
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// 路由
app.use('/api/pay', payRouter)
app.use('/api/upload', uploadRouter)
app.use('/api/timeline', timelineRouter)

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

// 初始化数据库并启动
initDB()

app.listen(PORT, () => {
  console.log(`[StarOrbit API] 服务运行在 http://localhost:${PORT}`)
})

export default app
