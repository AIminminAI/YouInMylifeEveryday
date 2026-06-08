// 简单 UUID
function simpleId() {
  return 'xxxx-xxxx-xxxx'.replace(/x/g, () => Math.floor(Math.random() * 16).toString(16))
}

// 本地 AI 文案模板
function generateDescription(year, title) {
  const y = year || new Date().getFullYear()
  const t = title || ''

  const templates = {
    '出生': '一声啼哭划破了' + y + '年的清晨，你带着全家的期盼来到这个世界。',
    '上学': '背着书包踏进校门，' + y + '年的校园时光，是生命中最纯粹的章节。',
    '毕业': y + '年，走出校门的那一刻，青春的篇章画上了句号，人生的新篇章即将开启。',
    '工作': y + '年，你第一次穿上正装走进写字楼，眼睛里有光。',
    '恋爱': y + '年，你遇见了那个让心跳漏了一拍的人。',
    '养宠': y + '年，一个小家伙怯怯地探出脑袋，望进了你的心里。',
    '结婚': y + '年，你说出了那句"我愿意"。',
    '父母': y + '年，你第一次当上了父母，明白了什么叫做无条件的爱。',
    '中年': y + '年，你学会了和岁月和解，珍惜眼前的每一个平凡日子。',
    '暮年': y + '年，回头看，那些年的辛苦，都变成了此刻的从容。',
  }

  for (const [key, desc] of Object.entries(templates)) {
    if (t.includes(key)) return desc
  }

  return '那是' + y + '年的故事，时光在那一刻定格，成为星轨上永恒的光点。'
}

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const action = req.query.action

  try {
    if (action === 'create-user' && req.method === 'POST') {
      const { openId, nickname } = req.body
      const userId = simpleId() + '-' + Date.now()
      return res.json({ userId, plan: 'free', nickname: nickname || '用户' })
    }

    if (action === 'generate-description' && req.method === 'POST') {
      const { year, title } = req.body
      const description = generateDescription(year, title)
      return res.json({ description, aiGenerated: true })
    }

    if (action === 'upload' && req.method === 'POST') {
      const { userId, year, title, description, imageUrl } = req.body
      const nodeId = simpleId() + '-' + Date.now()
      const aiDesc = description || generateDescription(year, title)
      return res.json({
        id: nodeId, year: year || null, title: title || '未命名时刻',
        description: aiDesc, imageUrl: imageUrl || '', aiGenerated: !description,
      })
    }

    return res.status(400).json({ error: '未知操作' })
  } catch (err) {
    console.error('[Timeline Error]', err)
    return res.status(500).json({ error: '服务错误' })
  }
}
