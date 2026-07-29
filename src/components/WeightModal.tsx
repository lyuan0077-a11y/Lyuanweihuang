import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { WeightRecord } from '../lib/types'

function todayStr() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function fmtDate(s: string) {
  return s.slice(5) // MM-DD
}

function WeightChart({ records }: { records: WeightRecord[] }) {
  // 按日期升序排列，用于从左到右绘制
  const data = [...records].sort((a, b) =>
    a.date === b.date ? a.createdAt - b.createdAt : a.date.localeCompare(b.date)
  )
  const W = 560
  const H = 248
  const padL = 46
  const padR = 18
  const padT = 18
  const padB = 34
  const plotW = W - padL - padR
  const plotH = H - padT - padB
  const n = data.length
  const baseY = padT + plotH

  if (n === 0) {
    return (
      <div className="weight-empty">
        还没有记录，在上方录入体重后这里会出现体重起伏曲线
      </div>
    )
  }

  const weights = data.map((r) => r.weight)
  const minW = Math.min(...weights)
  const maxW = Math.max(...weights)
  let yMin: number
  let yMax: number
  if (minW === maxW) {
    yMin = minW - 2
    yMax = maxW + 2
  } else {
    const pad = (maxW - minW) * 0.18
    yMin = minW - pad
    yMax = maxW + pad
  }
  const range = yMax - yMin || 1

  const x = (i: number) =>
    padL + (n === 1 ? plotW / 2 : (plotW * i) / (n - 1))
  const y = (w: number) => padT + plotH * (1 - (w - yMin) / range)

  const ticks = 4
  const yLines = Array.from(
    { length: ticks + 1 },
    (_, i) => yMin + (range * i) / ticks
  )

  const linePath = data
    .map((r, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(r.weight).toFixed(1)}`)
    .join(' ')

  const areaPath =
    `${linePath} L ${x(n - 1).toFixed(1)} ${baseY} L ${x(0).toFixed(1)} ${baseY} Z`

  // X 轴日期标签稀疏显示，避免重叠
  const step = Math.max(1, Math.ceil(n / 6))

  // 最新 vs 上一条的趋势
  const latest = data[n - 1]
  const prev = n >= 2 ? data[n - 2] : null
  const diff = prev ? latest.weight - prev.weight : 0

  return (
    <div className="weight-chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="weight-chart" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4f6dff" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#4f6dff" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* 横向网格线 + Y 轴刻度 */}
        {yLines.map((v, i) => {
          const yy = y(v)
          return (
            <g key={i}>
              <line
                x1={padL}
                y1={yy}
                x2={W - padR}
                y2={yy}
                stroke="var(--border)"
                strokeWidth="1"
                strokeDasharray="3 4"
              />
              <text
                x={padL - 8}
                y={yy + 4}
                textAnchor="end"
                fontSize="11"
                fill="var(--text-faint)"
              >
                {v.toFixed(1)}
              </text>
            </g>
          )
        })}

        {/* 坐标轴 */}
        <line
          x1={padL}
          y1={padT}
          x2={padL}
          y2={baseY}
          stroke="var(--border)"
          strokeWidth="1.5"
        />
        <line
          x1={padL}
          y1={baseY}
          x2={W - padR}
          y2={baseY}
          stroke="var(--border)"
          strokeWidth="1.5"
        />

        {/* 区域填充 */}
        <path d={areaPath} fill="url(#weightGrad)" />

        {/* 折线 */}
        <path
          d={linePath}
          fill="none"
          stroke="#4f6dff"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* 数据点 + 数值 */}
        {data.map((r, i) => (
          <g key={r.id}>
            <circle
              cx={x(i)}
              cy={y(r.weight)}
              r="4.5"
              fill="#4f6dff"
              stroke="#fff"
              strokeWidth="2"
            />
            <text
              x={x(i)}
              y={y(r.weight) - 11}
              textAnchor="middle"
              fontSize="11.5"
              fontWeight="700"
              fill="var(--text)"
            >
              {r.weight}
            </text>
          </g>
        ))}

        {/* X 轴日期标签 */}
        {data.map((r, i) => {
          if (i % step !== 0 && i !== n - 1) return null
          return (
            <text
              key={`x${r.id}`}
              x={x(i)}
              y={baseY + 18}
              textAnchor="middle"
              fontSize="11"
              fill="var(--text-faint)"
            >
              {fmtDate(r.date)}
            </text>
          )
        })}

        {/* 轴标题 */}
        <text x={padL} y={padT - 6} fontSize="11" fill="var(--text-faint)">
          体重(kg)
        </text>
        <text x={W - padR} y={baseY + 30} textAnchor="end" fontSize="11" fill="var(--text-faint)">
          日期 →
        </text>
      </svg>

      {prev && (
        <div className="weight-trend">
          最近变化：
          <span
            className={
              diff > 0
                ? 'wt-up'
                : diff < 0
                ? 'wt-down'
                : 'wt-flat'
            }
          >
            {diff > 0 ? '↑' : diff < 0 ? '↓' : '→'} {Math.abs(diff).toFixed(1)} kg
          </span>
          <span className="wt-sub">
            （{fmtDate(prev.date)} {prev.weight}kg → {fmtDate(latest.date)} {latest.weight}kg）
          </span>
        </div>
      )}
    </div>
  )
}

export function WeightModal({ onClose }: { onClose: () => void }) {
  const [records, setRecords] = useLocalStorage<WeightRecord[]>('wb.weights', [])
  const [date, setDate] = useState(todayStr())
  const [weight, setWeight] = useState('')
  const [note, setNote] = useState('')
  const [err, setErr] = useState('')

  function save() {
    const w = parseFloat(weight)
    if (!date || !w || w <= 0) {
      setErr('请填写日期和有效体重')
      return
    }
    setErr('')
    setRecords((prev) => [
      ...prev,
      {
        id: Date.now(),
        weight: Math.round(w * 10) / 10,
        date,
        note: note.trim() || undefined,
        createdAt: Date.now(),
      },
    ])
    setWeight('')
    setNote('')
    setDate(todayStr())
  }

  function remove(id: number) {
    setRecords((prev) => prev.filter((r) => r.id !== id))
  }

  const sorted = [...records].sort((a, b) =>
    a.date === b.date ? b.createdAt - a.createdAt : b.date.localeCompare(a.date)
  )
  const weights = records.map((r) => r.weight)
  const latest = sorted[0]
  const maxW = weights.length ? Math.max(...weights) : 0
  const minW = weights.length ? Math.min(...weights) : 0
  const avg = weights.length
    ? Math.round((weights.reduce((a, b) => a + b, 0) / weights.length) * 10) / 10
    : 0

  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">
            <span className="dot" style={{ background: '#2bb673' }} />
            健身 · 体重记录
          </div>
          <button className="icon-btn" onClick={onClose} title="关闭">
            ×
          </button>
        </div>

        <div className="weight-input-row">
          <label className="wi">
            <span>日期</span>
            <input
              type="date"
              className="input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label className="wi">
            <span>体重 (kg)</span>
            <input
              type="number"
              className="input"
              step="0.1"
              min="0"
              placeholder="如 65.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') save()
              }}
            />
          </label>
          <label className="wi wi-note">
            <span>备注</span>
            <input
              className="input"
              placeholder="可选"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') save()
              }}
            />
          </label>
          <button className="btn" onClick={save}>
            记录
          </button>
        </div>
        {err && <div className="weight-err">{err}</div>}

        <div className="weight-stats">
          <div className="ws">
            <div className="ws-v">{latest ? `${latest.weight}` : '—'}</div>
            <div className="ws-l">最新</div>
          </div>
          <div className="ws">
            <div className="ws-v ws-max">{weights.length ? maxW : '—'}</div>
            <div className="ws-l">最高</div>
          </div>
          <div className="ws">
            <div className="ws-v ws-min">{weights.length ? minW : '—'}</div>
            <div className="ws-l">最低</div>
          </div>
          <div className="ws">
            <div className="ws-v ws-avg">{weights.length ? avg : '—'}</div>
            <div className="ws-l">平均</div>
          </div>
          <div className="ws">
            <div className="ws-v">{records.length}</div>
            <div className="ws-l">记录数</div>
          </div>
        </div>

        <WeightChart records={records} />

        <div className="weight-list">
          <div className="weight-list-head">历史记录</div>
          {sorted.length === 0 ? (
            <div className="weight-list-empty">暂无记录</div>
          ) : (
            sorted.map((r) => (
              <div key={r.id} className="weight-row">
                <span className="wr-date">{r.date}</span>
                <span className="wr-weight">{r.weight} kg</span>
                {r.note && <span className="wr-note">{r.note}</span>}
                <button
                  className="icon-btn wr-del"
                  onClick={() => remove(r.id)}
                  title="删除"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
