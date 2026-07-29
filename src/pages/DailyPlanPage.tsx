import { useState, useEffect } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { QUADRANTS, ROUTINE_PRESETS, TASK_COLUMNS, createTimeLog } from '../lib/store'
import type { Task, TaskStatus, Quadrant, TimeLog } from '../lib/types'
import { WeightModal } from '../components/WeightModal'
import { WorkoutModal } from '../components/WorkoutModal'
import { WorkModal } from '../components/WorkModal'
import { QuadrantChart } from '../components/QuadrantChart'
import { TimeAnalytics } from '../components/TimeAnalytics'

/** 格式化实时计时器：HH:MM:SS */
function fmtTimer(sec: number): string {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function StatCard({
  label,
  value,
  suffix,
  accent,
}: {
  label: string
  value: string | number
  suffix?: string
  accent: string
}) {
  return (
    <div className="stat-card">
      <div className="stat-value" style={{ color: accent }}>
        {value}
        {suffix && <span className="stat-suffix">{suffix}</span>}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

function TaskCard({
  task,
  onMove,
  onRemove,
  onDragStart,
  onSetQuadrant,
}: {
  task: Task
  onMove: (dir: -1 | 1) => void
  onRemove: () => void
  onDragStart: (e: React.DragEvent) => void
  onSetQuadrant: (q: Quadrant) => void
}) {
  const idx = TASK_COLUMNS.findIndex((c) => c.key === task.status)
  const isDoing = task.status === 'doing' && task.startedAt
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!task.startedAt || task.status !== 'doing') {
      setElapsed(0)
      return
    }
    const tick = () =>
      setElapsed(Math.floor((Date.now() - task.startedAt!) / 1000))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [task.status, task.startedAt])

  return (
    <div
      className="task-card"
      draggable
      onDragStart={(e) => onDragStart(e)}
    >
      <div className="task-tag-row">
        {task.tag && <span className="task-tag">{task.tag}</span>}
        <div className="task-actions">
          <button
            className="icon-btn"
            disabled={idx === 0}
            onClick={() => onMove(-1)}
            title="左移"
          >
            ‹
          </button>
          <button
            className="icon-btn"
            disabled={idx === TASK_COLUMNS.length - 1}
            onClick={() => onMove(1)}
            title="右移"
          >
            ›
          </button>
          <button className="icon-btn" onClick={onRemove} title="删除">
            ×
          </button>
        </div>
      </div>
      <div className="task-title">{task.title}</div>
      <div className="task-time">
        {new Date(task.createdAt).toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
      {isDoing && (
        <div className="task-timer">
          <span className="task-timer-dot" />
          <span className="task-timer-text">{fmtTimer(elapsed)}</span>
        </div>
      )}
      <div className="quad-picker">
        {QUADRANTS.map((q) => (
          <button
            key={q.key}
            className={`qp-btn ${task.quadrant === q.key ? 'active' : ''}`}
            style={
              task.quadrant === q.key
                ? { background: q.color, color: '#fff', borderColor: q.color }
                : undefined
            }
            onClick={() => onSetQuadrant(q.key)}
            title={q.label + ' · ' + q.desc}
          >
            {q.short}
          </button>
        ))}
      </div>
    </div>
  )
}

export function DailyPlanPage() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('wb.tasks', [])
  const [logs, setLogs] = useLocalStorage<TimeLog[]>('wb.timeLogs', [])
  const [text, setText] = useState('')
  const [dragId, setDragId] = useState<number | null>(null)
  const [showWeight, setShowWeight] = useState(false)
  const [showWorkout, setShowWorkout] = useState(false)
  const [showWork, setShowWork] = useState(false)

  const total = tasks.length
  const done = tasks.filter((t) => t.status === 'done').length
  const pending = total - done
  const rate = total ? Math.round((done / total) * 100) : 0

  function addTask(title: string, tag?: string) {
    const v = title.trim()
    if (!v) return
    setTasks((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: v,
        status: 'todo',
        tag,
        createdAt: Date.now(),
      },
    ])
  }

  function addFromInput() {
    addTask(text)
    setText('')
  }

  function move(id: number, dir: -1 | 1) {
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    const i = TASK_COLUMNS.findIndex((c) => c.key === task.status)
    const ni = Math.min(
      TASK_COLUMNS.length - 1,
      Math.max(0, i + dir)
    )
    const newStatus = TASK_COLUMNS[ni].key

    // 进入「进行中」→ 开始计时
    if (newStatus === 'doing' && task.status !== 'doing') {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, status: newStatus, startedAt: Date.now() } : t
        )
      )
      return
    }
    // 离开「进行中」→ 停止计时，记录时间
    if (newStatus !== 'doing' && task.status === 'doing' && task.startedAt) {
      const entry = createTimeLog(task, task.startedAt, Date.now())
      if (entry) setLogs((prev) => [...prev, entry])
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, status: newStatus, startedAt: undefined } : t
        )
      )
      return
    }
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    )
  }

  function remove(id: number) {
    const task = tasks.find((t) => t.id === id)
    if (task && task.status === 'doing' && task.startedAt) {
      const entry = createTimeLog(task, task.startedAt, Date.now())
      if (entry) setLogs((prev) => [...prev, entry])
    }
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  function setQuadrant(id: number, q: Quadrant) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, quadrant: q } : t))
    )
  }

  function drop(status: TaskStatus) {
    if (dragId == null) return
    const task = tasks.find((t) => t.id === dragId)
    if (task) {
      // 进入「进行中」→ 开始计时
      if (status === 'doing' && task.status !== 'doing') {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === dragId ? { ...t, status, startedAt: Date.now() } : t
          )
        )
        setDragId(null)
        return
      }
      // 离开「进行中」→ 停止计时，记录时间
      if (status !== 'doing' && task.status === 'doing' && task.startedAt) {
        const entry = createTimeLog(task, task.startedAt, Date.now())
        if (entry) setLogs((prev) => [...prev, entry])
        setTasks((prev) =>
          prev.map((t) =>
            t.id === dragId
              ? { ...t, status, startedAt: undefined }
              : t
          )
        )
        setDragId(null)
        return
      }
    }
    setTasks((prev) =>
      prev.map((t) => (t.id === dragId ? { ...t, status } : t))
    )
    setDragId(null)
  }

  return (
    <div className="daily-plan">
      <div className="stats-row">
        <StatCard label="今日任务" value={total} suffix=" 项" accent="var(--text)" />
        <StatCard label="已完成" value={done} suffix=" 项" accent="var(--green)" />
        <StatCard label="待完成" value={pending} suffix=" 项" accent="var(--accent)" />
        <StatCard label="完成率" value={rate} suffix="%" accent="var(--amber)" />
      </div>

      <div className="plan-body">
        <aside className="routine">
          <div className="card-head">
            <div className="card-title">
              <span className="dot" style={{ background: 'var(--amber)' }} />
              我的日课
            </div>
            <span className="card-sub">一键加入待办</span>
          </div>
          <div className="routine-grid">
            {ROUTINE_PRESETS.map((r) => (
              <button
                key={r}
                className="routine-btn"
                onClick={() => addTask(r, r)}
              >
                <span className="routine-ico">＋</span>
                <span>{r}</span>
              </button>
            ))}
          </div>
          <div className="routine-add">
            <input
              className="input"
              placeholder="自定义任务，回车添加"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addFromInput()
              }}
            />
            <button className="btn" onClick={addFromInput}>
              添加
            </button>
          </div>
          <button
            className="weight-entry wm-entry"
            onClick={() => setShowWork(true)}
          >
            <span className="we-ico">🛒</span>
            <span>工作 · 电商工作台</span>
            <span className="we-arrow">›</span>
          </button>
          <button
            className="weight-entry"
            onClick={() => setShowWeight(true)}
          >
            <span className="we-ico">📊</span>
            <span>健身 · 体重记录</span>
            <span className="we-arrow">›</span>
          </button>
          <button
            className="weight-entry wk-entry"
            onClick={() => setShowWorkout(true)}
          >
            <span className="we-ico">💪</span>
            <span>健身 · 训练记录</span>
            <span className="we-arrow">›</span>
          </button>
        </aside>

        <div className="kanban">
          {TASK_COLUMNS.map((col) => {
            const list = tasks.filter((t) => t.status === col.key)
            return (
              <div
                key={col.key}
                className="kanban-col"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => drop(col.key)}
              >
                <div className="kanban-head">
                  <span className="kanban-dot" style={{ background: col.accent }} />
                  <span className="kanban-name">{col.label}</span>
                  <span className="kanban-count">{list.length}</span>
                </div>
                <div className="kanban-list">
                  {list.length === 0 ? (
                    <div className="kanban-empty">
                      {col.key === 'todo'
                        ? '从左栏日课或上方输入添加'
                        : '拖动任务到这里'}
                    </div>
                  ) : (
                    list.map((t) => (
                      <TaskCard
                        key={t.id}
                        task={t}
                        onMove={(d) => move(t.id, d)}
                        onRemove={() => remove(t.id)}
                        onDragStart={() => setDragId(t.id)}
                        onSetQuadrant={(q) => setQuadrant(t.id, q)}
                      />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="quad-section">
        <div className="quad-section-head">
          <div className="card-title">
            <span className="dot" style={{ background: '#e85d75' }} />
            时间紧迫图 · 四象限
          </div>
          <span className="card-sub">X=紧急　Y=重要，点越靠右上越紧迫</span>
        </div>
        <QuadrantChart tasks={tasks} />
      </div>

      <div className="ta-section-wrap">
        <div className="quad-section-head">
          <div className="card-title">
            <span className="dot" style={{ background: '#2bb673' }} />
            时间追踪 · 昨日与近7天
          </div>
          <span className="card-sub">进入「进行中」自动计时，移出自动记录</span>
        </div>
        <TimeAnalytics logs={logs} />
      </div>

      {showWeight && <WeightModal onClose={() => setShowWeight(false)} />}
      {showWorkout && <WorkoutModal onClose={() => setShowWorkout(false)} />}
      {showWork && <WorkModal onClose={() => setShowWork(false)} />}
    </div>
  )
}
