// 最简 API 测试 - 不依赖任何外部模块
module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()

  res.status(200).json({
    ok: true,
    message: 'API is working',
    timestamp: new Date().toISOString(),
  })
}
