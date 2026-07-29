import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { ReviewRecord } from '../lib/types'

const PLATFORMS = ['抖音', 'B站', '小红书', '视频号', '快手', 'YouTube', '其他']

function fmt(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  return String(n)
}

const empty = {
  title: '',
  platform: PLATFORMS[0],
  date: new Date().toISOString().slice(0, 10),
  plays: '',
  likes: '',
  comments: '',
  completion: '',
  takeaway: '',
}

export function ReviewPage() {
  const [list, setList] = useLocalStorage<ReviewRecord[]>('wb.reviews', [])
  const [form, setForm] = useState({ ...empty })
  const [showForm, setShowForm] = useState(false)

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  function add() {
    if (!form.title.trim()) return
    const rec: ReviewRecord = {
      id: Date.now(),
      title: form.title.trim(),
      platform: form.platform,
      date: form.date,
      plays: Number(form.plays) || 0,
      likes: Number(form.likes) || 0,
      comments: Number(form.comments) || 0,
      completion: Number(form.completion) || 0,
      takeaway: form.takeaway.trim(),
      createdAt: Date.now(),
    }
    setList((prev) => [rec, ...prev])
    setForm({ ...empty })
    setShowForm(false)
  }

  function remove(id: number) {
    setList((prev) => prev.filter((r) => r.id !== id))
  }

  const totalPlays = list.reduce((s, r) => s + r.plays, 0)
  const avgComp = list.length
    ? Math.round(list.reduce((s, r) => s + r.completion, 0) / list.length)
    : 0
  const best = [...list].sort((a, b) => b.plays - a.plays)[0]

  return (
    <div className="review">
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--accent)' }}>
            {fmt(totalPlays)}
          </div>
          <div className="stat-label">累计播放</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--amber)' }}>
            {avgComp}%
          </div>
          <div className="stat-label">平均完播率</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--green)' }}>
            {list.length}
          </div>
          <div className="stat-label">已复盘条数</div>
        </div>
        <div className="stat-card best">
          <div className="stat-label">播放最高</div>
          <div className="best-title">{best ? best.title : '—'}</div>
          <div className="best-sub">
            {best ? `${best.platform} · ${fmt(best.plays)} 播放` : '暂无记录'}
          </div>
        </div>
      </div>

      <div className="review-head">
        <div className="card-title">
          <span className="dot" style={{ background: 'var(--green)' }} />
          内容复盘
        </div>
        <button
          className={`btn ${showForm ? 'subtle' : ''}`}
          onClick={() => setShowForm((s) => !s)}
        >
          {showForm ? '收起' : '＋ 新增复盘'}
        </button>
      </div>

      {showForm && (
        <div className="card review-form">
          <input
            className="input"
            placeholder="内容标题"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
          />
          <div className="form-grid">
            <label className="form-cell">
              <span className="field-label">平台</span>
              <select
                className="input"
                value={form.platform}
                onChange={(e) => set('platform', e.target.value)}
              >
                {PLATFORMS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
            <label className="form-cell">
              <span className="field-label">发布日期</span>
              <input
                className="input"
                type="date"
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
              />
            </label>
            <label className="form-cell">
              <span className="field-label">播放量</span>
              <input
                className="input"
                type="number"
                value={form.plays}
                onChange={(e) => set('plays', e.target.value)}
              />
            </label>
            <label className="form-cell">
              <span className="field-label">点赞</span>
              <input
                className="input"
                type="number"
                value={form.likes}
                onChange={(e) => set('likes', e.target.value)}
              />
            </label>
            <label className="form-cell">
              <span className="field-label">评论</span>
              <input
                className="input"
                type="number"
                value={form.comments}
                onChange={(e) => set('comments', e.target.value)}
              />
            </label>
            <label className="form-cell">
              <span className="field-label">完播率(%)</span>
              <input
                className="input"
                type="number"
                value={form.completion}
                onChange={(e) => set('completion', e.target.value)}
              />
            </label>
          </div>
          <textarea
            className="textarea"
            placeholder="经验总结：什么有效？下次怎么改进？"
            value={form.takeaway}
            onChange={(e) => set('takeaway', e.target.value)}
          />
          <div className="form-foot">
            <button className="btn subtle" onClick={() => setShowForm(false)}>
              取消
            </button>
            <button className="btn" onClick={add}>
              保存复盘
            </button>
          </div>
        </div>
      )}

      <div className="review-list">
        {list.length === 0 ? (
          <div className="empty card">还没有复盘记录，点「新增复盘」添加第一条</div>
        ) : (
          list.map((r) => (
            <div key={r.id} className="review-card card">
              <div className="review-top">
                <span className="review-platform">{r.platform}</span>
                <span className="review-date">{r.date}</span>
                <button className="icon-btn" onClick={() => remove(r.id)} title="删除">
                  ×
                </button>
              </div>
              <div className="review-title">{r.title}</div>
              <div className="review-metrics">
                <div className="metric">
                  <span className="m-val">{fmt(r.plays)}</span>
                  <span className="m-lab">播放</span>
                </div>
                <div className="metric">
                  <span className="m-val">{fmt(r.likes)}</span>
                  <span className="m-lab">点赞</span>
                </div>
                <div className="metric">
                  <span className="m-val">{fmt(r.comments)}</span>
                  <span className="m-lab">评论</span>
                </div>
                <div className="metric">
                  <span className="m-val">{r.completion}%</span>
                  <span className="m-lab">完播</span>
                </div>
              </div>
              {r.takeaway && (
                <div className="review-takeaway">
                  <span className="ta-label">经验</span>
                  {r.takeaway}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
