import type { Task, Topic, InspLibCategory, Quadrant, TimeLog, MuscleGroup, QuickLink } from './types'

export const KEYS = {
  tasks: 'wb.tasks',
  topics: 'wb.topics',
  inspirations: 'wb.inspirations',
  reviews: 'wb.reviews',
  routine: 'wb.routine',
  inspLib: 'wb.inspLib',
  schedules: 'wb.schedules',
  weights: 'wb.weights',
  timeLogs: 'wb.timeLogs',
  workouts: 'wb.workouts',
  quickLinks: 'wb.quickLinks',
  ships: 'wb.ships',
} as const

export const ROUTINE_PRESETS = ['工作', '英语练习', '看书', '技能学习--剪辑', '健身']

/** 日课分类颜色（用于时间追踪图表统一配色） */
export const TAG_COLORS: { tag: string; color: string }[] = [
  { tag: '工作', color: '#4f6dff' },
  { tag: '英语练习', color: '#8a6dff' },
  { tag: '看书', color: '#2bb673' },
  { tag: '技能学习--剪辑', color: '#f5a623' },
  { tag: '健身', color: '#e85d75' },
]

export const OTHER_TAG_COLOR = '#97a0b0'

export function tagColor(tag?: string): string {
  if (!tag) return OTHER_TAG_COLOR
  return TAG_COLORS.find((t) => t.tag === tag)?.color ?? OTHER_TAG_COLOR
}

/** 构造时间记录条目（任务离开「进行中」时调用） */
export function createTimeLog(
  task: Pick<Task, 'title' | 'tag'>,
  startedAt: number,
  endedAt: number
): TimeLog | null {
  const duration = Math.round((endedAt - startedAt) / 1000)
  if (duration < 1) return null
  const d = new Date(startedAt)
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return {
    id: endedAt,
    taskTitle: task.title,
    tag: task.tag,
    startedAt,
    endedAt,
    duration,
    date,
  }
}

export const TASK_COLUMNS: {
  key: Task['status']
  label: string
  accent: string
}[] = [
  { key: 'todo', label: '待办', accent: 'var(--text-faint)' },
  { key: 'doing', label: '进行中', accent: 'var(--accent)' },
  { key: 'done', label: '已完成', accent: 'var(--green)' },
]

/* 艾森豪威尔四象限：XY轴 X=紧急(左→右) Y=重要(下→上) */
export const QUADRANTS: {
  key: Quadrant
  label: string
  short: string
  color: string
  soft: string
  desc: string
}[] = [
  { key: 'q1', label: '紧急·重要', short: '急·重', color: '#e85d75', soft: '#fde8ec', desc: '立即做' },
  { key: 'q2', label: '不紧急·重要', short: '缓·重', color: '#4f6dff', soft: '#eaf0ff', desc: '计划做' },
  { key: 'q3', label: '紧急·不重要', short: '急·轻', color: '#f5a623', soft: '#fdf3e2', desc: '快做/委托' },
  { key: 'q4', label: '不紧急·不重要', short: '缓·轻', color: '#97a0b0', soft: '#eef0f4', desc: '暂缓' },
]

export function quadrantMeta(q: Quadrant) {
  return QUADRANTS.find((x) => x.key === q) ?? QUADRANTS[3]
}

export const TOPIC_STATUS: {
  key: Topic['status']
  label: string
  color: string
  soft: string
}[] = [
  { key: 'idea', label: '灵感', color: '#8a6dff', soft: '#efebff' },
  { key: 'confirmed', label: '已定', color: '#4f6dff', soft: '#eaf0ff' },
  { key: 'filming', label: '拍摄中', color: '#f5a623', soft: '#fdf3e2' },
  { key: 'published', label: '已发', color: '#2bb673', soft: '#e6f7ee' },
  { key: 'dropped', label: '已弃', color: '#97a0b0', soft: '#eef0f4' },
]

export function topicMeta(status: Topic['status']) {
  return TOPIC_STATUS.find((s) => s.key === status) ?? TOPIC_STATUS[0]
}

/** 跨页写入：把灵感转成选题（状态=灵感）。直接写 localStorage，切到选题页会重新读取。 */
export function pushTopic(input: { title: string; note?: string; heat?: number }) {
  const raw = localStorage.getItem(KEYS.topics)
  const list: Topic[] = raw ? (JSON.parse(raw) as Topic[]) : []
  const t: Topic = {
    id: Date.now(),
    title: input.title.trim(),
    status: 'idea',
    note: input.note?.trim() || undefined,
    heat: input.heat,
    createdAt: Date.now(),
  }
  list.unshift(t)
  localStorage.setItem(KEYS.topics, JSON.stringify(list))
  return t
}

/** 跨页写入：把灵感标记为已转。 */
export function markInspirationConverted(id: number) {
  const raw = localStorage.getItem(KEYS.inspirations)
  const list = raw ? JSON.parse(raw) : []
  const next = list.map((it: { id: number; converted: boolean }) =>
    it.id === id ? { ...it, converted: true } : it
  )
  localStorage.setItem(KEYS.inspirations, JSON.stringify(next))
}

/* ===== 灵感库（长期素材库） ===== */

export const INSP_LIB_CATEGORIES: {
  key: InspLibCategory
  label: string
  color: string
  soft: string
  icon: string
}[] = [
  { key: 'work', label: '工作向', color: '#4f6dff', soft: '#eaf0ff', icon: '⚒' },
  { key: 'humor', label: '幽默向', color: '#f5a623', soft: '#fdf3e2', icon: '☺' },
  { key: 'word', label: '词向', color: '#2bb673', soft: '#e6f7ee', icon: '✦' },
  { key: 'daily', label: '日常', color: '#e85d75', soft: '#fde8ec', icon: '☀' },
]

export function inspLibMeta(cat: InspLibCategory) {
  return INSP_LIB_CATEGORIES.find((c) => c.key === cat) ?? INSP_LIB_CATEGORIES[0]
}

/* ===== 日历日程 ===== */

export const SCHEDULE_COLORS: {
  key: string
  label: string
  color: string
  soft: string
}[] = [
  { key: 'blue', label: '蓝', color: '#4f6dff', soft: '#eaf0ff' },
  { key: 'orange', label: '橙', color: '#f5a623', soft: '#fdf3e2' },
  { key: 'green', label: '绿', color: '#2bb673', soft: '#e6f7ee' },
  { key: 'red', label: '粉', color: '#e85d75', soft: '#fde8ec' },
  { key: 'purple', label: '紫', color: '#8a6dff', soft: '#efebff' },
]

export function scheduleColorMeta(key: string) {
  return SCHEDULE_COLORS.find((c) => c.key === key) ?? SCHEDULE_COLORS[0]
}

/* ===== 健身训练记录 ===== */

export const MUSCLE_GROUPS: {
  key: MuscleGroup
  label: string
  color: string
  soft: string
}[] = [
  { key: 'chest', label: '胸', color: '#e85d75', soft: '#fde8ec' },
  { key: 'back', label: '背', color: '#4f6dff', soft: '#eaf0ff' },
  { key: 'legs', label: '腿', color: '#2bb673', soft: '#e6f7ee' },
  { key: 'shoulders', label: '肩', color: '#f5a623', soft: '#fdf3e2' },
  { key: 'abs', label: '腹', color: '#8a6dff', soft: '#efebff' },
  { key: 'rest', label: '休息', color: '#97a0b0', soft: '#eef0f4' },
]

export function muscleMeta(k: MuscleGroup) {
  return MUSCLE_GROUPS.find((m) => m.key === k) ?? MUSCLE_GROUPS[0]
}

/* ===== 电商工作台 ===== */

/** 默认快捷链接预设（首次打开时填充） */
export const DEFAULT_QUICK_LINKS: QuickLink[] = [
  { id: 1, name: '小红书', url: 'https://creator.xiaohongshu.com', color: '#ff2442', createdAt: 1 },
  { id: 2, name: '抖音', url: 'https://creator.douyin.com', color: '#161823', createdAt: 2 },
  { id: 3, name: '淘宝', url: 'https://myseller.taobao.com', color: '#ff5000', createdAt: 3 },
  { id: 4, name: '拼多多', url: 'https://mms.pinduoduo.com', color: '#e02e24', createdAt: 4 },
  { id: 5, name: '1688', url: 'https://work.1688.com', color: '#ff6a00', createdAt: 5 },
  { id: 6, name: '微信小店', url: 'https://store.weixin.qq.com', color: '#07c160', createdAt: 6 },
  { id: 7, name: '快手', url: 'https://s.kwaixiaodian.com', color: '#ff4906', createdAt: 7 },
  { id: 8, name: '京东', url: 'https://store.jd.com', color: '#e1251b', createdAt: 8 },
]
