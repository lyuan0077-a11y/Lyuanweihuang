import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { MUSCLE_GROUPS, muscleMeta } from '../lib/store'
import type { WorkoutLog, MuscleGroup } from '../lib/types'

function todayStr() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

/** 周一作为一周起点（中国习惯） */
function weekStart(d: Date) {
  const date = new Date(d)
  const day = date.getDay() || 7 // 0=周日 → 7
  date.setDate(date.getDate() - day + 1)
  date.setHours(0, 0, 0, 0)
  return date
}

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日']

/** 肌群小图标（纯 SVG，currentColor 着色） */
function MuscleIcon({ group, size = 26 }: { group: MuscleGroup; size?: number }) {
  const p = { width: size, height: size, viewBox: '0 0 28 28', fill: 'none' as const }
  switch (group) {
    case 'chest': // 盾形胸肌 + 中缝
      return (
        <svg {...p}>
          <path d="M14 4 L24 8 V15 Q24 22 14 25 Q4 22 4 15 V8 Z" fill="currentColor" />
          <path d="M14 8.5 V22.5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      )
    case 'back': // 倒三角背阔 + 脊柱
      return (
        <svg {...p}>
          <path d="M14 4 L25.5 23 H2.5 Z" fill="currentColor" />
          <path d="M14 11 V21" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      )
    case 'legs': // 两条腿
      return (
        <svg {...p}>
          <rect x="8" y="4" width="4.6" height="20" rx="2.3" fill="currentColor" />
          <rect x="15.4" y="4" width="4.6" height="20" rx="2.3" fill="currentColor" />
        </svg>
      )
    case 'shoulders': // 宽肩 + 躯干
      return (
        <svg {...p}>
          <rect x="3" y="5" width="22" height="5.6" rx="2.8" fill="currentColor" />
          <rect x="10.5" y="10.6" width="7" height="13" rx="3" fill="currentColor" />
        </svg>
      )
    case 'abs': // 腹肌六块
      return (
        <svg {...p}>
          <rect x="8" y="5" width="4.6" height="4.6" rx="1.6" fill="currentColor" />
          <rect x="15.4" y="5" width="4.6" height="4.6" rx="1.6" fill="currentColor" />
          <rect x="8" y="11.4" width="4.6" height="4.6" rx="1.6" fill="currentColor" />
          <rect x="15.4" y="11.4" width="4.6" height="4.6" rx="1.6" fill="currentColor" />
          <rect x="8" y="17.8" width="4.6" height="4.6" rx="1.6" fill="currentColor" />
          <rect x="15.4" y="17.8" width="4.6" height="4.6" rx="1.6" fill="currentColor" />
        </svg>
      )
    case 'rest': // 月亮
      return (
        <svg {...p}>
          <path
            d="M21.5 16.5 a8 8 0 1 1 -9.5 -9.5 a6.2 6.2 0 0 0 9.5 9.5 Z"
            fill="currentColor"
          />
        </svg>
      )
  }
}

/** 近7天有氧柱状图 */
function CardioChart({ logs }: { logs: WorkoutLog[] }) {
  const ws = weekStart(new Date())
  const days: { date: string; label: string; weekday: string; min: number }[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(ws)
    d.setDate(ws.getDate() + i)
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const log = logs.find((l) => l.date === ds)
    days.push({
      date: ds,
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      weekday: WEEKDAYS[i],
      min: log?.cardioMin ?? 0,
    })
  }

  const W = 560
  const H = 188
  const padL = 34
  const padR = 14
  const padT = 16
  const padB = 34
  const plotW = W - padL - padR
  const plotH = H - padT - padB
  const maxMin = Math.max(30, ...days.map((d) => d.min))
  const niceMax = Math.ceil(maxMin / 15) * 15 || 15
  const baseY = padT + plotH
  const barGap = 14
  const barW = (plotW - barGap * 6) / 7
  const ticks = 4

  return (
    <svg
      className="wk-chart"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="本周有氧时长"
    >
      {/* Y 轴网格 + 刻度 */}
      {Array.from({ length: ticks + 1 }).map((_, i) => {
        const v = (niceMax / ticks) * i
        const y = baseY - (v / niceMax) * plotH
        return (
          <g key={i}>
            <line
              x1={padL}
              y1={y}
              x2={W - padR}
              y2={y}
              stroke="#e8ebf2"
              strokeWidth="1"
              strokeDasharray={i === 0 ? '0' : '3 4'}
            />
            <text x={padL - 6} y={y + 3.5} textAnchor="end" fontSize="10" fill="#97a0b0">
              {v}
            </text>
          </g>
        )
      })}
      <text x={padL - 6} y={padT - 4} textAnchor="end" fontSize="10" fill="#5b6472" fontWeight="600">
        分钟
      </text>
      {days.map((d, i) => {
        const x = padL + i * (barW + barGap)
        const h = d.min ? (d.min / niceMax) * plotH : 0
        const y = baseY - h
        const isToday = d.date === todayStr()
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={h}
              rx="4"
              fill={d.min ? (isToday ? '#e85d75' : '#f5a623') : '#eef0f4'}
            />
            {d.min > 0 && (
              <text
                x={x + barW / 2}
                y={y - 6}
                textAnchor="middle"
                fontSize="10.5"
                fill="#1f2430"
                fontWeight="700"
              >
                {d.min}
              </text>
            )}
            <text
              x={x + barW / 2}
              y={baseY + 15}
              textAnchor="middle"
              fontSize="11"
              fill={isToday ? '#e85d75' : '#5b6472'}
              fontWeight={isToday ? 700 : 500}
            >
              {d.weekday}
            </text>
            <text
              x={x + barW / 2}
              y={baseY + 28}
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
  )
}

export function WorkoutModal({ onClose }: { onClose: () => void }) {
  const [logs, setLogs] = useLocalStorage<WorkoutLog[]>('wb.workouts', [])
  const [date, setDate] = useState(todayStr())
  const [cardioInput, setCardioInput] = useState('')

  const today = logs.find((l) => l.date === date)
  const todayMuscles = today?.muscles ?? []

  function toggleMuscle(m: MuscleGroup) {
    setLogs((prev) => {
      const idx = prev.findIndex((l) => l.date === date)
      if (idx === -1) {
        const log: WorkoutLog = {
          id: Date.now(),
          date,
          muscles: [m],
          cardioMin: 0,
          createdAt: Date.now(),
        }
        return [...prev, log]
      }
      const log = prev[idx]
      const has = log.muscles.includes(m)
      const muscles = has
        ? log.muscles.filter((x) => x !== m)
        : [...log.muscles, m]
      const next = [...prev]
      next[idx] = { ...log, muscles }
      return next
    })
  }

  function saveCardio() {
    const v = parseInt(cardioInput, 10)
    if (isNaN(v) || v < 0) return
    setLogs((prev) => {
      const idx = prev.findIndex((l) => l.date === date)
      if (idx === -1) {
        const log: WorkoutLog = {
          id: Date.now(),
          date,
          muscles: [],
          cardioMin: v,
          createdAt: Date.now(),
        }
        return [...prev, log]
      }
      const log = prev[idx]
      const next = [...prev]
      next[idx] = { ...log, cardioMin: v }
      return next
    })
    setCardioInput('')
  }

  function clearCardio() {
    setLogs((prev) => {
      const idx = prev.findIndex((l) => l.date === date)
      if (idx === -1) return prev
      const log = prev[idx]
      const next = [...prev]
      next[idx] = { ...log, cardioMin: 0 }
      return next
    })
  }

  // 本周统计
  const ws = weekStart(new Date())
  const weekLogs = logs.filter((l) => {
    const ld = new Date(l.date + 'T00:00:00')
    return ld >= ws
  })
  const cardioDays = weekLogs.filter((l) => l.cardioMin > 0).length
  const cardioTotal = weekLogs.reduce((s, l) => s + l.cardioMin, 0)
  const muscleDays: Record<string, number> = {}
  weekLogs.forEach((l) =>
    l.muscles.forEach((m) => {
      muscleDays[m] = (muscleDays[m] ?? 0) + 1
    })
  )
  const trainDays = weekLogs.filter((l) => l.muscles.length > 0).length
  const restDays = muscleDays['rest'] ?? 0

  function fmtMin(min: number) {
    if (min < 60) return `${min} 分钟`
    const h = Math.floor(min / 60)
    const m = min % 60
    return m ? `${h} 时 ${m} 分` : `${h} 小时`
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card wk-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">
            <span className="wk-head-ico">💪</span>
            健身 · 训练记录
          </div>
          <button className="modal-close" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* 日期选择 */}
          <div className="wk-date-row">
            <label className="wk-date-label">日期</label>
            <input
              className="input wk-date-input"
              type="date"
              value={date}
              max={todayStr()}
              onChange={(e) => setDate(e.target.value)}
            />
            {date !== todayStr() && (
              <button className="wk-today-btn" onClick={() => setDate(todayStr())}>
                回到今天
              </button>
            )}
          </div>

          {/* 力量训练打勾 */}
          <div className="wk-section">
            <div className="wk-section-title">
              力量训练 · 今日练了哪些
              <span className="wk-section-sub">点一下打勾</span>
            </div>
            <div className="wk-muscle-grid">
              {MUSCLE_GROUPS.map((mg) => {
                const active = todayMuscles.includes(mg.key)
                return (
                  <button
                    key={mg.key}
                    className={`wk-muscle-card ${active ? 'active' : ''}`}
                    style={
                      active
                        ? { background: mg.color, borderColor: mg.color }
                        : { background: mg.soft, borderColor: 'transparent' }
                    }
                    onClick={() => toggleMuscle(mg.key)}
                  >
                    <span
                      className="wk-muscle-ico"
                      style={{ color: active ? '#fff' : mg.color }}
                    >
                      <MuscleIcon group={mg.key} />
                    </span>
                    <span
                      className="wk-muscle-label"
                      style={{ color: active ? '#fff' : mg.color }}
                    >
                      {mg.label}
                    </span>
                    {active && <span className="wk-check">✓</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 有氧记录 */}
          <div className="wk-section">
            <div className="wk-section-title">
              有氧训练 · 今日时长
              {today?.cardioMin ? (
                <span className="wk-cardio-now">
                  今日已记 <b>{today.cardioMin}</b> 分钟
                  <button className="wk-clear-btn" onClick={clearCardio}>
                    清除
                  </button>
                </span>
              ) : (
                <span className="wk-section-sub">输入分钟数</span>
              )}
            </div>
            <div className="wk-cardio-input">
              <input
                className="input"
                type="number"
                min="0"
                placeholder="如 30"
                value={cardioInput}
                onChange={(e) => setCardioInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveCardio()
                }}
              />
              <span className="wk-unit">分钟</span>
              <button className="btn" onClick={saveCardio}>
                记录
              </button>
            </div>
          </div>

          {/* 本周统计 */}
          <div className="wk-section">
            <div className="wk-section-title">
              本周统计
              <span className="wk-section-sub">周一至周日</span>
            </div>
            <div className="wk-stats">
              <div className="wk-stat">
                <div className="wk-stat-val" style={{ color: '#f5a623' }}>
                  {cardioDays}
                </div>
                <div className="wk-stat-label">有氧次数</div>
              </div>
              <div className="wk-stat">
                <div className="wk-stat-val" style={{ color: '#e85d75' }}>
                  {fmtMin(cardioTotal)}
                </div>
                <div className="wk-stat-label">有氧总时长</div>
              </div>
              <div className="wk-stat">
                <div className="wk-stat-val" style={{ color: '#4f6dff' }}>
                  {trainDays}
                </div>
                <div className="wk-stat-label">力量训练天数</div>
              </div>
              <div className="wk-stat">
                <div className="wk-stat-val" style={{ color: '#97a0b0' }}>
                  {restDays}
                </div>
                <div className="wk-stat-label">休息天数</div>
              </div>
            </div>

            {/* 各肌群本周天数 */}
            <div className="wk-muscle-week">
              {MUSCLE_GROUPS.filter((m) => m.key !== 'rest').map((mg) => (
                <span
                  key={mg.key}
                  className={`wk-mw-chip ${muscleDays[mg.key] ? 'has' : ''}`}
                  style={{
                    background: muscleDays[mg.key] ? mg.soft : '#f4f6fa',
                    color: muscleDays[mg.key] ? mg.color : '#97a0b0',
                  }}
                >
                  {mg.label} {muscleDays[mg.key] ?? 0} 天
                </span>
              ))}
            </div>
          </div>

          {/* 本周有氧柱状图 */}
          <div className="wk-section">
            <div className="wk-section-title">
              本周有氧时长 · 趋势
              <span className="wk-section-sub">每天有氧分钟数</span>
            </div>
            <div className="wk-chart-wrap">
              <CardioChart logs={logs} />
            </div>
            <div className="wk-legend">
              <span className="wk-lg-item">
                <span className="wk-lg-dot" style={{ background: '#e85d75' }} />
                今天
              </span>
              <span className="wk-lg-item">
                <span className="wk-lg-dot" style={{ background: '#f5a623' }} />
                有氧
              </span>
              <span className="wk-lg-item">
                <span className="wk-lg-dot" style={{ background: '#eef0f4' }} />
                无
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
