import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { SCHEDULE_COLORS, scheduleColorMeta } from '../lib/store'
import type { ScheduleItem } from '../lib/types'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

function pad(n: number): string {
  return n < 10 ? '0' + n : String(n)
}

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** 计算目标日期距今天的天数（正=未来，0=今天，负=过去） */
function daysDiff(dateStr: string): number {
  const t = new Date()
  t.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T00:00:00')
  return Math.round((target.getTime() - t.getTime()) / 86400000)
}

export function CalendarSchedulePage() {
  const [list, setList] = useLocalStorage<ScheduleItem[]>('wb.schedules', [])
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(todayStr())
  const [note, setNote] = useState('')
  const [color, setColor] = useState(SCHEDULE_COLORS[0].key)

  const today = new Date()
  const [cal, setCal] = useState({ y: today.getFullYear(), m: today.getMonth() })

  function add() {
    const v = title.trim()
    if (!v || !date) return
    setList((prev) => [
      {
        id: Date.now(),
        title: v,
        date,
        note: note.trim() || undefined,
        color,
        done: false,
        createdAt: Date.now(),
      },
      ...prev,
    ])
    setTitle('')
    setNote('')
  }

  function remove(id: number) {
    setList((prev) => prev.filter((s) => s.id !== id))
  }

  function toggleDone(id: number) {
    setList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, done: !s.done } : s))
    )
  }

  /** 未完成在前，按日期升序；已完成在后 */
  const sorted = [...list].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    return a.date.localeCompare(b.date)
  })

  // --- 月历 ---
  const firstWd = new Date(cal.y, cal.m, 1).getDay()
  const daysInMonth = new Date(cal.y, cal.m + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < firstWd; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  function cellDate(d: number): string {
    return `${cal.y}-${pad(cal.m + 1)}-${pad(d)}`
  }
  function isToday(d: number): boolean {
    return (
      today.getFullYear() === cal.y &&
      today.getMonth() === cal.m &&
      today.getDate() === d
    )
  }
  function schedulesOn(d: number): ScheduleItem[] {
    return list.filter((s) => s.date === cellDate(d))
  }

  function prevMonth() {
    setCal((p) => {
      let m = p.m - 1
      let y = p.y
      if (m < 0) {
        m = 11
        y--
      }
      return { y, m }
    })
  }
  function nextMonth() {
    setCal((p) => {
      let m = p.m + 1
      let y = p.y
      if (m > 11) {
        m = 0
        y++
      }
      return { y, m }
    })
  }
  function goToday() {
    setCal({ y: today.getFullYear(), m: today.getMonth() })
  }

  function pickDate(d: number) {
    setDate(cellDate(d))
  }

  return (
    <div className="cal-sched">
      <div className="cal-body">
        {/* 左：月历 */}
        <div className="card cal-cal">
          <div className="cal-nav">
            <button className="icon-btn" onClick={prevMonth} title="上个月">
              ‹
            </button>
            <span className="cal-month-label">
              {cal.y}年{cal.m + 1}月
            </span>
            <button className="icon-btn" onClick={nextMonth} title="下个月">
              ›
            </button>
            <button
              className="btn ghost sm"
              onClick={goToday}
              style={{ marginLeft: 'auto' }}
            >
              回到今天
            </button>
          </div>
          <div className="cal-weekdays">
            {WEEKDAYS.map((w) => (
              <span key={w} className={`cal-wd ${w === '日' || w === '六' ? 'weekend' : ''}`}>
                {w}
              </span>
            ))}
          </div>
          <div className="cal-grid">
            {cells.map((d, i) =>
              d === null ? (
                <div key={i} className="cal-cell empty" />
              ) : (
                <div
                  key={i}
                  className={`cal-cell ${isToday(d) ? 'today' : ''} ${date === cellDate(d) ? 'selected' : ''}`}
                  onClick={() => pickDate(d)}
                >
                  <span className="cal-day">{d}</span>
                  {schedulesOn(d).length > 0 && (
                    <div className="cal-dots">
                      {schedulesOn(d).slice(0, 4).map((s) => (
                        <span
                          key={s.id}
                          className="cal-dot"
                          style={{ background: scheduleColorMeta(s.color).color }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )
            )}
          </div>
          <div className="cal-hint">点击日期可选中到右侧新建日程</div>
        </div>

        {/* 右：新建 + 倒计时列表 */}
        <div className="cal-side">
          <div className="card">
            <div className="card-head">
              <div className="card-title">
                <span className="dot" style={{ background: 'var(--accent)' }} />
                新建日程
              </div>
              <span className="card-sub">选日期 · 自动算倒计时</span>
            </div>
            <div className="sched-form">
              <input
                className="input"
                placeholder="日程标题：视频发布 / 考试 / 旅行…"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    add()
                  }
                }}
              />
              <div className="sched-row">
                <input
                  type="date"
                  className="input sched-date-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <div className="color-pick">
                  {SCHEDULE_COLORS.map((c) => (
                    <button
                      key={c.key}
                      className={`color-dot ${color === c.key ? 'active' : ''}`}
                      style={{ background: c.color }}
                      onClick={() => setColor(c.key)}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
              <input
                className="input"
                placeholder="备注（可选）"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    add()
                  }
                }}
              />
              <div className="form-foot">
                <button className="btn" onClick={add}>
                  添加日程
                </button>
              </div>
            </div>
          </div>

          <div className="sched-list">
            <div className="card-head" style={{ marginBottom: 12 }}>
              <div className="card-title">
                <span className="dot" style={{ background: 'var(--amber)' }} />
                日程倒计时
              </div>
              <span className="card-sub">{list.length} 条</span>
            </div>
            {sorted.length === 0 ? (
              <div className="empty card">
                还没有日程，添加一条开始倒计时
              </div>
            ) : (
              sorted.map((s) => {
                const diff = daysDiff(s.date)
                const meta = scheduleColorMeta(s.color)
                return (
                  <div
                    key={s.id}
                    className={`sched-card ${s.done ? 'done' : ''}`}
                    style={{ borderLeftColor: meta.color }}
                  >
                    <div className="sched-main">
                      <div className="sched-top">
                        <span
                          className="sched-countdown"
                          style={{ background: meta.soft, color: meta.color }}
                        >
                          {s.done
                            ? '✓ 已完成'
                            : diff > 0
                              ? `还剩 ${diff} 天`
                              : diff === 0
                                ? '📌 就是今天'
                                : `已过 ${-diff} 天`}
                        </span>
                        <span className="sched-date-text">{s.date}</span>
                      </div>
                      <div className="sched-title">{s.title}</div>
                      {s.note && <div className="sched-note">{s.note}</div>}
                    </div>
                    <div className="sched-actions">
                      <button
                        className="icon-btn"
                        onClick={() => toggleDone(s.id)}
                        title={s.done ? '标记未完成' : '标记完成'}
                      >
                        {s.done ? '↶' : '○'}
                      </button>
                      <button
                        className="icon-btn"
                        onClick={() => remove(s.id)}
                        title="删除"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
