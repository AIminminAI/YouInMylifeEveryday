function simpleId(): string {
  return 'xxxx-xxxx-xxxx'.replace(/x/g, () => Math.floor(Math.random() * 16).toString(16))
}

function generateDescription(year?: number, title?: string): string {
  const y = year || new Date().getFullYear()
  const t = title || ''

  const templates: Record<string, string> = {
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

function jsonResp(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export const onRequest: PagesFunction = async (context) => {
  const { request } = context
  const url = new URL(request.url)
  const action = url.searchParams.get('action')

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }

  try {
    if (action === 'create-user' && request.method === 'POST') {
      const body = await request.json() as { openId?: string; nickname?: string }
      const userId = simpleId() + '-' + Date.now()
      return jsonResp({ userId, plan: 'free', nickname: body.nickname || '用户' })
    }

    if (action === 'generate-description' && request.method === 'POST') {
      const body = await request.json() as { year?: number; title?: string }
      const description = generateDescription(body.year, body.title)
      return jsonResp({ description, aiGenerated: true })
    }

    if (action === 'upload' && request.method === 'POST') {
      const body = await request.json() as { userId?: string; year?: number; title?: string; description?: string; imageUrl?: string }
      const nodeId = simpleId() + '-' + Date.now()
      const aiDesc = body.description || generateDescription(body.year, body.title)
      return jsonResp({
        id: nodeId, year: body.year || null, title: body.title || '未命名时刻',
        description: aiDesc, imageUrl: body.imageUrl || '', aiGenerated: !body.description,
      })
    }

    return jsonResp({ error: '未知操作' }, 400)
  } catch (err) {
    console.error('[Timeline Error]', err)
    return jsonResp({ error: '服务错误' }, 500)
  }
}
