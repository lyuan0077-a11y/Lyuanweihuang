import { TAG_COLORS, OTHER_TAG_COLOR } from '../lib/store'
import type { TimeLog } from '../lib/types'

/* ===== 工具函数 ===== */

function fmtDur(sec: number): string {
  if (sec < 60) return `${sec}秒`
  const m = Math.floor(sec / 60)
  if (m < 60) return `${m}分`
  const h = Math.floor(m / 60)
  const rm = m % 60
  return rm ? `${h}时${rm}分` : `${h}时`
}

function dateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

function tagColorFor(tag: string): string {
  if (tag === '其他') return OTHER_TAG_COLOR
  return TAG_COLORS.find((t) => t.tag === tag)?.color ?? OTHER_TAG_COLOR
}

/** 有数据出现的分类列表（保持 TAG_COLORS 顺序 + 其他） */
function activeTags(logs: TimeLog[]): string[] {
  const base = TAG_COLORS.map((t) => t.tag)
  const extra: string[] = []
  logs.forEach((l) => {
    const tag = l.tag || '其他'
    if (!base.includes(tag) && !extra.includes(tag)) extra.push(tag)
  })
  return [...base, ...extra]
}

/* ===== 组件 ===== */

export function TimeAnalytics({ logs }: { logs: TimeLog[] }) {
  /* ---------- 昨日 ---------- */
  const yd = new Date()
  yd.setDate(yd.getDate() - 1)
  const yStr = dateStr(yd)
  const yLogs = logs.filter((l) => l.date === yStr)

  const yByTag = new Map<string, number>()
  yLogs.forEach((l) => {
    const tag = l.tag || '其他'
    yByTag.set(tag, (yByTag.get(tag) || 0) + l.duration)
  })
  const ySorted = Array.from(yByTag.entries())
    .map(([tag, dur]) => ({ tag, dur }))
    .sort((a, b) => b.dur - a.dur)
  const yTotal = yLogs.reduce((s, l) => s + l.duration, 0)
  const yMax = ySorted.length ? ySorted[0].dur : 1

  /* ---------- 近7天 ---------- */
  const days7: {
    label: string
    weekday: string
    byTag: Map<string, number>
    total: number
  }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const ds = dateStr(d)
    const dayLogs = logs.filter((l) => l.date === ds)
    const byTag = new Map<string, number>()
    let total = 0
    dayLogs.forEach((l) => {
      const tag = l.tag || '其他'
      byTag.set(tag, (byTag.get(tag) || 0) + l.duration)
      total += l.duration
    })
    days7.push({
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      weekday: WEEKDAYS[d.getDay()],
      byTag,
      total,
    })
  }

  // 近7天按分类汇总
  const wByTag = new Map<string, number>()
  days7.forEach((d) => {
    d.byTag.forEach((dur, tag) => {
      wByTag.set(tag, (wByTag.get(tag) || 0) + dur)
    })
  })
  const wSorted = Array.from(wByTag.entries())
    .map(([tag, dur]) => ({ tag, dur }))
    .sort((a, b) => b.dur - a.dur)
  const wTotal = days7.reduce((s, d) => s + d.total, 0)

  // 图表中出现的分类
  const chartTags = activeTags(logs).filter((t) => (wByTag.get(t) || 0) > 0)

  /* ---------- SVG 堆叠柱状图 ---------- */
  const W = 580
  const H = 240
  const padL = 40
  const padR = 16
  const padT = 18
  const padB = 38
  const cw = W - padL - padR
  const ch = H - padT - padB
  const slot = cw / 7
  const barW = slot * 0.5

  const maxDayTotal = Math.max(...days7.map((d) => d.total), 1)
  // Y 轴最大值（向上取整到小时）
  const maxYSec = Math.max(Math.ceil(maxDayTotal / 3600) * 3600, 3600)
  const yTicks = Math.min(Math.ceil(maxYSec / 3600), 6)

  return (
    <div className="time-analytics">
      {/* ====== 昨日时间分布 ====== */}
      <div className="ta-section">
        <div className="ta-head">
          <div className="card-title">
            <span className="dot" style={{ background: '#8a6dff' }} />
            昨日时间分布
            <span className="ta-date">{yStr}</span>
          </div>
          <span className="card-sub">合计 {fmtDur(yTotal)}</span>
        </div>

        {yTotal === 0 ? (
          <div className="ta-empty">
            昨天没有进行中的任务计时记录
            <br />
            <span className="ta-hint">
              将任务移入「进行中」会自动开始计时
            </span>
          </div>
        ) : (
          <div className="ta-bars">
            {ySorted.map((s) => (
              <div className="ta-bar-row" key={s.tag}>
                <div
                  className="ta-bar-label"
                  style={{ color: tagColorFor(s.tag) }}
                >
                  {s.tag}
                </div>
                <div className="ta-bar-track">
                  <div
                    className="ta-bar-fill"
                    style={{
                      width: `${(s.dur / yMax) * 100}%`,
                      background: tagColorFor(s.tag),
                    }}
                  >
                    <span className="ta-bar-pct">
                      {Math.round((s.dur / yTotal) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="ta-bar-time">{fmtDur(s.dur)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ====== 近7天时间分布 ====== */}
      <div className="ta-section">
        <div className="ta-head">
          <div className="card-title">
            <span className="dot" style={{ background: '#4f6dff' }} />
            近7天时间分布
          </div>
          <span className="card-sub">合计 {fmtDur(wTotal)}</span>
        </div>

        {/* 分类汇总 chips */}
        {wSorted.length > 0 && (
          <div className="ta-weekly-summary">
            {wSorted.map((s) => (
              <div className="ta-sum-chip" key={s.tag}>
                <span
                  className="ta-sum-dot"
                  style={{ background: tagColorFor(s.tag) }}
                />
                <span className="ta-sum-tag">{s.tag}</span>
                <span className="ta-sum-time">{fmtDur(s.dur)}</span>
              </div>
            ))}
          </div>
        )}

        {/* 堆叠柱状图 */}
        <div className="ta-chart-wrap">
          {wTotal === 0 ? (
            <div className="ta-empty">
              近7天暂无时间记录
              <br />
              <span className="ta-hint">
                将任务移入「进行中」即自动计时，移出时自动记录
              </span>
            </div>
          ) : (
            <svg viewBox={`0 0 ${W} ${H}`} className="ta-svg" preserveAspectRatio="xMidYMid meet">
              {/* Y 轴网格线 + 刻度 */}
              {Array.from({ length: yTicks + 1 }, (_, i) => {
                const y = padT + ch - (i / yTicks) * ch
                const hours = (maxYSec / 3600) * (i / yTicks)
                return (
                  <g key={i}>
                    <line
                      x1={padL}
                      y1={y}
                      x2={W - padR}
                      y2={y}
                      stroke="#eef0f4"
                      strokeWidth={1}
                    />
                    <text
                      x={padL - 6}
                      y={y + 3.5}
                      textAnchor="end"
                      fontSize="10"
                      fill="#97a0b0"
                    >
                      {hours}h
                    </text>
                  </g>
                )
              })}

              {/* 柱子 */}
              {days7.map((d, i) => {
                const x = padL + slot * i + (slot - barW) / 2
                const barH = (d.total / maxYSec) * ch
                let yOff = padT + ch - barH

                return (
                  <g key={i}>
                    {/* 堆叠段 */
                    chartTags.map((tag, si) => {
                      const dur = d.byTag.get(tag) || 0
                      if (dur === 0) return null
                      const segH = (dur / maxYSec) * ch
                      const segY = yOff
                      yOff += segH
                      return (
                        <rect
                          key={`${tag}-${si}`}
                          x={x}
                          y={segY}
                          width={barW}
                          height={segH}
                          fill={tagColorFor(tag)}
                          rx={si === chartTags.filter((t) => d.byTag.get(t)).length - 1 ? 3 : 0}
                        />
                      )
                    })}
                    {/* 顶部时间标签 */
                    d.total > 0 && (
                      <text
                        x={x + barW / 2}
                        y={padT + ch - barH - 5}
                        textAnchor="middle"
                        fontSize="9"
                        fill="#5b6378"
                      >
                        {fmtDur(d.total)}
                      </text>
                    )}
                    {/* X 轴标签 */}
                    <text
                      x={x + barW / 2}
                      y={H - 20}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#5b6378"
                      fontWeight={d.total > 0 ? 600 : 400}
                    >
                      {d.weekday}
                    </text>
                    <text
                      x={x + barW / 2}
                      y={H - 7}
                      textAnchor="middle"
                      fontSize="9"
                      fill="#97a0b0"
                    >
                      {d.label}
                    </text>
                  </g>
                )
              })}
            </svg>
          )}
        </div>

        {/* 图例 */
        chartTags.length > 0 && wTotal > 0 && (
          <div className="ta-legend">
            {chartTags.map((tag) => (
              <div className="ta-legend-item" key={tag}>
                <span
                  className="ta-legend-dot"
                  style={{ background: tagColorFor(tag) }}
                />
                {tag}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
