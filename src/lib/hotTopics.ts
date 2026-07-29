import type {
  HotCategory,
  HotTopic,
  PlatformLink,
  RecreationAngle,
} from './types'

/* ===== 二创角度模板库 ===== */
/* 每个选题会从下面随机挑 3-5 个作为「可用角度」 */

export const ANGLE_TEMPLATES: Record<string, RecreationAngle[]> = {
  cover: [
    {
      type: 'cover',
      title: '翻拍致敬',
      description: '原样复刻热门视频的节奏/卡点/造型，加入自己的小改动',
    },
    {
      type: 'cover',
      title: '换人翻拍',
      description: '用反差人设（妈妈/同事/宠物）重新演绎同一脚本',
    },
    {
      type: 'story',
      title: '故事化改编',
      description: '把选题做成 30 秒 mini 短剧，有起承转合',
    },
    {
      type: 'tutorial',
      title: '拆解教程',
      description: '镜头逐一拆解爆款视频的剪辑/拍摄/文案技巧',
    },
    {
      type: 'challenge',
      title: '挑战打卡',
      description: '发起"7 天打卡挑战"，评论区征集用户跟拍',
    },
    {
      type: 'compare',
      title: '对比测评',
      description: '找同类选题做正反/前后对比，蹭原视频流量',
    },
    {
      type: 'humor',
      title: '搞笑吐槽',
      description: '用反差梗/夸张表情包吐槽原视频，制造笑点',
    },
    {
      type: 'poem',
      title: '配文金句',
      description: '用治愈/扎心文案配同款画面，做情绪类内容',
    },
    {
      type: 'reframe',
      title: '反转角度',
      description: '把"女生视角"换成"男生视角"、换城市、换年龄',
    },
    {
      type: 'tutorial',
      title: '知识科普',
      description: '拆解背后的原理/内幕，变成干货向',
    },
  ],
}

/** 随机挑 N 个不重复的角度 */
export function pickAngles(n: number, seed: number): RecreationAngle[] {
  const pool = ANGLE_TEMPLATES.cover
  const shuffled = [...pool]
  // 简单的确定性洗牌（按 seed）
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (seed * (i + 7)) % (i + 1)
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, Math.min(n, shuffled.length))
}

/* ===== 平台链接生成器 ===== */

const PLATFORMS_BASE: Record<string, Omit<PlatformLink, 'searchUrl'>> = {
  douyin: { name: '抖音', icon: 'D', color: '#fe2c55' },
  xhs: { name: '小红书', icon: '小', color: '#ff2442' },
  bilibili: { name: 'B站', icon: 'B', color: '#fb7299' },
  kuaishou: { name: '快手', icon: 'K', color: '#ff6633' },
  weibo: { name: '微博', icon: '微', color: '#e6162d' },
}

/** 关键词 → 各平台搜索 URL */
export function buildPlatformLinks(keyword: string): PlatformLink[] {
  const kw = encodeURIComponent(keyword)
  return [
    {
      ...PLATFORMS_BASE.douyin,
      searchUrl: `https://www.douyin.com/search/${kw}?type=video`,
    },
    {
      ...PLATFORMS_BASE.xhs,
      searchUrl: `https://www.xiaohongshu.com/search_result?keyword=${kw}&source=web_explore_feed&type=video`,
    },
    {
      ...PLATFORMS_BASE.bilibili,
      searchUrl: `https://search.bilibili.com/all?keyword=${kw}`,
    },
    {
      ...PLATFORMS_BASE.kuaishou,
      searchUrl: `https://www.kuaishou.com/search/visionnew?searchKey=${kw}`,
    },
    {
      ...PLATFORMS_BASE.weibo,
      searchUrl: `https://s.weibo.com/weibo?q=${kw}`,
    },
  ]
}

/* ===== 通用爆款选题模板库 ===== */
/* 每个分类下放 N 个模板，每天按日期挑一批展示 */

export interface TopicTemplate {
  title: string
  category: HotCategory
  hotLevel: 1 | 2 | 3 | 4 | 5
  viewLabel: string
  reason: string
  source?: string
  angleCount: number // 生成几个二创角度
}

export const TOPIC_TEMPLATES: TopicTemplate[] = [
  /* ===== 搞笑 ===== */
  {
    title: '当00后上班遇到70后领导',
    category: 'comedy',
    hotLevel: 5,
    viewLabel: '抖音热点榜 1280万',
    reason: '代际反差是天然流量密码，画面感强、易模仿',
    source: '抖音/全网二创热潮',
    angleCount: 4,
  },
  {
    title: '月薪3000假装月薪3万',
    category: 'comedy',
    hotLevel: 4,
    viewLabel: '小红书热帖 89万',
    reason: '打工人情绪共鸣，反转结局让人会心一笑',
    source: '小红书',
    angleCount: 4,
  },
  {
    title: '当男朋友第一次见闺蜜',
    category: 'comedy',
    hotLevel: 5,
    viewLabel: '抖音爆款 2100万',
    reason: '男女反差+闺蜜毒舌=经典不衰的爆款公式',
    source: '抖音',
    angleCount: 5,
  },
  {
    title: '在家族群发一条消息的反应',
    category: 'comedy',
    hotLevel: 3,
    viewLabel: '抖音 567万',
    reason: '贴近每个家庭的真实场景，参与感极强',
    source: '抖音',
    angleCount: 3,
  },
  {
    title: '东北人 vs 南方人买菜',
    category: 'comedy',
    hotLevel: 4,
    viewLabel: '抖音热点榜 880万',
    reason: '地域差异梗天然有节奏感，适合做对比类内容',
    source: '抖音',
    angleCount: 4,
  },
  {
    title: '当妈的我发现自己开始像我妈',
    category: 'comedy',
    hotLevel: 4,
    viewLabel: '小红书爆款 421万',
    reason: '代际传承梗有共鸣又有反转，评论区炸',
    source: '小红书',
    angleCount: 4,
  },

  /* ===== 化妆 ===== */
  {
    title: '5分钟出门伪素颜妆',
    category: 'makeup',
    hotLevel: 5,
    viewLabel: '小红书爆款 1560万',
    reason: '"快+好看"是化妆视频的硬刚需，完播率极高',
    source: '小红书/抖音',
    angleCount: 4,
  },
  {
    title: '黄黑皮逆袭冷白皮',
    category: 'makeup',
    hotLevel: 5,
    viewLabel: '抖音热点榜 970万',
    reason: '前后对比是化妆赛道最容易爆的选题结构',
    source: '抖音',
    angleCount: 5,
  },
  {
    title: '新手必踩的5个化妆误区',
    category: 'makeup',
    hotLevel: 4,
    viewLabel: '小红书热帖 720万',
    reason: '"踩坑"是知识型内容的高互动选题，收藏率高',
    source: '小红书',
    angleCount: 4,
  },
  {
    title: '圣诞节跨年约会妆',
    category: 'makeup',
    hotLevel: 5,
    viewLabel: '抖音 1340万',
    reason: '节日妆容流量集中爆发，提前 2 周做最有效',
    source: '抖音/小红书',
    angleCount: 4,
  },
  {
    title: '方圆脸必学修容法',
    category: 'makeup',
    hotLevel: 4,
    viewLabel: '小红书热帖 558万',
    reason: '脸型是中国女生的最大痛点，精准人群点赞高',
    source: '小红书',
    angleCount: 4,
  },
  {
    title: '500元学生党全套彩妆推荐',
    category: 'makeup',
    hotLevel: 4,
    viewLabel: 'B站 326万',
    reason: '平价测评+清单体是高收藏率选题',
    source: 'B站',
    angleCount: 4,
  },

  /* ===== 服装 ===== */
  {
    title: '小个子女生秋冬穿搭模板',
    category: 'fashion',
    hotLevel: 5,
    viewLabel: '小红书爆款 2030万',
    reason: '人群痛点+季节性+可复刻模板=长青爆款',
    source: '小红书',
    angleCount: 5,
  },
  {
    title: '优衣库/UR 一周穿搭不重样',
    category: 'fashion',
    hotLevel: 4,
    viewLabel: '小红书 870万',
    reason: '平价快时尚品牌自带流量，"一周 7 套"是高完播率选题',
    source: '小红书',
    angleCount: 4,
  },
  {
    title: '梨形身材显瘦穿搭',
    category: 'fashion',
    hotLevel: 5,
    viewLabel: '小红书 1450万',
    reason: '身材痛点人群基数极大，"显瘦"是永恒流量词',
    source: '小红书',
    angleCount: 5,
  },
  {
    title: '面试 / 通勤 / 约会 一衣三穿',
    category: 'fashion',
    hotLevel: 4,
    viewLabel: '小红书 698万',
    reason: '"一衣多穿"自带实用价值，收藏率极高',
    source: '小红书',
    angleCount: 4,
  },
  {
    title: '新中式 / 极简风 穿搭灵感',
    category: 'fashion',
    hotLevel: 4,
    viewLabel: '抖音 542万',
    reason: '风格类内容人群精准，转化率高',
    source: '抖音',
    angleCount: 4,
  },
  {
    title: '微胖女生怎么穿出高级感',
    category: 'fashion',
    hotLevel: 4,
    viewLabel: '小红书 615万',
    reason: '"微胖+高级感"是精准人群的搜索热词',
    source: '小红书',
    angleCount: 4,
  },

  /* ===== 唱歌 ===== */
  {
    title: '用本周热门 BGM 做"口型卡点"翻唱',
    category: 'singing',
    hotLevel: 5,
    viewLabel: '抖音 1890万',
    reason: 'BGM 卡点天然适配算法，"1 句建人设"梗分分钟出爆款',
    source: '抖音',
    angleCount: 5,
  },
  {
    title: '钢琴弹一首"emo 神曲"引评论区讲故事',
    category: 'singing',
    hotLevel: 5,
    viewLabel: 'B站/小红书 1100万',
    reason: '钢琴+情绪类内容是评论区故事机，互动率极高',
    source: 'B站/小红书',
    angleCount: 5,
  },
  {
    title: '"12年网感"复盘系列：我踩过最大的3个坑',
    category: 'singing',
    hotLevel: 4,
    viewLabel: '小红书 580万',
    reason: '"12年经验"是独家资产，复盘类人设更有留存价值',
    source: '小红书',
    angleCount: 4,
  },
  {
    title: '和爸妈的微信聊天记录实录（用配音演出来）',
    category: 'singing',
    hotLevel: 4,
    viewLabel: '抖音 760万',
    reason: '代际反差是家庭常见题材，"我妈的神回复"易出金句被截屏传播',
    source: '抖音',
    angleCount: 4,
  },
  {
    title: '用一首老歌带出 90 后集体回忆',
    category: 'singing',
    hotLevel: 4,
    viewLabel: '抖音 690万',
    reason: '情怀类内容完播率高，"90 后"是精准人群',
    source: '抖音',
    angleCount: 4,
  },
  {
    title: '5 分钟学会一首当红 BGM 的副歌',
    category: 'singing',
    hotLevel: 4,
    viewLabel: '抖音 845万',
    reason: '教学类内容收藏率高，BGM 热度自带流量',
    source: '抖音',
    angleCount: 4,
  },

  /* ===== 弹琴 ===== */
  {
    title: '周杰伦 / 林俊杰 / 薛之谦 神级翻弹',
    category: 'piano',
    hotLevel: 5,
    viewLabel: 'B站 1380万',
    reason: '华语经典自带情怀粉，翻弹赛道长青',
    source: 'B站',
    angleCount: 5,
  },
  {
    title: '即兴给路人弹一首生日歌',
    category: 'piano',
    hotLevel: 4,
    viewLabel: '抖音 720万',
    reason: '街拍类+音乐+真实反应=高完播率+高转发',
    source: '抖音',
    angleCount: 4,
  },
  {
    title: '"一镜到底"把一首 5 分钟曲子弹完',
    category: 'piano',
    hotLevel: 4,
    viewLabel: 'B站 655万',
    reason: '一镜到底是钢琴赛道的"高难度"标签，差异化强',
    source: 'B站',
    angleCount: 4,
  },
  {
    title: '把流行热曲改编成"巴赫 / 爵士"风格',
    category: 'piano',
    hotLevel: 4,
    viewLabel: 'B站/小红书 480万',
    reason: '"反差点"是二创的天然爆款逻辑',
    source: 'B站',
    angleCount: 4,
  },

  /* ===== 思考 ===== */
  {
    title: '"月薪5千 vs 月薪5万"的真实差距不是钱',
    category: 'insight',
    hotLevel: 5,
    viewLabel: '小红书 1120万',
    reason: '认知类内容是涨粉利器，"思维差距"是高完播选题',
    source: '小红书',
    angleCount: 5,
  },
  {
    title: '普通人改变命运的 3 个底层习惯',
    category: 'insight',
    hotLevel: 5,
    viewLabel: '小红书 1350万',
    reason: '"底层逻辑"是知识类长青选题，收藏率天花板',
    source: '小红书',
    angleCount: 5,
  },
  {
    title: '为什么你总是三分钟热度',
    category: 'insight',
    hotLevel: 4,
    viewLabel: '小红书 680万',
    reason: '痛点+解决方案是经典结构，"为什么"钩子完播率极高',
    source: '小红书',
    angleCount: 4,
  },
  {
    title: '独居一年后我才明白的 5 件事',
    category: 'insight',
    hotLevel: 4,
    viewLabel: '小红书 520万',
    reason: '"独居/独立"是当代年轻人情绪入口',
    source: '小红书',
    angleCount: 4,
  },
  {
    title: '自律 100 天后我的人生发生了什么变化',
    category: 'insight',
    hotLevel: 4,
    viewLabel: '抖音 850万',
    reason: '"前后对比"是高完播率结构，"100 天"提供时间锚点',
    source: '抖音',
    angleCount: 4,
  },

  /* ===== 日常 ===== */
  {
    title: '下班后 2 小时的自我充电清单',
    category: 'lifestyle',
    hotLevel: 4,
    viewLabel: '小红书 590万',
    reason: '"下班后"精准人群基数大，实用清单收藏率高',
    source: '小红书',
    angleCount: 4,
  },
  {
    title: '一个人住的房间改造 / 出租屋大变身',
    category: 'lifestyle',
    hotLevel: 5,
    viewLabel: '小红书 1280万',
    reason: '"出租屋改造"是长青爆款，前后对比有视觉冲击力',
    source: '小红书',
    angleCount: 5,
  },
  {
    title: '5 件让生活质感飙升的小物',
    category: 'lifestyle',
    hotLevel: 4,
    viewLabel: '小红书 720万',
    reason: '好物种草类选题收藏率天花板',
    source: '小红书',
    angleCount: 4,
  },
  {
    title: '30 元做一顿一周不重样的工作日便当',
    category: 'lifestyle',
    hotLevel: 4,
    viewLabel: '小红书 540万',
    reason: '"省钱+不重样"双重钩子，实用价值高',
    source: '小红书',
    angleCount: 4,
  },

  /* ===== 情感 ===== */
  {
    title: '"断联"第 30 天，前任会不会回来找你',
    category: 'emotion',
    hotLevel: 4,
    viewLabel: '抖音 780万',
    reason: '情感类内容完播率天然高，"断联"是搜索热词',
    source: '抖音',
    angleCount: 4,
  },
  {
    title: '从"恋爱脑"到"清醒独立"我经历了什么',
    category: 'emotion',
    hotLevel: 4,
    viewLabel: '小红书 650万',
    reason: '"觉醒/成长"叙事自带爽感，评论区粘性强',
    source: '小红书',
    angleCount: 4,
  },
  {
    title: '异地恋最难的从来不是距离',
    category: 'emotion',
    hotLevel: 4,
    viewLabel: '小红书 480万',
    reason: '异地恋人群基数大，"不是距离"反转型钩子有效',
    source: '小红书',
    angleCount: 4,
  },
]

/* ===== 工具函数 ===== */

/** 简单 hash，把日期+索引映射成稳定 seed */
export function daySeed(date: string, index: number): number {
  let h = 0
  const s = date + ':' + index
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0
  }
  return h
}

/** 模板 → 完整 HotTopic */
export function templateToTopic(
  tpl: TopicTemplate,
  index: number,
  date: string
): HotTopic {
  const seed = daySeed(date, index)
  return {
    id: `${tpl.category}-${index}-${date}`,
    title: tpl.title,
    category: tpl.category,
    hotLevel: tpl.hotLevel,
    viewLabel: tpl.viewLabel,
    reason: tpl.reason,
    source: tpl.source,
    angles: pickAngles(tpl.angleCount, seed),
    platforms: buildPlatformLinks(tpl.title.split(/[，。、：]/)[0]),
  }
}

/** 每天的选题：分类轮转 + 确定性顺序 */
export function getDailyTopics(date: string, count = 12): HotTopic[] {
  // 把所有模板按分类打散
  const byCat: Record<string, TopicTemplate[]> = {}
  TOPIC_TEMPLATES.forEach((t) => {
    if (!byCat[t.category]) byCat[t.category] = []
    byCat[t.category].push(t)
  })

  // 每天按 seed 选 count 个
  const seedBase = daySeed(date, 0)
  const all: TopicTemplate[] = []
  Object.values(byCat).forEach((arr) => {
    const shuffled = [...arr]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = ((seedBase >> i) ^ i) % (i + 1)
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    all.push(...shuffled)
  })

  return all.slice(0, count).map((t, i) => templateToTopic(t, i, date))
}

/* ===== 分类元数据（颜色/图标/标签） ===== */

export const HOT_CATEGORIES: Record<
  HotCategory,
  { label: string; color: string; soft: string; icon: string }
> = {
  comedy: { label: '搞笑', color: '#f5a623', soft: '#fdf3e2', icon: '😄' },
  makeup: { label: '化妆', color: '#fe2c55', soft: '#ffe8ee', icon: '💄' },
  fashion: { label: '服装', color: '#8a6dff', soft: '#efebff', icon: '👗' },
  singing: { label: '唱歌', color: '#2bb673', soft: '#e6f7ee', icon: '🎤' },
  piano: { label: '弹琴', color: '#4f6dff', soft: '#eaf0ff', icon: '🎹' },
  insight: { label: '思考', color: '#5b6b80', soft: '#eef0f4', icon: '💡' },
  lifestyle: { label: '日常', color: '#06b6d4', soft: '#e0f7fa', icon: '🏠' },
  emotion: { label: '情感', color: '#ec4899', soft: '#fce7f3', icon: '💗' },
}

export const ANGLE_META: Record<
  RecreationAngle['type'],
  { label: string; color: string; soft: string; icon: string }
> = {
  cover: { label: '翻拍', color: '#4f6dff', soft: '#eaf0ff', icon: '🎬' },
  story: { label: '故事', color: '#8a6dff', soft: '#efebff', icon: '📖' },
  tutorial: { label: '科普', color: '#06b6d4', soft: '#e0f7fa', icon: '📚' },
  challenge: { label: '挑战', color: '#f5a623', soft: '#fdf3e2', icon: '🏆' },
  compare: { label: '对比', color: '#2bb673', soft: '#e6f7ee', icon: '⚖️' },
  humor: { label: '吐槽', color: '#ec4899', soft: '#fce7f3', icon: '😂' },
  poem: { label: '金句', color: '#5b6b80', soft: '#eef0f4', icon: '✍️' },
  reframe: { label: '反转', color: '#fe2c55', soft: '#ffe8ee', icon: '🔄' },
}
