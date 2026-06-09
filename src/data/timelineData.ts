export interface TimeNode {
  id: string
  year: number
  title: string
  description: string
  imageUrl: string
  curvePosition: number
  gradient: string
  userPhoto?: string // base64 用户上传的照片
}

export interface TimelineData {
  title: string
  subtitle: string
  nodes: TimeNode[]
}

// 默认模板数据 - 用户可以编辑
export function createDefaultData(): TimelineData {
  return {
    title: '生命星轨',
    subtitle: '记录生命中每一个重要时刻',
    nodes: [
      {
        id: 'node-1',
        year: 1990,
        title: '出生',
        description: '你来到了这个世界，一切从此开始。',
        imageUrl: '',
        curvePosition: 0.0,
        gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      },
      {
        id: 'node-2',
        year: 1996,
        title: '上学',
        description: '背起书包走进校园，开始了漫长的求学之路。',
        imageUrl: '',
        curvePosition: 0.11,
        gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
      },
      {
        id: 'node-3',
        year: 2008,
        title: '毕业',
        description: '告别校园，带着知识和回忆走向下一个阶段。',
        imageUrl: '',
        curvePosition: 0.22,
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
      {
        id: 'node-4',
        year: 2009,
        title: '工作',
        description: '第一份工作，第一次独立面对社会。',
        imageUrl: '',
        curvePosition: 0.33,
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      },
      {
        id: 'node-5',
        year: 2014,
        title: '恋爱',
        description: '遇见了一个特别的人，生活多了一份牵挂。',
        imageUrl: '',
        curvePosition: 0.44,
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      },
      {
        id: 'node-6',
        year: 2016,
        title: '养宠',
        description: '一只小动物走进了你的生活，带来了许多温暖。',
        imageUrl: '',
        curvePosition: 0.55,
        gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      },
      {
        id: 'node-7',
        year: 2018,
        title: '结婚',
        description: '两个人的故事，有了新的开始。',
        imageUrl: '',
        curvePosition: 0.66,
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      },
      {
        id: 'node-8',
        year: 2020,
        title: '为人父母',
        description: '一个新生命的到来，让一切都不一样了。',
        imageUrl: '',
        curvePosition: 0.77,
        gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      },
      {
        id: 'node-9',
        year: 2024,
        title: '中年',
        description: '经历了风雨，更懂得平淡中的幸福。',
        imageUrl: '',
        curvePosition: 0.88,
        gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      },
      {
        id: 'node-10',
        year: 2050,
        title: '暮年',
        description: '回望来路，每一步都值得。',
        imageUrl: '',
        curvePosition: 1.0,
        gradient: 'linear-gradient(135deg, #0c3483 0%, #a2b6df 100%)',
      },
    ],
  }
}

// 从 localStorage 加载用户数据，合并到默认模板
const STORAGE_KEY = 'starorbit_timeline'

export function loadTimelineData(): TimelineData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const data = JSON.parse(saved) as TimelineData
      if (data.nodes && data.nodes.length > 0) return data
    }
  } catch { /* ignore */ }
  return createDefaultData()
}

export function saveTimelineData(data: TimelineData): void {
  try {
    const json = JSON.stringify(data)

    // 检查 localStorage 剩余容量
    const usedMB = getStorageUsedMB()
    const dataMB = new Blob([json]).size / (1024 * 1024)

    if (usedMB + dataMB > 4.5) {
      // 接近 5MB 上限，尝试清理旧照片
      console.warn(`[Storage] localStorage 使用 ${usedMB.toFixed(1)}MB + 新数据 ${dataMB.toFixed(1)}MB，接近上限`)
      // 不阻止保存，但记录警告
    }

    localStorage.setItem(STORAGE_KEY, json)
  } catch (e) {
    // QuotaExceededError - 尝试移除最大的照片腾出空间
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      console.warn('[Storage] localStorage 已满，尝试清理照片腾出空间')
      trimLargestPhoto(data)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      } catch {
        console.error('[Storage] 清理后仍无法保存')
      }
    }
  }
}

function getStorageUsedMB(): number {
  let total = 0
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key) {
      total += (localStorage.getItem(key)?.length || 0) * 2 // UTF-16 每字符 2 字节
    }
  }
  return total / (1024 * 1024)
}

function trimLargestPhoto(data: TimelineData): void {
  // 找到最大的照片并移除
  let maxIdx = -1
  let maxSize = 0
  data.nodes.forEach((node, i) => {
    if (node.userPhoto && node.userPhoto.length > maxSize) {
      maxSize = node.userPhoto.length
      maxIdx = i
    }
  })
  if (maxIdx >= 0) {
    console.warn(`[Storage] 移除节点 ${maxIdx} 的照片以腾出空间`)
    data.nodes[maxIdx].userPhoto = ''
  }
}

export const timelineData = loadTimelineData()
