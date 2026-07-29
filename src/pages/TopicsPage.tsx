import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { TOPIC_STATUS, topicMeta } from '../lib/store'
import type { Topic, TopicStatus } from '../lib/types'

function HeatStars({ value }: { value?: number }) {
  if (!value) return null
  return (
    <span className="heat">
      {'★'.repeat(value)}
      <span className="heat-dim">{'★'.repeat(5 - value)}</span>
    </span>
  )
}

function TopicCard({
  topic,
  onChange,
  onRemove,
}: {
  topic: Topic
  onChange: (status: TopicStatus) => void
  onRemove: () => void
}) {
  const meta = topicMeta(topic.status)
  return (
    <div className="topic-card">
      <div className="topic-top">
        <span
          className="topic-pill"
          style={{ background: meta.soft, color: meta.color }}
        >
          {meta.label}
        </span>
        <HeatStars value={topic.heat} />
        <button className="icon-btn" onClick={onRemove} title="删除">
          ×
        </button>
      </div>
      <div className="topic-title">{topic.title}</div>
      {topic.note && <div className="topic-note">{topic.note}</div>}
      <div className="topic-foot">
        <span className="topic-time">
          {new Date(topic.createdAt).toLocaleDateString('zh-CN')}
        </span>
        <select
          className="status-sel"
          value={topic.status}
          onChange={(e) => onChange(e.target.value as TopicStatus)}
        >
          {TOPIC_STATUS.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export function TopicsPage() {
  const [topics, setTopics] = useLocalStorage<Topic[]>('wb.topics', [])
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [heat, setHeat] = useState(3)
  const [filter, setFilter] = useState<TopicStatus | 'all'>('all')

  function add() {
    const v = title.trim()
    if (!v) return
    setTopics((prev) => [
      {
        id: Date.now(),
        title: v,
        status: 'idea',
        note: note.trim() || undefined,
        heat,
        createdAt: Date.now(),
      },
      ...prev,
    ])
    setTitle('')
    setNote('')
    setHeat(3)
  }

  function change(id: number, status: TopicStatus) {
    setTopics((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    )
  }

  function remove(id: number) {
    setTopics((prev) => prev.filter((t) => t.id !== id))
  }

  const list =
    filter === 'all' ? topics : topics.filter((t) => t.status === filter)

  return (
    <div className="topics">
      <div className="add-card card">
        <div className="card-head">
          <div className="card-title">
            <span className="dot" style={{ background: 'var(--accent)' }} />
            新增选题
          </div>
        </div>
        <div className="topic-form">
          <input
            className="input"
            placeholder="选题标题（比如：3分钟讲清复利）"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') add()
            }}
          />
          <input
            className="input"
            placeholder="备注：角度 / 受众 / 参考链接（可选）"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="heat-row">
            <span className="field-label">预计热度</span>
            <div className="heat-pick">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  className={`heat-star ${heat >= n ? 'on' : ''}`}
                  onClick={() => setHeat(n)}
                >
                  ★
                </button>
              ))}
            </div>
            <button className="btn" style={{ marginLeft: 'auto' }} onClick={add}>
              加入选题库
            </button>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <button
          className={`chip ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          全部 {topics.length}
        </button>
        {TOPIC_STATUS.map((s) => {
          const c = topics.filter((t) => t.status === s.key).length
          return (
            <button
              key={s.key}
              className={`chip ${filter === s.key ? 'active' : ''}`}
              style={
                filter === s.key
                  ? { background: s.soft, color: s.color, borderColor: s.color }
                  : undefined
              }
              onClick={() => setFilter(s.key)}
            >
              {s.label} {c}
            </button>
          )
        })}
      </div>

      <div className="topic-grid">
        {list.length === 0 ? (
          <div className="empty card">还没有选题，去「每日灵感」攒点想法吧</div>
        ) : (
          list.map((t) => (
            <TopicCard
              key={t.id}
              topic={t}
              onChange={(s) => change(t.id, s)}
              onRemove={() => remove(t.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
