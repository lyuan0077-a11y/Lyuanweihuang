import type { Task, Quadrant } from '../lib/types'
import { QUADRANTS } from '../lib/store'

const W = 560
const H = 440
const padL = 46
const padR = 18
const padT = 18
const padB = 46
const plotW = W - padL - padR
const plotH = H - padT - padB
const cx = padL + plotW / 2
const cy = padT + plotH / 2

/* 象限区域：XY轴 X=紧急(左→右) Y=重要(下→上) */
const REGIONS: Record<
  Quadrant,
  { x0: number; y0: number; x1: number; y1: number }
> = {
  q2: { x0: padL, y0: padT, x1: cx, y1: cy }, // 左上 缓·重
  q1: { x0: cx, y0: padT, x1: W - padR, y1: cy }, // 右上 急·重
  q4: { x0: padL, y0: cy, x1: cx, y1: H - padB }, // 左下 缓·轻
  q3: { x0: cx, y0: cy, x1: W - padR, y1: H - padB }, // 右下 急·轻
}

function clip(s: string, n: number) {
  return s.length > n ? s.slice(0, n) + '…' : s
}

export function QuadrantChart({ tasks }: { tasks: Task[] }) {
  const tasked = tasks.filter((t) => t.quadrant)
  const groups: Record<Quadrant, Task[]> = {
    q1: [],
    q2: [],
    q3: [],
    q4: [],
  }
  tasked.forEach((t) => {
    if (t.quadrant) groups[t.quadrant].push(t)
  })

  if (tasked.length === 0) {
    return (
      <div className="quad-empty">
        还没有标注轻重缓急的任务
        <br />
        在右侧任务卡片上点选四个象限，这里会显示你的「时间紧迫图」
      </div>
    )
  }

  return (
    <div className="quad-chart-wrap">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="quad-chart"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* 象限底色 */}
        {QUADRANTS.map((q) => {
          const r = REGIONS[q.key]
          return (
            <rect
              key={q.key}
              x={r.x0}
              y={r.y0}
              width={r.x1 - r.x0}
              height={r.y1 - r.y0}
              fill={q.soft}
              opacity="0.55"
            />
          )
        })}

        {/* 象限标题（各象限顶部内侧） */}
        {QUADRANTS.map((q) => {
          const r = REGIONS[q.key]
          const leftSide = q.key === 'q2' || q.key === 'q4'
          const tx = leftSide ? r.x0 + 8 : r.x1 - 8
          const ta = leftSide ? 'start' : 'end'
          const ty = r.y0 + 16
          return (
            <g key={`t${q.key}`}>
              <text
                x={tx}
                y={ty}
                textAnchor={ta}
                fontSize="12.5"
                fontWeight="700"
                fill={q.color}
              >
                {q.label}
              </text>
              <text
                x={tx}
                y={ty + 14}
                textAnchor={ta}
                fontSize="11"
                fill="var(--text-faint)"
              >
                {q.desc}
              </text>
            </g>
          )
        })}

        {/* 中心十字分隔线 */}
        <line
          x1={cx}
          y1={padT}
          x2={cx}
          y2={H - padB}
          stroke="var(--border)"
          strokeWidth="1.5"
        />
        <line
          x1={padL}
          y1={cy}
          x2={W - padR}
          y2={cy}
          stroke="var(--border)"
          strokeWidth="1.5"
        />

        {/* X 轴 + 箭头 */}
        <line
          x1={padL}
          y1={H - padB}
          x2={W - padR}
          y2={H - padB}
          stroke="var(--text-faint)"
          strokeWidth="1.5"
        />
        <polygon
          points={`${W - padR},${H - padB} ${W - padR - 7},${H - padB - 4} ${W - padR - 7},${H - padB + 4}`}
          fill="var(--text-faint)"
        />
        <text x={padL} y={H - padB + 18} textAnchor="start" fontSize="11.5" fill="var(--text-faint)">
          不紧急
        </text>
        <text x={W - padR} y={H - padB + 18} textAnchor="end" fontSize="11.5" fontWeight="700" fill="var(--text)">
          紧急 →
        </text>

        {/* Y 轴 + 箭头 */}
        <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="var(--text-faint)" strokeWidth="1.5" />
        <polygon
          points={`${padL},${padT} ${padL - 4},${padT + 7} ${padL + 4},${padT + 7}`}
          fill="var(--text-faint)"
        />
        <text x={padL - 8} y={padT + 4} textAnchor="end" fontSize="11.5" fontWeight="700" fill="var(--text)">
          重要
        </text>
        <text x={padL - 8} y={H - padB} textAnchor="end" fontSize="11.5" fill="var(--text-faint)">
          不重要
        </text>

        {/* 紧迫度提示 */}
        <text x={W - padR} y={padT + 4} textAnchor="end" fontSize="10.5" fontWeight="700" fill="#e85d75">
          ↑ 最紧迫
        </text>

        {/* 任务散点 */}
        {QUADRANTS.map((q) => {
          const list = groups[q.key]
          const r = REGIONS[q.key]
          const avail = r.y1 - 6 - (r.y0 + 36)
          const gap = list.length <= 1 ? 24 : Math.min(24, avail / list.length)
          return list.map((t, i) => {
            const px = r.x0 + 16
            const py = r.y0 + 36 + i * gap
            const label = clip(t.title, 14)
            return (
              <g key={t.id}>
                <circle
                  cx={px}
                  cy={py}
                  r="4.5"
                  fill={q.color}
                  stroke="#fff"
                  strokeWidth="2"
                />
                <text
                  x={px + 11}
                  y={py + 4}
                  fontSize="11.5"
                  fill="var(--text)"
                >
                  {label}
                </text>
              </g>
            )
          })
        })}
      </svg>

      <div className="quad-legend">
        {QUADRANTS.map((q) => (
          <span key={q.key} className="ql-item">
            <span className="ql-dot" style={{ background: q.color }} />
            {q.label} · {q.desc}
            <span className="ql-n">{groups[q.key].length}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
