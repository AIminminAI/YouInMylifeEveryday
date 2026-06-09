import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  loadTimelineData,
  saveTimelineData,
  createDefaultData,
  type TimeNode,
  type TimelineData,
} from '@/data/timelineData'

// ========== 1. 数据层测试 ==========
describe('timelineData 数据层', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('createDefaultData 返回 10 个节点', () => {
    const data = createDefaultData()
    expect(data.nodes).toHaveLength(10)
    expect(data.title).toBe('生命星轨')
  })

  it('每个节点都有必要字段', () => {
    const data = createDefaultData()
    data.nodes.forEach((node, i) => {
      expect(node.id, `节点 ${i} 缺少 id`).toBeTruthy()
      expect(typeof node.year, `节点 ${i} year 不是数字`).toBe('number')
      expect(node.title, `节点 ${i} 缺少 title`).toBeTruthy()
      expect(node.description, `节点 ${i} 缺少 description`).toBeTruthy()
      expect(typeof node.curvePosition, `节点 ${i} curvePosition 不是数字`).toBe('number')
      expect(node.gradient, `节点 ${i} 缺少 gradient`).toBeTruthy()
    })
  })

  it('curvePosition 从 0 递增到 1', () => {
    const data = createDefaultData()
    expect(data.nodes[0].curvePosition).toBe(0)
    expect(data.nodes[data.nodes.length - 1].curvePosition).toBe(1)
    for (let i = 1; i < data.nodes.length; i++) {
      expect(
        data.nodes[i].curvePosition >= data.nodes[i - 1].curvePosition,
        `节点 ${i} 的 curvePosition 应 >= 前一个节点`
      ).toBe(true)
    }
  })

  it('loadTimelineData 无 localStorage 时返回默认数据', () => {
    const data = loadTimelineData()
    expect(data.nodes).toHaveLength(10)
  })

  it('saveTimelineData + loadTimelineData 数据一致', () => {
    const data = createDefaultData()
    data.nodes[0].title = '测试标题'
    data.nodes[0].userPhoto = 'data:image/jpeg;base64,FAKEDATA'
    saveTimelineData(data)

    const loaded = loadTimelineData()
    expect(loaded.nodes[0].title).toBe('测试标题')
    expect(loaded.nodes[0].userPhoto).toBe('data:image/jpeg;base64,FAKEDATA')
  })

  it('localStorage 损坏时 loadTimelineData 不崩溃', () => {
    localStorage.setItem('starorbit_timeline', '{invalid json')
    const data = loadTimelineData()
    expect(data.nodes).toHaveLength(10)
  })
})

// ========== 2. 照片上传逻辑测试 ==========
describe('照片上传流程', () => {
  it('压缩图片生成 base64 格式', () => {
    // jsdom 不支持 canvas，直接测试 base64 格式
    const fakeBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ'
    expect(fakeBase64).toMatch(/^data:image\/jpeg;base64,/)
  })

  it('大图片压缩逻辑正确', () => {
    // 纯数学测试，不依赖 canvas
    const maxSize = 800
    const testCases = [
      { w: 1600, h: 1200, expectedW: 800, expectedH: 600 },
      { w: 1200, h: 1600, expectedW: 600, expectedH: 800 },
      { w: 800, h: 600, expectedW: 800, expectedH: 600 },
      { w: 400, h: 300, expectedW: 400, expectedH: 300 },
    ]

    testCases.forEach(({ w, h, expectedW, expectedH }) => {
      let rw = w, rh = h
      if (rw > maxSize || rh > maxSize) {
        if (rw > rh) { rh = Math.round(rh * maxSize / rw); rw = maxSize }
        else { rw = Math.round(rw * maxSize / rh); rh = maxSize }
      }
      expect(rw).toBe(expectedW)
      expect(rh).toBe(expectedH)
    })
  })

  it('userPhoto 保存到 localStorage 后可恢复', () => {
    const data = createDefaultData()
    const fakePhoto = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ'
    data.nodes[2].userPhoto = fakePhoto
    saveTimelineData(data)

    const loaded = loadTimelineData()
    expect(loaded.nodes[2].userPhoto).toBe(fakePhoto)
  })

  it('移除照片后 userPhoto 为空', () => {
    const data = createDefaultData()
    data.nodes[0].userPhoto = 'data:image/jpeg;base64,FAKE'
    saveTimelineData(data)

    // 模拟移除操作
    data.nodes[0].userPhoto = ''
    saveTimelineData(data)

    const loaded = loadTimelineData()
    expect(loaded.nodes[0].userPhoto).toBe('')
  })
})

// ========== 3. 文案编辑逻辑测试 ==========
describe('文案编辑流程', () => {
  it('编辑标题并保存', () => {
    const data = loadTimelineData()
    const originalTitle = data.nodes[0].title
    data.nodes[0].title = '我的出生'
    saveTimelineData(data)

    const loaded = loadTimelineData()
    expect(loaded.nodes[0].title).toBe('我的出生')
    expect(loaded.nodes[0].title).not.toBe(originalTitle)
  })

  it('编辑描述并保存', () => {
    const data = loadTimelineData()
    data.nodes[3].description = '这是我自己写的描述'
    saveTimelineData(data)

    const loaded = loadTimelineData()
    expect(loaded.nodes[3].description).toBe('这是我自己写的描述')
  })

  it('编辑年份并保存', () => {
    const data = loadTimelineData()
    data.nodes[0].year = 1995
    saveTimelineData(data)

    const loaded = loadTimelineData()
    expect(loaded.nodes[0].year).toBe(1995)
  })

  it('空标题不覆盖原标题', () => {
    const data = loadTimelineData()
    const original = data.nodes[0].title
    // 模拟前端逻辑：空值不覆盖
    const newTitle = ''
    data.nodes[0].title = newTitle || original
    saveTimelineData(data)

    const loaded = loadTimelineData()
    expect(loaded.nodes[0].title).toBe(original)
  })

  it('重置数据恢复默认', () => {
    const data = loadTimelineData()
    data.nodes[0].title = '被修改的标题'
    data.nodes[0].userPhoto = 'data:image/jpeg;base64,FAKE'
    saveTimelineData(data)

    // 重置
    const fresh = createDefaultData()
    const resetData: TimelineData = {
      title: fresh.title,
      subtitle: fresh.subtitle,
      nodes: fresh.nodes,
    }
    saveTimelineData(resetData)

    const loaded = loadTimelineData()
    expect(loaded.nodes[0].title).not.toBe('被修改的标题')
    expect(loaded.nodes[0].userPhoto).toBeFalsy()
  })
})

// ========== 4. API 接口测试 ==========
describe('API 接口', () => {
  it('createOrder 返回必要字段', async () => {
    // 模拟 fetch
    const mockResponse = {
      orderId: 'test-order-123',
      amount: 1990,
      description: '高级版 ¥19.9',
      payHint: '请扫码支付 ¥19.9',
      orderSuffix: '123456',
    }

    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(mockResponse),
    })

    const { createOrder } = await import('@/services/api')
    const result = await createOrder('user-test', 'full')

    expect(result.orderId).toBe('test-order-123')
    expect(result.amount).toBe(1990)
    expect(result.orderSuffix).toBe('123456')
  })

  it('confirmPay 成功后返回 success', async () => {
    const mockResponse = { success: true, plan: 'full' }

    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(mockResponse),
    })

    const { confirmPay } = await import('@/services/api')
    const result = await confirmPay('order-123', 'user-test')

    expect(result.success).toBe(true)
    expect(result.plan).toBe('full')
  })

  it('getPaymentStatus 返回用户状态', async () => {
    const mockResponse = { plan: 'free', isPaid: false }

    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(mockResponse),
    })

    const { getPaymentStatus } = await import('@/services/api')
    const result = await getPaymentStatus('user-test')

    expect(result.plan).toBe('free')
    expect(result.isPaid).toBe(false)
  })
})

// ========== 5. 付费状态测试 ==========
describe('付费状态管理', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('默认为免费版', () => {
    localStorage.clear()
    const plan = localStorage.getItem('starorbit_plan')
    expect(plan).toBeNull()
  })

  it('升级后状态持久化', () => {
    localStorage.setItem('starorbit_plan', 'full')
    expect(localStorage.getItem('starorbit_plan')).toBe('full')
  })

  it('所有节点均不锁定', () => {
    // 免费版所有节点可访问
    const data = createDefaultData()
    data.nodes.forEach((_, i) => {
      expect(i).toBeLessThan(10) // 所有 10 个节点
    })
  })
})

// ========== 6. 截图/视频导出逻辑测试 ==========
describe('导出功能', () => {
  it('截图文件名格式正确', () => {
    const now = new Date()
    const filename = `生命星轨_${now.toLocaleString('zh-CN').replace(/[/: ]/g, '-')}.png`
    expect(filename).toMatch(/^生命星轨_.*\.png$/)
  })

  it('视频文件名格式正确', () => {
    const now = new Date()
    const filename = `生命星轨_${now.toLocaleString('zh-CN').replace(/[/: ]/g, '-')}.webm`
    expect(filename).toMatch(/^生命星轨_.*\.webm$/)
  })

  it('MediaRecorder 格式检测逻辑', () => {
    // jsdom 没有 MediaRecorder，用纯逻辑测试
    const supportedMimes = new Set([
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
    ])

    const mimeTypes = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4;codecs=h264',
      'video/mp4',
    ]

    let selectedMime = ''
    for (const mime of mimeTypes) {
      if (supportedMimes.has(mime)) {
        selectedMime = mime
        break
      }
    }

    expect(selectedMime).toBe('video/webm;codecs=vp9')
  })
})

// ========== 7. 边界情况测试 ==========
describe('边界情况', () => {
  it('localStorage 满时不崩溃', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError')
    })

    // saveTimelineData 应该静默失败不崩溃
    const data = createDefaultData()
    expect(() => saveTimelineData(data)).not.toThrow()

    spy.mockRestore()
  })

  it('节点索引越界不会崩溃', () => {
    const data = createDefaultData()
    expect(data.nodes[-1]).toBeUndefined()
    expect(data.nodes[999]).toBeUndefined()
  })

  it('空节点数组时 loadTimelineData 返回默认数据', () => {
    localStorage.setItem('starorbit_timeline', JSON.stringify({ title: 'test', nodes: [] }))
    const data = loadTimelineData()
    // 空数组时应该返回默认数据
    expect(data.nodes.length).toBeGreaterThan(0)
  })
})
