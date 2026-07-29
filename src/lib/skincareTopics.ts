import type {
  HotTopic,
  PlatformLink,
  RecreationAngle,
  SkincareCategory,
} from './types'
import {
  buildPlatformLinks,
  daySeed,
  pickAngles,
  ANGLE_TEMPLATES,
} from './hotTopics'

/* ===== 护肤专属二创角度模板 ===== */

const SKINCARE_ANGLES: Record<string, RecreationAngle[]> = {
  ingredient: [
    {
      type: 'tutorial',
      title: '成分党拆解',
      description: '用大白话讲透成分机理（谁是主力、谁是辅助、谁在打酱油）',
    },
    {
      type: 'compare',
      title: '平替 vs 大牌',
      description: '同成分不同价位对比，蹭大牌流量带自家产品',
    },
    {
      type: 'humor',
      title: '"成分党吵架"剧情',
      description: '还原 A 醇党 vs VC 党互怼现场，趣味科普',
    },
    {
      type: 'reframe',
      title: '油皮/干皮/敏感肌 实测',
      description: '同一成分在不同肤质上的不同反应，给出针对性建议',
    },
    {
      type: 'tutorial',
      title: '"成分党排雷"清单',
      description: '盘点高浓度猛药里哪些不能叠加、哪些会烂脸',
    },
  ],
  routine: [
    {
      type: 'challenge',
      title: '"X 天护肤挑战"打卡',
      description: '挑战 7/14/30 天执行同一护肤流程，每天记录皮肤变化',
    },
    {
      type: 'tutorial',
      title: '保姆级步骤拆解',
      description: '把每个步骤的时间、用量、手法拍清楚，做成"跟着做"教程',
    },
    {
      type: 'compare',
      title: '正确 vs 错误步骤对比',
      description: '展示错误步骤会出现的皮肤问题，再演示正确做法',
    },
    {
      type: 'reframe',
      title: '极简版 / 学生党版',
      description: '把 8 步流程压缩到 3 步，照顾预算/时间有限的群体',
    },
    {
      type: 'humor',
      title: '"护肤懒人"自嘲',
      description: '还原懒人护肤的真实翻车现场，引发共鸣',
    },
  ],
  concern: [
    {
      type: 'tutorial',
      title: '保姆级解决方案',
      description: '针对一个肌肤问题（闭口/暗沉/敏感）给出"成因+成分+产品"完整链路',
    },
    {
      type: 'compare',
      title: '"3 款热门产品"横评',
      description: '把同问题下 3 款爆款产品做实测对比',
    },
    {
      type: 'story',
      title: '"我烂脸那年"实录',
      description: '真实经历+修复过程+最终结果，故事化叙事',
    },
    {
      type: 'reframe',
      title: '"伪科学"辟谣',
      description: '拆解 3 个流传甚广的"治 XX 问题"谣言',
    },
    {
      type: 'humor',
      title: '"皮肤焦虑"吐槽',
      description: '调侃小红书上的"必须 XXX 否则烂脸"焦虑营销',
    },
  ],
  device: [
    {
      type: 'tutorial',
      title: '新手入门避坑',
      description: '买之前必看：哪些仪器真有用、哪些是智商税',
    },
    {
      type: 'compare',
      title: '"500 vs 5000" 美容仪实测',
      description: '平价与高价美容仪的功能差距到底在哪',
    },
    {
      type: 'challenge',
      title: '"X 天美容仪"打卡',
      description: '坚持使用 30 天记录皮肤变化，附前后对比图',
    },
    {
      type: 'reframe',
      title: '"上班族午休美容仪"',
      description: '针对没时间的上班族，演示 5 分钟仪器使用方案',
    },
    {
      type: 'humor',
      title: '美容仪翻车实录',
      description: '还原新手用美容仪把自己电到/烫到的搞笑瞬间',
    },
  ],
  sunscreen: [
    {
      type: 'tutorial',
      title: '防晒选购指南',
      description: '油皮/干皮/敏感肌分别推荐防晒，附成分解读',
    },
    {
      type: 'compare',
      title: '"防晒黑名单/红黑榜"',
      description: '盘点 5 款被吹爆但实际难用/假白的防晒',
    },
    {
      type: 'challenge',
      title: '"全年防晒"实测',
      description: '365 天涂防晒的脸部状态 vs 偷懒不涂的',
    },
    {
      type: 'reframe',
      title: '防晒衣 / 帽子 / 口罩 物理防晒实测',
      description: '演示不同物理防晒方式的有效性',
    },
    {
      type: 'tutorial',
      title: '防晒补涂指南',
      description: '通勤/户外/海边分别怎么补，附补涂手法',
    },
  ],
  antiaging: [
    {
      type: 'tutorial',
      title: '25/30/35 岁抗老方案',
      description: '不同年龄段的成分选择、用法、用量',
    },
    {
      type: 'compare',
      title: '"早 C 晚 A"全流程实测',
      description: '坚持 3 个月的皮肤变化记录',
    },
    {
      type: 'humor',
      title: '"抗老焦虑"段子',
      description: '调侃抗老赛道的天价精华和过度营销',
    },
    {
      type: 'reframe',
      title: '平价抗老 / 学生党版',
      description: '预算 200 元的入门抗老方案',
    },
    {
      type: 'tutorial',
      title: 'A 醇"翻车"急救指南',
      description: 'A 醇翻车（脱皮/泛红/烂脸）时如何救回来',
    },
  ],
}

/** 护肤选题用专属角度池，其他选题仍走通用池 */
export function pickSkincareAngles(
  cat: SkincareCategory,
  n: number,
  seed: number
): RecreationAngle[] {
  const pool = SKINCARE_ANGLES[cat] ?? ANGLE_TEMPLATES.cover
  const shuffled = [...pool]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (seed * (i + 13)) % (i + 1)
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, Math.min(n, shuffled.length))
}

/* ===== 护肤爆款选题模板库 ===== */

export interface SkincareTemplate {
  title: string
  category: SkincareCategory
  hotLevel: 1 | 2 | 3 | 4 | 5
  viewLabel: string
  reason: string
  source?: string
  angleCount: number
}

export const SKINCARE_TEMPLATES: SkincareTemplate[] = [
  /* ===== 成分 ===== */
  {
    title: '烟酰胺到底能不能美白',
    category: 'ingredient',
    hotLevel: 5,
    viewLabel: '小红书 1320万',
    reason: '烟酰胺是搜索热词，"能不能 X"是天然钩子',
    source: '小红书',
    angleCount: 4,
  },
  {
    title: 'A 醇 / A 醛 / A 酯到底怎么选',
    category: 'ingredient',
    hotLevel: 5,
    viewLabel: '小红书 980万',
    reason: '"A 醇家族"是抗老人群必修课，争议多流量大',
    source: '小红书/知乎',
    angleCount: 5,
  },
  {
    title: 'VC 衍生物 vs 纯 VC 粉 谁更值得买',
    category: 'ingredient',
    hotLevel: 4,
    viewLabel: '小红书 650万',
    reason: '"对比+选购"是高收藏率结构',
    source: '小红书',
    angleCount: 4,
  },
  {
    title: '玻尿酸 / 透明质酸 5 种用法',
    category: 'ingredient',
    hotLevel: 4,
    viewLabel: '小红书 540万',
    reason: '"N 种用法"是清单体爆款公式',
    source: '小红书',
    angleCount: 4,
  },
  {
    title: '敏感肌为什么不能碰"猛药"',
    category: 'ingredient',
    hotLevel: 4,
    viewLabel: '小红书 720万',
    reason: '"敏感肌+避雷"是精准人群刚需',
    source: '小红书',
    angleCount: 4,
  },
  {
    title: '"成分党才知道"的 5 个叠加禁忌',
    category: 'ingredient',
    hotLevel: 5,
    viewLabel: '小红书 1130万',
    reason: '"叠加禁忌"是反向爆款公式，避雷=收藏',
    source: '小红书',
    angleCount: 5,
  },
  {
    title: '积雪草 / 神经酰胺 / 马齿苋 修护成分到底有什么区别',
    category: 'ingredient',
    hotLevel: 4,
    viewLabel: '小红书 480万',
    reason: '修护赛道精准人群，复述式结构完播率高',
    source: '小红书',
    angleCount: 4,
  },

  /* ===== 步骤 ===== */
  {
    title: '"早 C 晚 A"保姆级教程',
    category: 'routine',
    hotLevel: 5,
    viewLabel: '小红书 2050万',
    reason: '早 C 晚 A 是护肤圈"国民公式"，长青爆款',
    source: '小红书/抖音',
    angleCount: 5,
  },
  {
    title: '三明治护肤法到底有没有用',
    category: 'routine',
    hotLevel: 4,
    viewLabel: '小红书 580万',
    reason: '"有没有用"是质疑型钩子，天然高完播',
    source: '小红书',
    angleCount: 4,
  },
  {
    title: '7 天"密集修护"急救流程',
    category: 'routine',
    hotLevel: 4,
    viewLabel: '小红书 690万',
    reason: '"X 天急救"是时间锚点+场景刚需',
    source: '小红书',
    angleCount: 4,
  },
  {
    title: '正确的"卸妆-洁面-二次清洁"顺序',
    category: 'routine',
    hotLevel: 4,
    viewLabel: '抖音 470万',
    reason: '基础步骤很多人都做错，"纠错"类内容收藏率高',
    source: '抖音',
    angleCount: 4,
  },
  {
    title: '油皮夏季 5 步极简护肤',
    category: 'routine',
    hotLevel: 4,
    viewLabel: '小红书 510万',
    reason: '人群+季节+极简 = 精准钩子',
    source: '小红书',
    angleCount: 4,
  },
  {
    title: '"肌断食"真的能让皮肤变好吗',
    category: 'routine',
    hotLevel: 4,
    viewLabel: '小红书 620万',
    reason: '"肌断食"是争议话题，评论区分两派',
    source: '小红书',
    angleCount: 4,
  },

  /* ===== 肤质问题 ===== */
  {
    title: '闭口粉刺怎么治 7 天记录',
    category: 'concern',
    hotLevel: 5,
    viewLabel: '小红书 1180万',
    reason: '闭口是痘肌人群的最大痛点，前后对比是爆款',
    source: '小红书',
    angleCount: 5,
  },
  {
    title: '红血丝 / 敏感泛红 急救方案',
    category: 'concern',
    hotLevel: 4,
    viewLabel: '小红书 720万',
    reason: '敏感肌人群基数大，"急救"钩子有效',
    source: '小红书',
    angleCount: 4,
  },
  {
    title: '黑眼圈 / 眼袋 怎么消',
    category: 'concern',
    hotLevel: 5,
    viewLabel: '小红书 940万',
    reason: '黑眼圈几乎覆盖全年龄，"怎么消"是搜索热词',
    source: '小红书/抖音',
    angleCount: 5,
  },
  {
    title: '毛孔粗大 还能救吗',
    category: 'concern',
    hotLevel: 5,
    viewLabel: '小红书 1320万',
    reason: '"毛孔"是国民护肤焦虑，标题钩子极强',
    source: '小红书',
    angleCount: 5,
  },
  {
    title: '痘印 红印 vs 黑印 怎么处理',
    category: 'concern',
    hotLevel: 4,
    viewLabel: '小红书 680万',
    reason: '痘印人群基数大，"分类处理"是知识型钩子',
    source: '小红书',
    angleCount: 4,
  },
  {
    title: '熬夜后第二天皮肤急救',
    category: 'concern',
    hotLevel: 4,
    viewLabel: '抖音 850万',
    reason: '熬夜是普遍痛点，"急救"是刚需',
    source: '抖音/小红书',
    angleCount: 4,
  },
  {
    title: '"皮肤屏障受损"自测和修复指南',
    category: 'concern',
    hotLevel: 5,
    viewLabel: '小红书 1090万',
    reason: '"屏障受损"是护肤圈最常见焦虑词',
    source: '小红书',
    angleCount: 5,
  },

  /* ===== 仪器 ===== */
  {
    title: '射频仪 / 美容仪 是智商税吗',
    category: 'device',
    hotLevel: 5,
    viewLabel: '小红书 1240万',
    reason: '美容仪赛道贵+争议大，"是不是智商税"是爆款钩子',
    source: '小红书',
    angleCount: 5,
  },
  {
    title: 'LED 面膜仪 / 大排灯 真有用吗',
    category: 'device',
    hotLevel: 4,
    viewLabel: '小红书 560万',
    reason: '大排灯价格高，"真有用吗"是消费者必搜',
    source: '小红书',
    angleCount: 4,
  },
  {
    title: '微电流 / 提拉仪 实测对比',
    category: 'device',
    hotLevel: 4,
    viewLabel: '小红书 480万',
    reason: '"实测对比"是高完播率结构',
    source: '小红书',
    angleCount: 4,
  },
  {
    title: '学生党 100 元入门美容仪推荐',
    category: 'device',
    hotLevel: 4,
    viewLabel: '小红书 510万',
    reason: '"学生党+100元"是高搜索量钩子',
    source: '小红书',
    angleCount: 4,
  },
  {
    title: '美容仪"翻车"现场合集',
    category: 'device',
    hotLevel: 4,
    viewLabel: '抖音 720万',
    reason: '"翻车合集"是天然流量结构，吸睛',
    source: '抖音',
    angleCount: 4,
  },

  /* ===== 防晒美白 ===== */
  {
    title: '油皮亲妈防晒 5 款实测',
    category: 'sunscreen',
    hotLevel: 5,
    viewLabel: '小红书 1320万',
    reason: '油皮+夏季防晒=长青爆款，季节性流量高峰',
    source: '小红书',
    angleCount: 5,
  },
  {
    title: '物理防晒 vs 化学防晒 怎么选',
    category: 'sunscreen',
    hotLevel: 4,
    viewLabel: '小红书 580万',
    reason: '"怎么选"是搜索类钩子，收藏率高',
    source: '小红书',
    angleCount: 4,
  },
  {
    title: '军训 / 学车 防晒不黑的秘诀',
    category: 'sunscreen',
    hotLevel: 4,
    viewLabel: '抖音 890万',
    reason: '场景化选题（军训/学车）精准人群基数大',
    source: '抖音',
    angleCount: 4,
  },
  {
    title: '"一天补几次防晒"实测对比',
    category: 'sunscreen',
    hotLevel: 4,
    viewLabel: '小红书 460万',
    reason: '争议话题+实测对比=高互动',
    source: '小红书',
    angleCount: 4,
  },
  {
    title: '美白精华到底多久能见效',
    category: 'sunscreen',
    hotLevel: 4,
    viewLabel: '小红书 720万',
    reason: '"多久见效"是消费者决策刚需',
    source: '小红书',
    angleCount: 4,
  },

  /* ===== 抗老 ===== */
  {
    title: '25 岁抗老 vs 35 岁抗老 区别',
    category: 'antiaging',
    hotLevel: 5,
    viewLabel: '小红书 1380万',
    reason: '年龄分段是抗老赛道最强钩子',
    source: '小红书',
    angleCount: 5,
  },
  {
    title: 'A 醇"翻车"了怎么救',
    category: 'antiaging',
    hotLevel: 4,
    viewLabel: '小红书 690万',
    reason: 'A 醇用户基数大，"翻车急救"是刚需',
    source: '小红书',
    angleCount: 4,
  },
  {
    title: '抗老猛药清单（500 元预算）',
    category: 'antiaging',
    hotLevel: 4,
    viewLabel: '小红书 540万',
    reason: '预算+清单体是高收藏率结构',
    source: '小红书',
    angleCount: 4,
  },
  {
    title: '"冻龄"明星的护肤思路能复制吗',
    category: 'antiaging',
    hotLevel: 4,
    viewLabel: '小红书 720万',
    reason: '明星效应+对比是天然爆款',
    source: '小红书',
    angleCount: 4,
  },
  {
    title: '"眼周抗老"的 3 个关键动作',
    category: 'antiaging',
    hotLevel: 4,
    viewLabel: '小红书 510万',
    reason: '眼周是抗老焦虑最集中的部位',
    source: '小红书',
    angleCount: 4,
  },
]

/* ===== 工具函数 ===== */

export function skincareTemplateToTopic(
  tpl: SkincareTemplate,
  index: number,
  date: string
): HotTopic {
  const seed = daySeed(date, index)
  return {
    id: `sk-${tpl.category}-${index}-${date}`,
    title: tpl.title,
    category: tpl.category,
    hotLevel: tpl.hotLevel,
    viewLabel: tpl.viewLabel,
    reason: tpl.reason,
    source: tpl.source,
    angles: pickSkincareAngles(tpl.category, tpl.angleCount, seed),
    platforms: buildPlatformLinks(tpl.title.split(/[，。、：]/)[0]),
  }
}

export function getDailySkincareTopics(date: string, count = 12): HotTopic[] {
  const byCat: Record<string, SkincareTemplate[]> = {}
  SKINCARE_TEMPLATES.forEach((t) => {
    if (!byCat[t.category]) byCat[t.category] = []
    byCat[t.category].push(t)
  })

  const seedBase = daySeed(date, 1)
  const all: SkincareTemplate[] = []
  Object.values(byCat).forEach((arr) => {
    const shuffled = [...arr]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = ((seedBase >> i) ^ i) % (i + 1)
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    all.push(...shuffled)
  })

  return all.slice(0, count).map((t, i) =>
    skincareTemplateToTopic(t, i, date)
  )
}

/* ===== 护肤分类元数据 ===== */

export const SKINCARE_CATEGORIES: Record<
  SkincareCategory,
  { label: string; color: string; soft: string; icon: string }
> = {
  ingredient: { label: '成分', color: '#06b6d4', soft: '#e0f7fa', icon: '🧪' },
  routine: { label: '步骤', color: '#4f6dff', soft: '#eaf0ff', icon: '📋' },
  concern: { label: '肤质问题', color: '#ec4899', soft: '#fce7f3', icon: '💆' },
  device: { label: '美容仪', color: '#8a6dff', soft: '#efebff', icon: '⚡' },
  sunscreen: { label: '防晒美白', color: '#f5a623', soft: '#fdf3e2', icon: '☀️' },
  antiaging: { label: '抗老紧致', color: '#5b6b80', soft: '#eef0f4', icon: '🕰️' },
}
