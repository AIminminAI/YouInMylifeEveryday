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
  preview: string
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
    description: '那些独自扛过的夜，都变成了星',
    preview: 'linear-gradient(135deg, #0a0a2e, #1a1a4e, #2d1b69)',
    tag: '独处',
  },
  {
    id: 'parents',
    name: '致我深爱的你',
    subtitle: '你们把我养大，我陪你们变老',
    description: '给爸妈的一封时光信',
    preview: 'linear-gradient(135deg, #ffecd2, #fcb69f, #a18cd1)',
    tag: '父母',
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
    case 'parents':
      return createParentsTemplate()
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
        description: '那天人很多，我只看见了你。你笑了一下，我的世界就安静了。',
        imageUrl: '',
        curvePosition: 0.0,
        gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      },
      {
        year: 2018,
        title: '心动',
        description: '你随口说了一句"早点睡"，我反复看了八遍。原来喜欢一个人，连标点符号都觉得是甜的。',
        imageUrl: '',
        curvePosition: 0.11,
        gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      },
      {
        year: 2019,
        title: '在一起',
        description: '没有告白，没有鲜花。只是过马路的时候，你牵了我的手。过了马路，你也没松开。我也没抽回。',
        imageUrl: '',
        curvePosition: 0.22,
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      },
      {
        year: 2019,
        title: '第一次吵架',
        description: '摔了门，走了。在楼下站了十分钟，又上来了。你开门的时候眼睛也是红的。我们都没说对不起，但都笑了。',
        imageUrl: '',
        curvePosition: 0.33,
        gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      },
      {
        year: 2020,
        title: '困在一起',
        description: '疫情关了门，你学会了做我爱的红烧肉，我学会了忍你打游戏。六十平的小屋，装下了整个世界。',
        imageUrl: '',
        curvePosition: 0.44,
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
      {
        year: 2021,
        title: '求婚',
        description: '你单膝跪下的时候，手在抖。戒指套了三次才戴上。你说"余生请多指教"，我什么都没说出来，只是拚命点头。',
        imageUrl: '',
        curvePosition: 0.55,
        gradient: 'linear-gradient(135deg, #ff6b9d 0%, #c44dff 100%)',
      },
      {
        year: 2022,
        title: '婚礼',
        description: '我挽着爸爸的手走向你，他把你手握得很紧，然后交给了我。他转身的时候，我看到了他的眼泪。',
        imageUrl: '',
        curvePosition: 0.66,
        gradient: 'linear-gradient(135deg, #6e3aff 0%, #c44dff 50%, #ff6b9d 100%)',
      },
      {
        year: 2023,
        title: '日常',
        description: '你帮我吹头发，我给你剪指甲。冰箱上贴着买菜清单，上面画了个笑脸。这就是我们的浪漫。',
        imageUrl: '',
        curvePosition: 0.77,
        gradient: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      },
      {
        year: 2025,
        title: '新生命',
        description: '产房外你走来走去，护士出来你冲上去的样子，比任何时候都笨拙。你抱着她，说"像你"。我看着你们，觉得这辈子值了。',
        imageUrl: '',
        curvePosition: 0.88,
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      },
      {
        year: 2070,
        title: '白头',
        description: '你忘了很多人很多事，但每天早上还是会帮我倒一杯温水。我坐在你旁边，你握着我的手，像五十年前过马路那样。',
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
        title: '第一夜',
        description: '你缩在角落发抖，我把你抱到枕边。你舔了舔我的手指，然后安心地闭上了眼。那一晚，我们都睡得很好。',
        imageUrl: '',
        curvePosition: 0.11,
        gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
      },
      {
        year: 2020,
        title: '闯祸',
        description: '咬坏了我最爱的拖鞋。我举起来要打你，你翻了个肚皮。我举着拖鞋愣了半天，最后笑了。',
        imageUrl: '',
        curvePosition: 0.22,
        gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      },
      {
        year: 2020,
        title: '深夜',
        description: '加班到凌晨，推开门，你在玄关等我。尾巴摇了两下，又困得站不稳。你等了我多久？你不会说，但我知道。',
        imageUrl: '',
        curvePosition: 0.33,
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      },
      {
        year: 2021,
        title: '最低谷',
        description: '那段日子我谁都不想见。只有你，把头搁在我膝上，一搭一搭地呼吸。你没说"会好的"，但你一直在。',
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
        year: 2030,
        title: '好久不见',
        description: '群里有人发了一句"想你们了"，沉寂了两年的群突然活了。原来大家都在，只是不知道怎么开口。',
        imageUrl: '',
        curvePosition: 1.0,
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      },
    ]),
  }
}

// ========== 孤独模板（重写：不再假装一切都好） ==========
function createSoloTemplate(): TimelineData {
  return {
    title: '一个人的宇宙',
    subtitle: '那些独自扛过的夜，都变成了星',
    templateId: 'solo',
    nodes: createNodes([
      {
        year: 2018,
        title: '搬出来',
        description: '一个人搬进小房间，空得能听到回声。第一顿饭是泡面，坐在地上吃的。没有桌子，也没有人问我好不好吃。',
        imageUrl: '',
        curvePosition: 0.0,
        gradient: 'linear-gradient(135deg, #0a0a2e 0%, #1a1a4e 100%)',
      },
      {
        year: 2019,
        title: '生病',
        description: '39度，自己打车去医院。挂号、抽血、等报告，一个人跑上跑下。护士问"家属呢"，我说"我自己可以"。',
        imageUrl: '',
        curvePosition: 0.11,
        gradient: 'linear-gradient(135deg, #1a1a4e 0%, #2d1b69 100%)',
      },
      {
        year: 2019,
        title: '除夕',
        description: '朋友圈全是年夜饭，我煮了速冻饺子。窗外烟花很响，我给妈妈打了个电话，说"我吃了，很好吃"。',
        imageUrl: '',
        curvePosition: 0.22,
        gradient: 'linear-gradient(135deg, #0c3483 0%, #1a1a4e 100%)',
      },
      {
        year: 2020,
        title: '通讯录',
        description: '翻了三遍通讯录，不知道打给谁。不是没有人，是怕打扰，怕对方说"我在忙"。最后锁了屏，对自己说了句晚安。',
        imageUrl: '',
        curvePosition: 0.33,
        gradient: 'linear-gradient(135deg, #2d1b69 0%, #6e3aff 100%)',
      },
      {
        year: 2020,
        title: '崩溃',
        description: '也不算什么大事，外卖洒了而已。但就是那一刻，眼泪止不住。不是为外卖哭，是为这该死的孤独。',
        imageUrl: '',
        curvePosition: 0.44,
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      },
      {
        year: 2021,
        title: '学会',
        description: '学会一个人修灯泡、换纱窗、通下水道。学会在餐厅对服务员说"一位"。学会不因为一个人就亏待自己。',
        imageUrl: '',
        curvePosition: 0.55,
        gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      },
      {
        year: 2022,
        title: '不和解',
        description: '有人说"你要学会享受孤独"。我不想享受，我只是扛着。扛着扛着，就扛过来了。不用和解，扛住就行。',
        imageUrl: '',
        curvePosition: 0.66,
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
      {
        year: 2023,
        title: '微光',
        description: '下班路上看到很美的晚霞，拍了张照，想了想，没发朋友圈。有些美，自己看到了就够了。',
        imageUrl: '',
        curvePosition: 0.77,
        gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      },
      {
        year: 2024,
        title: '此刻',
        description: '此刻的我，一个人坐在窗边，看着这条星轨。不完美，但真实。每一颗星，都是我独自熬过的夜。',
        imageUrl: '',
        curvePosition: 0.88,
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      },
      {
        year: 2070,
        title: '回望',
        description: '一个人走完了这一生。有些路，注定只能一个人走。但回头看，那些脚印都是自己的——这比什么都踏实。',
        imageUrl: '',
        curvePosition: 1.0,
        gradient: 'linear-gradient(135deg, #0a0a2e 0%, #6e3aff 50%, #ff6b9d 100%)',
      },
    ]),
  }
}

// ========== 父母模板（银发经济核心模板） ==========
function createParentsTemplate(): TimelineData {
  return {
    title: '致我深爱的你',
    subtitle: '你们把我养大，我陪你们变老',
    templateId: 'parents',
    nodes: createNodes([
      {
        year: 1990,
        title: '我来了',
        description: '你抱着我，手都在抖。那么小一个人，你不知道怎么抱才不会弄疼我。你看着我，笑了，又哭了。',
        imageUrl: '',
        curvePosition: 0.0,
        gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      },
      {
        year: 1993,
        title: '学走路',
        description: '你弯着腰牵着我的手，走了无数遍。我摔了，你比我还疼，但还是说"再试一次"。你教会我的第一件事，是不怕摔倒。',
        imageUrl: '',
        curvePosition: 0.11,
        gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
      },
      {
        year: 2000,
        title: '送我上学',
        description: '你每天骑自行车送我，后座上绑着一个小垫子。冬天的风很冷，你让我把手塞进你衣服里。你的背，是最暖的地方。',
        imageUrl: '',
        curvePosition: 0.22,
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      },
      {
        year: 2008,
        title: '我走了',
        description: '考上大学那天，你笑着说"好"。转身的时候，我偷偷回头看——你在擦眼泪。你不想让我看到你哭。',
        imageUrl: '',
        curvePosition: 0.33,
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
      {
        year: 2012,
        title: '电话',
        description: '每次打电话你都只说"家里都好，你忙你的"。后来爸爸偷偷告诉我，你把手机放在枕头边，怕错过我的电话。',
        imageUrl: '',
        curvePosition: 0.44,
        gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      },
      {
        year: 2015,
        title: '回家',
        description: '一桌子菜，都是我小时候爱吃的。你说"多吃点"，自己却没怎么动筷子。你就喜欢看我吃。',
        imageUrl: '',
        curvePosition: 0.55,
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      },
      {
        year: 2020,
        title: '白发',
        description: '视频的时候，你把手机拿得很远。我问你眼睛怎么了，你说"老花，正常"。你没说的是，你已经开始看不清我的脸了。',
        imageUrl: '',
        curvePosition: 0.66,
        gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      },
      {
        year: 2023,
        title: '忘了',
        description: '你开始重复问同一个问题。我回答了三遍，你还是会问。我不烦，我只是怕——怕有一天你连我的名字都忘了。',
        imageUrl: '',
        curvePosition: 0.77,
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      },
      {
        year: 2024,
        title: '陪你',
        description: '这次换我牵你的手。你走得很慢，我不催你。就像小时候，你弯着腰等我慢慢走一样。我们有的是时间。',
        imageUrl: '',
        curvePosition: 0.88,
        gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      },
      {
        year: 2070,
        title: '永远',
        description: '如果有下辈子，我还做你们的孩子。这次换我来养你们，好不好？',
        imageUrl: '',
        curvePosition: 1.0,
        gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #a18cd1 100%)',
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
