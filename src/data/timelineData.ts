export interface TimeNode {
  id: string
  year: number
  title: string
  description: string
  imageUrl: string
  curvePosition: number
  gradient: string
  userPhoto?: string
}

export interface TimelineData {
  title: string
  subtitle: string
  templateId: string
  nodes: TimeNode[]
}

export interface TemplateMeta {
  id: string
  name: string
  subtitle: string
  description: string
  preview: string // 渐变色预览
  tag: string
}

// ========== 模板列表 ==========
export const TEMPLATES: TemplateMeta[] = [
  {
    id: 'life',
    name: '生命星轨',
    subtitle: '记录生命中每一个重要时刻',
    description: '从出生到暮年，人生的完整旅程',
    preview: 'linear-gradient(135deg, #0c3483, #00d4ff, #ffd700)',
    tag: '经典',
  },
  {
    id: 'wedding',
    name: '与你共赴星河',
    subtitle: '从相遇那天起，我的宇宙只有你',
    description: '两个人的故事，从心动到白头',
    preview: 'linear-gradient(135deg, #ff6b9d, #c44dff, #6e3aff)',
    tag: '婚礼',
  },
  {
    id: 'pet',
    name: '你是我的小星球',
    subtitle: '你用一生陪我，我用星轨记住你',
    description: '它不会说话，但它用一生说爱你',
    preview: 'linear-gradient(135deg, #43e97b, #38f9d7, #4facfe)',
    tag: '宠物',
  },
  {
    id: 'graduation',
    name: '散场不散',
    subtitle: '我们终将远行，但星光会替我记住',
    description: '那些以为会永远在一起的日子',
    preview: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)',
    tag: '毕业',
  },
  {
    id: 'solo',
    name: '一个人的宇宙',
    subtitle: '孤独不是缺憾，是我完整的星轨',
    description: '与自己和解的每一步，都值得被记住',
    preview: 'linear-gradient(135deg, #0a0a2e, #1a1a4e, #2d1b69)',
    tag: '独处',
  },
]

// ========== 模板工厂 ==========

function createNodes(base: Omit<TimeNode, 'id'>[]): TimeNode[] {
  return base.map((node, i) => ({
    ...node,
    id: `node-${i + 1}`,
  }))
}

export function createTemplateData(templateId: string): TimelineData {
  switch (templateId) {
    case 'wedding':
      return createWeddingTemplate()
    case 'pet':
      return createPetTemplate()
    case 'graduation':
      return createGraduationTemplate()
    case 'solo':
      return createSoloTemplate()
    default:
      return createDefaultData()
  }
}

// ========== 默认模板 ==========
export function createDefaultData(): TimelineData {
  return {
    title: '生命星轨',
    subtitle: '记录生命中每一个重要时刻',
    templateId: 'life',
    nodes: createNodes([
      { year: 1990, title: '出生', description: '你来到了这个世界，一切从此开始。', imageUrl: '', curvePosition: 0.0, gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
      { year: 1996, title: '上学', description: '背起书包走进校园，开始了漫长的求学之路。', imageUrl: '', curvePosition: 0.11, gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)' },
      { year: 2008, title: '毕业', description: '告别校园，带着知识和回忆走向下一个阶段。', imageUrl: '', curvePosition: 0.22, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
      { year: 2009, title: '工作', description: '第一份工作，第一次独立面对社会。', imageUrl: '', curvePosition: 0.33, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
      { year: 2014, title: '恋爱', description: '遇见了一个特别的人，生活多了一份牵挂。', imageUrl: '', curvePosition: 0.44, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
      { year: 2016, title: '养宠', description: '一只小动物走进了你的生活，带来了许多温暖。', imageUrl: '', curvePosition: 0.55, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
      { year: 2018, title: '结婚', description: '两个人的故事，有了新的开始。', imageUrl: '', curvePosition: 0.66, gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
      { year: 2020, title: '为人父母', description: '一个新生命的到来，让一切都不一样了。', imageUrl: '', curvePosition: 0.77, gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
      { year: 2024, title: '中年', description: '经历了风雨，更懂得平淡中的幸福。', imageUrl: '', curvePosition: 0.88, gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
      { year: 2050, title: '暮年', description: '回望来路，每一步都值得。', imageUrl: '', curvePosition: 1.0, gradient: 'linear-gradient(135deg, #0c3483 0%, #a2b6df 100%)' },
    ]),
  }
}

// ========== 婚礼模板 ==========
function createWeddingTemplate(): TimelineData {
  return {
    title: '与你共赴星河',
    subtitle: '从相遇那天起，我的宇宙只有你',
    templateId: 'wedding',
    nodes: createNodes([
      {
        year: 2018,
        title: '初见',
        description: '那天人很多，我只看见了你。世界突然安静，像宇宙只剩两颗星。',
        imageUrl: '',
        curvePosition: 0.0,
        gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      },
      {
        year: 2018,
        title: '心动',
        description: '明明只是普通的一句话，你说了，我记了很久。原来心动不是心跳加速，是突然想认真对待一个人。',
        imageUrl: '',
        curvePosition: 0.11,
        gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      },
      {
        year: 2019,
        title: '在一起',
        description: '没有轰轰烈烈的告白，只是某天散步时，你牵了我的手，我也没有放开。就这样，我们成了一对。',
        imageUrl: '',
        curvePosition: 0.22,
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      },
      {
        year: 2019,
        title: '磨合',
        description: '也吵过架，也红过眼。但每次想放弃的时候，你都在。后来我明白了——爱不是不吵架，是吵完了还想和你在一起。',
        imageUrl: '',
        curvePosition: 0.33,
        gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      },
      {
        year: 2020,
        title: '陪伴',
        description: '疫情关住了门，你却打开了窗。一起做饭、一起追剧、一起发呆。原来和你在一起，什么都不做也很幸福。',
        imageUrl: '',
        curvePosition: 0.44,
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
      {
        year: 2021,
        title: '求婚',
        description: '没有直升机，没有大屏幕，只有你单膝跪地，说了一句：余生请多指教。我哭着点了头。',
        imageUrl: '',
        curvePosition: 0.55,
        gradient: 'linear-gradient(135deg, #ff6b9d 0%, #c44dff 100%)',
      },
      {
        year: 2022,
        title: '婚礼',
        description: '穿白纱的那一刻，我在人群中找你的眼睛。你也在看我，笑着，眼里有光。那是我见过最美的星空。',
        imageUrl: '',
        curvePosition: 0.66,
        gradient: 'linear-gradient(135deg, #6e3aff 0%, #c44dff 50%, #ff6b9d 100%)',
      },
      {
        year: 2023,
        title: '日常',
        description: '柴米油盐里藏着浪漫：你帮我暖被窝，我给你留灯。平淡不是无趣，是安心。',
        imageUrl: '',
        curvePosition: 0.77,
        gradient: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      },
      {
        year: 2025,
        title: '新生命',
        description: '你握着我的手，比我还紧张。听到第一声啼哭，我们相视而笑——从此，我们的爱有了延续。',
        imageUrl: '',
        curvePosition: 0.88,
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      },
      {
        year: 2070,
        title: '白头',
        description: '头发白了，步子慢了。你还是会牵我的手，像第一次那样。我回头看你，你还是当年那个让我心动的人。',
        imageUrl: '',
        curvePosition: 1.0,
        gradient: 'linear-gradient(135deg, #0c3483 0%, #a2b6df 50%, #ffecd2 100%)',
      },
    ]),
  }
}

// ========== 宠物模板 ==========
function createPetTemplate(): TimelineData {
  return {
    title: '你是我的小星球',
    subtitle: '你用一生陪我，我用星轨记住你',
    templateId: 'pet',
    nodes: createNodes([
      {
        year: 2019,
        title: '初遇',
        description: '笼子里那么多只，只有你朝我跑了过来。你选了我，不是我选了你。',
        imageUrl: '',
        curvePosition: 0.0,
        gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      },
      {
        year: 2019,
        title: '回家',
        description: '你缩在角落发抖，我轻声说别怕。那一晚你睡在我枕边，呼噜声很轻，却让我无比安心。',
        imageUrl: '',
        curvePosition: 0.11,
        gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
      },
      {
        year: 2020,
        title: '闯祸',
        description: '咬坏拖鞋、打翻花瓶、偷吃零食……你一脸无辜地看我，我气不起来。你大概也知道我气不起来。',
        imageUrl: '',
        curvePosition: 0.22,
        gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      },
      {
        year: 2020,
        title: '陪伴',
        description: '加班到深夜，你趴在脚边不走。我说"你去睡吧"，你抬头看我一眼，又趴下了。你什么都没说，但我没那么孤独了。',
        imageUrl: '',
        curvePosition: 0.33,
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      },
      {
        year: 2021,
        title: '治愈',
        description: '最难的那段日子，是你陪我熬过来的。你不会说安慰的话，但你把头搁在我膝上，就已经够了。',
        imageUrl: '',
        curvePosition: 0.44,
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
      {
        year: 2022,
        title: '默契',
        description: '我拿钥匙你就冲到门口，我叹气你就走过来蹭我。你比任何人都懂我的情绪，虽然你只是一只小动物。',
        imageUrl: '',
        curvePosition: 0.55,
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      },
      {
        year: 2023,
        title: '老去',
        description: '你跑不动了，上楼梯要人抱。但你还是在门口等我，只是比以前慢了一点。没关系，我也慢下来等你。',
        imageUrl: '',
        curvePosition: 0.66,
        gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      },
      {
        year: 2024,
        title: '告别',
        description: '最后那天，你用尽力气舔了舔我的手。你是在说"别哭"吗？对不起，我做不到。',
        imageUrl: '',
        curvePosition: 0.77,
        gradient: 'linear-gradient(135deg, #2d1b69 0%, #6e3aff 100%)',
      },
      {
        year: 2024,
        title: '空位',
        description: '回家习惯性叫你的名字，才想起来你不在了。你的碗还在，你的玩具还在，只是那个毛茸茸的小身影，不会再出现了。',
        imageUrl: '',
        curvePosition: 0.88,
        gradient: 'linear-gradient(135deg, #0a0a2e 0%, #1a1a4e 100%)',
      },
      {
        year: 2070,
        title: '重逢',
        description: '如果真的有彩虹桥，我到那边第一件事就是找你。你一定还在那里摇着尾巴等我，就像从前每一次我回家那样。',
        imageUrl: '',
        curvePosition: 1.0,
        gradient: 'linear-gradient(135deg, #43e97b 0%, #4facfe 50%, #a18cd1 100%)',
      },
    ]),
  }
}

// ========== 毕业模板 ==========
function createGraduationTemplate(): TimelineData {
  return {
    title: '散场不散',
    subtitle: '我们终将远行，但星光会替我记住',
    templateId: 'graduation',
    nodes: createNodes([
      {
        year: 2018,
        title: '入学',
        description: '拖着行李箱走进校门，什么都是新的。不知道四年会这么短，也不知道这些人会这么重要。',
        imageUrl: '',
        curvePosition: 0.0,
        gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
      },
      {
        year: 2018,
        title: '军训',
        description: '烈日下站军姿，偷偷看旁边的人也在擦汗。后来这群晒黑的人，成了最好的朋友。',
        imageUrl: '',
        curvePosition: 0.11,
        gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      },
      {
        year: 2019,
        title: '深夜',
        description: '熄灯后的宿舍才是真正的开始。聊理想、聊暗恋、聊未来，聊到凌晨三点。那些夜谈，比任何课都珍贵。',
        imageUrl: '',
        curvePosition: 0.22,
        gradient: 'linear-gradient(135deg, #0c3483 0%, #a2b6df 100%)',
      },
      {
        year: 2019,
        title: '考试',
        description: '图书馆占座、考前突击、互相传纸条……明明紧张得要死，现在想起来却只觉得好笑。',
        imageUrl: '',
        curvePosition: 0.33,
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
      {
        year: 2020,
        title: '分离',
        description: '疫情突然来了，走的时候连再见都没来得及说。以为很快就能回来，没想到有些人再也没见过。',
        imageUrl: '',
        curvePosition: 0.44,
        gradient: 'linear-gradient(135deg, #2d1b69 0%, #6e3aff 100%)',
      },
      {
        year: 2021,
        title: '重逢',
        description: '终于回到学校，食堂的饭还是那么难吃，但大家坐在一起，什么都好吃了。原来重要的不是吃什么，是和谁一起。',
        imageUrl: '',
        curvePosition: 0.55,
        gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      },
      {
        year: 2022,
        title: '散伙饭',
        description: '说着"以后常聚"，心里都知道可能聚不齐了。有人哭了，有人假装没事，酒杯碰在一起，都是梦碎的声音。',
        imageUrl: '',
        curvePosition: 0.66,
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      },
      {
        year: 2022,
        title: '毕业照',
        description: '穿上学士服，笑得灿烂。快门按下的那一刻，有人偷偷红了眼。这张照片，以后会看很多很多次。',
        imageUrl: '',
        curvePosition: 0.77,
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      },
      {
        year: 2022,
        title: '离校',
        description: '最后看了一眼宿舍，关上门。走廊空了，就像四年前来的时候一样。只是这次，不会再回来了。',
        imageUrl: '',
        curvePosition: 0.88,
        gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      },
      {
        year: 2070,
        title: '重逢',
        description: '如果有一天我们再聚，希望大家都过得好。不用像从前那样，只要坐在一起，就够了。',
        imageUrl: '',
        curvePosition: 1.0,
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      },
    ]),
  }
}

// ========== 孤独模板 ==========
function createSoloTemplate(): TimelineData {
  return {
    title: '一个人的宇宙',
    subtitle: '孤独不是缺憾，是我完整的星轨',
    templateId: 'solo',
    nodes: createNodes([
      {
        year: 2018,
        title: '独居',
        description: '一个人搬进小房间，空荡荡的。晚上安静得能听到自己的心跳。有点怕，但也有点自由。',
        imageUrl: '',
        curvePosition: 0.0,
        gradient: 'linear-gradient(135deg, #0a0a2e 0%, #1a1a4e 100%)',
      },
      {
        year: 2019,
        title: '一个人吃饭',
        description: '从不好意思一个人进餐厅，到享受一个人吃火锅。原来独处不是可怜，是一种能力。',
        imageUrl: '',
        curvePosition: 0.11,
        gradient: 'linear-gradient(135deg, #1a1a4e 0%, #2d1b69 100%)',
      },
      {
        year: 2019,
        title: '深夜',
        description: '凌晨三点，城市睡了，我还醒着。不是失眠，是只有这个时间，世界才真正属于我。',
        imageUrl: '',
        curvePosition: 0.22,
        gradient: 'linear-gradient(135deg, #0c3483 0%, #1a1a4e 100%)',
      },
      {
        year: 2020,
        title: '独处',
        description: '别人说"你一个人不孤独吗？"我说"比在错误的人群里自在。"孤独是选择，不是惩罚。',
        imageUrl: '',
        curvePosition: 0.33,
        gradient: 'linear-gradient(135deg, #2d1b69 0%, #6e3aff 100%)',
      },
      {
        year: 2020,
        title: '自愈',
        description: '最难的时候，没有人可以倾诉。哭完擦干眼泪，给自己倒了杯水。原来我比自己以为的要坚强。',
        imageUrl: '',
        curvePosition: 0.44,
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      },
      {
        year: 2021,
        title: '旅行',
        description: '一个人去了海边。没有人和我说话，但海浪声就够了。日落的时候，我觉得自己也是风景的一部分。',
        imageUrl: '',
        curvePosition: 0.55,
        gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      },
      {
        year: 2022,
        title: '和解',
        description: '不再逼自己合群了。不是所有人都需要热闹，有些人就是需要安静。我终于不再为此道歉。',
        imageUrl: '',
        curvePosition: 0.66,
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
      {
        year: 2023,
        title: '自在',
        description: '周末睡到自然醒，看书、发呆、散步。没有人催我，没有人等我。这种自由，是孤独给我的礼物。',
        imageUrl: '',
        curvePosition: 0.77,
        gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      },
      {
        year: 2024,
        title: '完整',
        description: '我不再等一个人来让我完整。我一个人，就是完整的。星轨上只有一颗星，但它亮得刚好。',
        imageUrl: '',
        curvePosition: 0.88,
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      },
      {
        year: 2070,
        title: '回望',
        description: '一个人走完了这一生。没有轰轰烈烈，但每一步都是自己的选择。如果重来，我还是会这样走。',
        imageUrl: '',
        curvePosition: 1.0,
        gradient: 'linear-gradient(135deg, #0a0a2e 0%, #6e3aff 50%, #ff6b9d 100%)',
      },
    ]),
  }
}

// ========== 数据持久化 ==========
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
    const usedMB = getStorageUsedMB()
    const dataMB = new Blob([json]).size / (1024 * 1024)
    if (usedMB + dataMB > 4.5) {
      console.warn(`[Storage] localStorage 使用 ${usedMB.toFixed(1)}MB + 新数据 ${dataMB.toFixed(1)}MB，接近上限`)
    }
    localStorage.setItem(STORAGE_KEY, json)
  } catch (e) {
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
      total += (localStorage.getItem(key)?.length || 0) * 2
    }
  }
  return total / (1024 * 1024)
}

function trimLargestPhoto(data: TimelineData): void {
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
