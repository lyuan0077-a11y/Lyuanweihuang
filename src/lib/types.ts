export type TaskStatus = 'todo' | 'doing' | 'done'

/** 艾森豪威尔四象限：紧急×重要 */
export type Quadrant = 'q1' | 'q2' | 'q3' | 'q4'

export interface Task {
  id: number
  title: string
  status: TaskStatus
  tag?: string
  createdAt: number
  quadrant?: Quadrant
  startedAt?: number // 进行中计时起点（进入 doing 时写入）
}

/** 时间记录条目：任务离开「进行中」时生成 */
export interface TimeLog {
  id: number
  taskTitle: string
  tag?: string // 对应日课分类
  startedAt: number
  endedAt: number
  duration: number // 秒
  date: string // YYYY-MM-DD（会话开始当天的日期）
}

export type TopicStatus =
  | 'idea'
  | 'confirmed'
  | 'filming'
  | 'published'
  | 'dropped'

export interface Topic {
  id: number
  title: string
  status: TopicStatus
  note?: string
  heat?: number // 1-5
  createdAt: number
}

export interface Inspiration {
  id: number
  text: string
  tag?: string
  createdAt: number
  converted: boolean
}

export interface ReviewRecord {
  id: number
  title: string
  platform: string
  date: string // YYYY-MM-DD
  plays: number
  likes: number
  comments: number
  completion: number // %
  takeaway: string
  createdAt: number
}

export type InspLibCategory = 'work' | 'humor' | 'word' | 'daily'

export interface InspLibItem {
  id: number
  text: string
  category: InspLibCategory
  source?: string
  favorite: boolean
  createdAt: number
}

export interface ScheduleItem {
  id: number
  title: string
  date: string // YYYY-MM-DD
  note?: string
  color: string
  done: boolean
  createdAt: number
}

export interface WeightRecord {
  id: number
  weight: number // kg
  date: string // YYYY-MM-DD
  note?: string
  createdAt: number
}

/** 力量训练肌群 */
export type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'abs' | 'rest'

/** 单日训练记录：包含练了哪些肌群 + 当天有氧分钟数 */
export interface WorkoutLog {
  id: number
  date: string // YYYY-MM-DD
  muscles: MuscleGroup[]
  cardioMin: number // 当天有氧分钟数，0 表示未做有氧
  createdAt: number
}

/* ===== 电商工作台 ===== */

/** 快捷链接：电商平台后台一键跳转 */
export interface QuickLink {
  id: number
  name: string
  url: string
  color: string // 品牌色
  createdAt: number
}

/** 发货记录：平台 + 件数 + 是否已发货 */
export interface ShipRecord {
  id: number
  platform: string
  items: number // 发货件数
  shipped: boolean // 是否已发货
  date: string // YYYY-MM-DD
  note?: string
  createdAt: number
}

/* ===== 爆款选题 / 护肤灵感 ===== */

/** 通用内容创作分类 */
export type HotCategory =
  | 'comedy' // 搞笑
  | 'makeup' // 化妆
  | 'fashion' // 服装
  | 'singing' // 唱歌
  | 'piano' // 弹琴
  | 'insight' // 思考
  | 'lifestyle' // 日常
  | 'emotion' // 情感

/** 护肤内容分类 */
export type SkincareCategory =
  | 'ingredient' // 成分（烟酰胺/A醇/VC...）
  | 'routine' // 护肤步骤（早C晚A/三明治...）
  | 'concern' // 肤质问题（闭口/敏感/暗沉...）
  | 'device' // 美容仪器（射频/面罩...）
  | 'sunscreen' // 防晒美白
  | 'antiaging' // 抗老紧致

/** 二创角度类型 */
export type AngleType =
  | 'cover' // 翻唱/翻拍
  | 'story' // 故事化
  | 'tutorial' // 知识科普
  | 'challenge' // 挑战/打卡
  | 'compare' // 对比/测评
  | 'humor' // 搞笑吐槽
  | 'poem' // 文艺/金句
  | 'reframe' // 换角度/反转型

/** 平台搜索链接 */
export interface PlatformLink {
  name: string
  icon: string
  color: string
  searchUrl: string // 该平台搜索该关键词的 URL
}

/** 单条二创角度 */
export interface RecreationAngle {
  type: AngleType
  title: string
  description: string
}

/** 爆款选题条目 */
export interface HotTopic {
  id: string // 唯一 ID：分类+标题 hash
  title: string
  category: HotCategory | SkincareCategory
  hotLevel: 1 | 2 | 3 | 4 | 5 // 热度等级（5最高）
  viewLabel: string // 平台显示的播放/互动量字符串，如"抖音热点榜 772万"
  reason: string // 为什么适合二创（一句话钩子）
  angles: RecreationAngle[] // 3-5 个二创角度
  source?: string // 灵感来源
  platforms: PlatformLink[] // 各平台搜索链接
}
