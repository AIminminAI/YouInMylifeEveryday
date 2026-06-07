export interface TimeNode {
  id: string
  year: number
  title: string
  description: string
  imageUrl: string
  curvePosition: number
}

export interface TimelineData {
  title: string
  subtitle: string
  nodes: TimeNode[]
}

export const timelineData: TimelineData = {
  title: '生命星轨',
  subtitle: '那些年，我们一起走过的时光',
  nodes: [
    {
      id: 'node-1',
      year: 1990,
      title: '降生',
      description:
        '一声啼哭划破了清晨的宁静，你带着全家的期盼来到这个世界。小小的拳头紧握着，仿佛在说：我来了，准备好迎接我吧。',
      imageUrl:
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=a+newborn+baby+in+blanket+soft+morning+light+hospital+warm+gentle+pastel&image_size=portrait_4_3',
      curvePosition: 0.0,
    },
    {
      id: 'node-2',
      year: 1996,
      title: '求学',
      description:
        '背着比身体还大的书包，踏进了校门。黑板上的粉笔字，操场上的欢笑声，还有那个总借你橡皮的同桌。知识的种子，从此在心中生根。',
      imageUrl:
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=a+child+with+backpack+walking+to+school+morning+sunlight+cherry+blossoms+nostalgic&image_size=portrait_4_3',
      curvePosition: 0.11,
    },
    {
      id: 'node-3',
      year: 2003,
      title: '青春',
      description:
        '耳机里循环着那首歌，日记本里藏着说不出口的心事。放学后的篮球场，考试前的紧张，还有毕业照上那个最灿烂的笑容。青春，原来就是一场盛大的告别。',
      imageUrl:
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=teenagers+playing+basketball+after+school+golden+hour+warm+light+nostalgic+film+look&image_size=portrait_4_3',
      curvePosition: 0.22,
    },
    {
      id: 'node-4',
      year: 2008,
      title: '初入职场',
      description:
        '第一套正装有些不合身，第一次汇报紧张到手心冒汗。深夜加班的灯光下，你咬着牙告诉自己：总有一天，这座城市会因为我的名字而不同。',
      imageUrl:
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young+professional+at+desk+city+skyline+at+night+office+light+ambition+modern&image_size=portrait_4_3',
      curvePosition: 0.33,
    },
    {
      id: 'node-5',
      year: 2012,
      title: '遇见你',
      description:
        '人海中那一眼，时间仿佛静止了。你的笑容像阳光穿过云层，照亮了我所有的日子。从那天起，"我"变成了"我们"。',
      imageUrl:
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=a+couple+meeting+for+first+time+coffee+shop+rainy+window+romantic+warm+lighting&image_size=portrait_4_3',
      curvePosition: 0.44,
    },
    {
      id: 'node-6',
      year: 2015,
      title: '毛孩子来了',
      description:
        '那个秋天的午后，你在纸箱里怯怯地探出小脑袋。湿漉漉的眼睛望着这个世界，也望进了我的心里。从此，家里多了一个永远在门口等你的小家伙。',
      imageUrl:
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=a+cute+golden+retriever+puppy+peeking+out+of+a+cardboard+box+in+autumn+warm+sunlight+soft+focus&image_size=portrait_4_3',
      curvePosition: 0.55,
    },
    {
      id: 'node-7',
      year: 2018,
      title: '新生命',
      description:
        '当那双小手第一次握住你的手指，整个世界都安静了。你低头看着怀中的小脸，忽然明白了什么叫做"生命的延续"。所有的辛苦，都值了。',
      imageUrl:
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=parent+holding+newborn+baby+hand+soft+light+tender+moment+hospital+warm+glow&image_size=portrait_4_3',
      curvePosition: 0.66,
    },
    {
      id: 'node-8',
      year: 2021,
      title: '风雨同行',
      description:
        '生活不总是晴天，但风雨中握紧的手从未松开。那些一起扛过的困难，反而成了最珍贵的勋章。回头看，每一步都算数。',
      imageUrl:
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=a+family+walking+together+in+rain+with+umbrella+warm+light+from+window+cozy+resilience&image_size=portrait_4_3',
      curvePosition: 0.77,
    },
    {
      id: 'node-9',
      year: 2024,
      title: '岁月静好',
      description:
        '孩子背着书包跑向校门，回头挥手的样子像极了当年的你。毛孩子安静地趴在脚边，阳光洒在客厅的地板上。平凡的日子，原来就是最好的日子。',
      imageUrl:
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=a+peaceful+family+morning+dog+sleeping+on+floor+sunlight+streaming+through+window+domestic+bliss&image_size=portrait_4_3',
      curvePosition: 0.88,
    },
    {
      id: 'node-10',
      year: 2026,
      title: '星河长明',
      description:
        '站在此刻回望，每一段经历都是星轨上不可或缺的光。那些笑与泪、聚与散，编织成了独一无二的生命图谱。故事还在继续，而星河，永远长明。',
      imageUrl:
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=a+person+standing+on+hilltop+looking+at+milky+way+starry+night+contemplation+ethereal+purple+blue&image_size=portrait_4_3',
      curvePosition: 1.0,
    },
  ],
}
