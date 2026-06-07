import { Router, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getDB } from '../db'

const router = Router()

// ========== 价格配置 ==========
const PRICES: Record<string, { amount: number; label: string }> = {
  full: { amount: 1990, label: '完整版 ¥19.9' },    // 单位：分
  premium: { amount: 9900, label: '纪念版 ¥99' },
}

// ========== 创建订单 ==========
router.post('/create-order', (req: Request, res: Response) => {
  try {
    const { userId, plan, channel } = req.body

    if (!userId || !plan || !channel) {
      return res.status(400).json({ error: '缺少必要参数' })
    }

    if (!PRICES[plan]) {
      return res.status(400).json({ error: '无效的套餐类型' })
    }

    if (!['wechat', 'alipay'].includes(channel)) {
      return res.status(400).json({ error: '无效的支付渠道' })
    }

    const orderId = uuidv4()
    const price = PRICES[plan]

    const db = getDB()
    db.prepare(`
      INSERT INTO orders (id, user_id, plan, amount, channel, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `).run(orderId, userId, plan, price.amount, channel)

    // 根据支付渠道生成支付参数
    if (channel === 'wechat') {
      return generateWechatPay(orderId, price.amount, userId)
    } else {
      return generateAlipay(orderId, price.amount, userId)
    }

    async function generateWechatPay(orderId: string, amount: number, _userId: string) {
      // ========== 微信支付 JSAPI / H5 / Native ==========
      // 文档：https://pay.weixin.qq.com/wiki/doc/apiv3/wxpay/pages/index.shtml

      const appId = process.env.WECHAT_APP_ID
      const mchId = process.env.WECHAT_MCH_ID
      const notifyUrl = process.env.WECHAT_NOTIFY_URL

      if (!appId || !mchId) {
        // 开发环境：返回模拟支付参数
        return res.json({
          orderId,
          channel: 'wechat',
          // 生产环境返回真实支付参数
          // 开发环境返回模拟参数，前端可直接调起
          devMode: true,
          prepayId: `mock_prepay_${orderId}`,
          timeStamp: String(Math.floor(Date.now() / 1000)),
          nonceStr: uuidv4().replace(/-/g, ''),
          package: `prepay_id=mock_prepay_${orderId}`,
          signType: 'RSA',
          paySign: 'mock_sign',
          amount,
          description: PRICES[plan].label,
        })
      }

      // ========== 生产环境：调用微信支付 API ==========
      // 步骤：
      // 1. 构造请求体
      // 2. 生成签名（需要微信支付证书）
      // 3. 调用 /v3/pay/transactions/native (扫码) 或 /v3/pay/transactions/h5 (H5)
      // 4. 返回 code_url 或 h5_url

      try {
        // 使用微信支付 Node.js SDK（推荐）
        // npm install wechatpay-node-v3
        //
        // const WxPay = require('wechatpay-node-v3')
        // const pay = new WxPay({
        //   appid: appId,
        //   mchid: mchId,
        //   publicKey: Buffer.from(process.env.WECHAT_CERT_PUBLIC!),
        //   privateKey: Buffer.from(process.env.WECHAT_CERT_PRIVATE!),
        // })
        //
        // const result = await pay.transactions_native({
        //   description: PRICES[plan].label,
        //   out_trade_no: orderId,
        //   notify_url: notifyUrl,
        //   amount: { total: amount, currency: 'CNY' },
        // })
        //
        // return res.json({
        //   orderId,
        //   channel: 'wechat',
        //   codeUrl: result.code_url,  // 前端用此 URL 生成二维码
        // })

        // 临时返回（未配置证书时）
        return res.json({
          orderId,
          channel: 'wechat',
          devMode: true,
          message: '请配置微信支付商户证书',
          prepayId: `prep_${orderId}`,
          timeStamp: String(Math.floor(Date.now() / 1000)),
          nonceStr: uuidv4().replace(/-/g, ''),
          package: `prepay_id=prep_${orderId}`,
          signType: 'RSA',
          paySign: 'mock',
          amount,
        })
      } catch (err: any) {
        console.error('[WeChat Pay] 创建支付失败:', err)
        return res.status(500).json({ error: '微信支付创建失败' })
      }
    }

    async function generateAlipay(orderId: string, amount: number, _userId: string) {
      // ========== 支付宝手机网站支付 ==========
      // 文档：https://opendocs.alipay.com/open/02ivbs

      const appId = process.env.ALIPAY_APP_ID
      const notifyUrl = process.env.ALIPAY_NOTIFY_URL
      const returnUrl = process.env.ALIPAY_RETURN_URL

      if (!appId) {
        // 开发环境：返回模拟支付参数
        return res.json({
          orderId,
          channel: 'alipay',
          devMode: true,
          payUrl: `https://openapi.alipay.com/gateway.do?mock=true&orderId=${orderId}`,
          amount,
          description: PRICES[plan].label,
        })
      }

      // ========== 生产环境：调用支付宝 SDK ==========
      // npm install alipay-sdk
      //
      // const AlipaySdk = require('alipay-sdk').default
      // const AlipayFormData = require('alipay-sdk/lib/form').default
      //
      // const alipaySdk = new AlipaySdk({
      //   appId,
      //   privateKey: process.env.ALIPAY_PRIVATE_KEY,
      //   alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY,
      // })
      //
      // const formData = new AlipayFormData()
      // formData.setMethod('get')
      // formData.addField('bizContent', {
      //   out_trade_no: orderId,
      //   product_code: 'QUICK_WAP_WAY',
      //   total_amount: (amount / 100).toFixed(2),
      //   subject: PRICES[plan].label,
      // })
      // formData.addField('notifyUrl', notifyUrl)
      // formData.addField('returnUrl', returnUrl)
      //
      // const result = await alipaySdk.exec(
      //   'alipay.trade.wap.pay',
      //   {},
      //   { formData }
      // )
      //
      // return res.json({
      //   orderId,
      //   channel: 'alipay',
      //   payUrl: result,  // 前端跳转到此 URL 完成支付
      // })

      return res.json({
        orderId,
        channel: 'alipay',
        devMode: true,
        payUrl: `https://openapi.alipay.com/gateway.do?mock=true&orderId=${orderId}`,
        amount,
      })
    }
  } catch (err: any) {
    console.error('[Pay] 创建订单失败:', err)
    return res.status(500).json({ error: '创建订单失败' })
  }
})

// ========== 微信支付回调 ==========
router.post('/wechat/notify', (req: Request, res: Response) => {
  try {
    // 微信支付回调验签 + 处理
    // 1. 获取 HTTP 请求体中的签名头
    // 2. 用微信平台证书验签
    // 3. 解密回调数据
    // 4. 更新订单状态

    const { event_type, resource } = req.body

    if (event_type === 'TRANSACTION.SUCCESS') {
      // 解密 resource.ciphertext（需要 API v3 密钥）
      // const decrypted = decrypt(resource.ciphertext, resource.nonce, resource.associated_data)
      // const data = JSON.parse(decrypted)
      // const orderId = data.out_trade_no
      // const tradeNo = data.transaction_id

      // 临时处理（开发环境）
      const orderId = req.body.orderId || req.query.orderId
      if (orderId) {
        handlePaymentSuccess(orderId, 'wechat', '')
      }
    }

    // 必须返回 200，否则微信会重复通知
    res.json({ code: 'SUCCESS', message: '成功' })
  } catch (err) {
    console.error('[WeChat Notify] 处理失败:', err)
    res.status(500).json({ code: 'FAIL', message: '处理失败' })
  }
})

// ========== 支付宝回调 ==========
router.post('/alipay/notify', (req: Request, res: Response) => {
  try {
    // 支付宝回调验签
    // 1. 获取所有 POST 参数
    // 2. 用支付宝公钥验签
    // 3. 验证 trade_status 为 TRADE_SUCCESS

    const { out_trade_no, trade_no, trade_status } = req.body

    if (trade_status === 'TRADE_SUCCESS' || trade_status === 'TRADE_FINISHED') {
      handlePaymentSuccess(out_trade_no, 'alipay', trade_no)
    }

    res.send('success') // 支付宝要求返回 "success" 字符串
  } catch (err) {
    console.error('[Alipay Notify] 处理失败:', err)
    res.send('fail')
  }
})

// ========== 查询订单状态 ==========
router.get('/order/:orderId', (req: Request, res: Response) => {
  try {
    const db = getDB()
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.orderId) as any

    if (!order) {
      return res.status(404).json({ error: '订单不存在' })
    }

    return res.json({
      orderId: order.id,
      plan: order.plan,
      amount: order.amount,
      channel: order.channel,
      status: order.status,
      createdAt: order.created_at,
      paidAt: order.paid_at,
    })
  } catch (err) {
    return res.status(500).json({ error: '查询失败' })
  }
})

// ========== 查询用户付费状态（前端轮询） ==========
router.get('/status/:userId', (req: Request, res: Response) => {
  try {
    const db = getDB()
    const user = db.prepare('SELECT plan FROM users WHERE id = ?').get(req.params.userId) as any

    return res.json({
      plan: user?.plan || 'free',
      isPaid: user?.plan && user.plan !== 'free',
    })
  } catch (err) {
    return res.status(500).json({ error: '查询失败' })
  }
})

// ========== 开发环境：模拟支付成功 ==========
router.post('/dev/simulate-pay', (req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: '生产环境不可用' })
  }

  const { orderId } = req.body
  if (!orderId) {
    return res.status(400).json({ error: '缺少 orderId' })
  }

  handlePaymentSuccess(orderId, 'dev', `dev_${Date.now()}`)
  return res.json({ success: true })
})

// ========== 支付成功处理 ==========
function handlePaymentSuccess(orderId: string, channel: string, tradeNo: string) {
  const db = getDB()

  // 查询订单
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as any
  if (!order || order.status === 'paid') return

  // 更新订单状态
  db.prepare(`
    UPDATE orders SET status = 'paid', trade_no = ?, paid_at = datetime('now')
    WHERE id = ?
  `).run(tradeNo, orderId)

  // 更新用户套餐
  db.prepare(`
    UPDATE users SET plan = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(order.plan, order.user_id)

  console.log(`[Pay] 支付成功: orderId=${orderId}, plan=${order.plan}, channel=${channel}`)
}

export default router
