import fs from 'fs'

interface AIRequest {
  imageUrl: string
  year?: number
  title?: string
}

interface AIResponse {
  description: string
}

/**
 * AI 文案生成服务
 * 优先使用 Dify，备选 Coze
 */
export async function generateDescription(req: AIRequest): Promise<AIResponse> {
  const difyUrl = process.env.DIFY_API_URL
  const difyKey = process.env.DIFY_API_KEY

  // 优先 Dify
  if (difyUrl && difyKey) {
    return generateWithDify(req)
  }

  // 备选 Coze
  const cozeUrl = process.env.COZE_API_URL
  const cozeKey = process.env.COZE_API_KEY
  if (cozeUrl && cozeKey) {
    return generateWithCoze(req)
  }

  // 都没配置，使用本地模板
  return generateWithTemplate(req)
}

// ========== Dify 接入 ==========
async function generateWithDify(req: AIRequest): Promise<AIResponse> {
  const difyUrl = process.env.DIFY_API_URL!
  const difyKey = process.env.DIFY_API_KEY!

  // 将图片转为 base64
  const imageBuffer = fs.readFileSync(req.imageUrl)
  const base64Image = imageBuffer.toString('base64')
  const mimeType = getMimeType(req.imageUrl)

  // Dify Chat API
  // 文档：https://docs.dify.ai/guides/application-publishing/developing-with-apis
  const response = await fetch(`${difyUrl}/chat-messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${difyKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: {},
      query: buildPrompt(req),
      response_mode: 'blocking',
      user: 'starorbit-user',
      files: [
        {
          type: 'image',
          transfer_method: 'local_file',
          upload_file_id: '', // 需要先调用 Dify 文件上传 API
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`Dify API 返回 ${response.status}`)
  }

  const data = await response.json()
  const description = data.answer || data.data?.outputs?.text || ''

  return { description: description.trim() }
}

// ========== Coze 接入 ==========
async function generateWithCoze(req: AIRequest): Promise<AIResponse> {
  const cozeUrl = process.env.COZE_API_URL!
  const cozeKey = process.env.COZE_API_KEY!
  const botId = process.env.COZE_BOT_ID!

  // Coze Chat API
  // 文档：https://www.coze.cn/docs/developer_guide/chat_v3
  const response = await fetch(`${cozeUrl}/chat`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${cozeKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      bot_id: botId,
      user_id: 'starorbit-user',
      stream: false,
      auto_save_history: true,
      additional_messages: [
        {
          role: 'user',
          content: buildPrompt(req),
          content_type: 'text',
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`Coze API 返回 ${response.status}`)
  }

  const data = await response.json()
  const messages = data.messages || []
  const answer = messages.find((m: any) => m.role === 'assistant' && m.type === 'answer')

  return { description: (answer?.content || '').trim() }
}

// ========== 本地模板（无 API 时的 fallback） ==========
function generateWithTemplate(req: AIRequest): AIResponse {
  const year = req.year || new Date().getFullYear()
  const title = req.title || '珍贵时刻'

  const templates: Record<string, string[]> = {
    '降生': [
      '一声啼哭划破了清晨的宁静，你带着全家的期盼来到这个世界。',
      '小小的拳头紧握着，仿佛在说：我来了，准备好迎接我吧。',
    ],
    '求学': [
      '背着比身体还大的书包，踏进了校门。黑板上的粉笔字，操场上的欢笑声。',
      '知识的种子，从此在心中生根。',
    ],
    '宠物': [
      '那个秋天的午后，你在纸箱里怯怯地探出小脑袋。湿漉漉的眼睛望着这个世界，也望进了我的心里。',
      '从此，家里多了一个永远在门口等你的小家伙。',
    ],
    '默认': [
      `那是${year}年的故事，时光在那一刻定格，成为星轨上永恒的光点。`,
      '每一个瞬间都值得被铭记，每一段经历都是生命中最珍贵的篇章。',
      '岁月流转，这一刻的温暖与感动，将永远镌刻在记忆的星河中。',
    ],
  }

  const key = Object.keys(templates).find(k => title.includes(k)) || '默认'
  const pool = templates[key]
  const description = pool[Math.floor(Math.random() * pool.length)]

  return { description }
}

// ========== 构建 AI Prompt ==========
function buildPrompt(req: AIRequest): string {
  const yearStr = req.year ? `${req.year}年` : ''
  const titleStr = req.title || '人生时刻'

  return `你是一位擅长写感人文案的作家。请根据这张照片，为"${titleStr}"这个人生节点写一段50-80字的感性描述。

要求：
1. 语言温暖、细腻，有画面感
2. 不要用"我"开头，用第二人称或第三人称
3. ${yearStr ? `时间背景是${yearStr}，` : ''}结合照片中的场景、人物、氛围来写
4. 不要写标题，只写描述正文
5. 不要使用引号

直接输出文案，不要任何前缀或解释。`
}

function getMimeType(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase()
  const map: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
  }
  return map[ext || ''] || 'image/jpeg'
}
