import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { INSP_LIB_CATEGORIES, inspLibMeta, pushTopic } from '../lib/store'
import type { InspLibItem, InspLibCategory } from '../lib/types'

export function InspirationLibraryPage({
  onConvert,
}: {
  onConvert: () => void
}) {
  const [list, setList] = useLocalStorage<InspLibItem[]>('wb.inspLib', [])
  const [text, setText] = useState('')
  const [source, setSource] = useState('')
  const [cat, setCat] = useState<InspLibCategory>('work')
  const [filter, setFilter] = useState<InspLibCategory | 'all' | 'fav'>('all')
  const [q, setQ] = useState('')

  function add() {
    const v = text.trim()
    if (!v) return
    setList((prev) => [
      {
        id: Date.now(),
        text: v,
        category: cat,
        source: source.trim() || undefined,
        favorite: false,
        createdAt: Date.now(),
      },
      ...prev,
    ])
    setText('')
    setSource('')
  }

  function remove(id: number) {
    setList((prev) => prev.filter((i) => i.id !== id))
  }

  function toggleFav(id: number) {
    setList((prev) =>
      prev.map((i) => (i.id === id ? { ...i, favorite: !i.favorite } : i))
    )
  }

  function convert(item: InspLibItem) {
    pushTopic({
      title: item.text,
      note: item.source
        ? `灵感库·${inspLibMeta(item.category).label}（来源：${item.source}）`
        : `灵感库·${inspLibMeta(item.category).label}`,
    })
    onConvert()
  }

  const filtered = list
    .filter((i) => {
      if (filter === 'fav') return i.favorite
      if (filter !== 'all') return i.category === filter
      return true
    })
    .filter((i) =>
      q.trim()
        ? (i.text + (i.source ?? '')).toLowerCase().includes(q.trim().toLowerCase())
        : true
    )
    .sort((a, b) => {
      // 收藏置顶，再按时间倒序
      if (a.favorite !== b.favorite) return a.favorite ? -1 : 1
      return b.createdAt - a.createdAt
    })

  function countOf(f: InspLibCategory | 'all' | 'fav') {
    if (f === 'all') return list.length
    if (f === 'fav') return list.filter((i) => i.favorite).length
    return list.filter((i) => i.category === f).length
  }

  const FILTERS: { key: InspLibCategory | 'all' | 'fav'; label: string }[] = [
    { key: 'all', label: '全部' },
    ...INSP_LIB_CATEGORIES.map((c) => ({ key: c.key, label: c.label })),
    { key: 'fav', label: '★ 收藏' },
  ]

  return (
    <div className="insp-lib">
      {/* 添加区 */}
      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <span className="dot" style={{ background: 'var(--purple)' }} />
            素材录入
          </div>
          <span className="card-sub">选分类 · 写内容 · 可填来源 · 回车保存</span>
        </div>
        <div className="cat-pick">
          {INSP_LIB_CATEGORIES.map((c) => (
            <button
              key={c.key}
              className={`chip ${cat === c.key ? 'active' : ''}`}
              style={
                cat === c.key
                  ? { background: c.soft, color: c.color, borderColor: c.color }
                  : undefined
              }
              onClick={() => setCat(c.key)}
            >
              <span style={{ marginRight: 4 }}>{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>
        <textarea
          className="textarea"
          placeholder="记下这段素材：一句金句、一个段子、一个词的用法、一段日常观察…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              add()
            }
          }}
        />
        <div className="capture-foot">
          <input
            className="input"
            style={{ maxWidth: 260 }}
            placeholder="来源（可选）：书/视频/播客…"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
          <button className="btn" onClick={add}>
            存入灵感库
          </button>
        </div>
      </div>

      {/* 筛选 + 搜索 */}
      <div className="filter-bar">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`chip ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            <span className="chip-count">{countOf(f.key)}</span>
          </button>
        ))}
        <input
          className="input insplib-search"
          placeholder="搜索素材…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ marginLeft: 'auto', maxWidth: 200 }}
        />
      </div>

      {/* 列表 */}
      {filtered.length === 0 ? (
        <div className="empty card">
          {list.length === 0 ? '灵感库还是空的，先录入第一条素材吧' : '没有匹配的素材'}
        </div>
      ) : (
        <div className="insplib-grid">
          {filtered.map((i) => {
            const meta = inspLibMeta(i.category)
            return (
              <div
                key={i.id}
                className="insplib-card"
                style={{ borderLeftColor: meta.color }}
              >
                <div className="insplib-top">
                  <span
                    className="insplib-cat"
                    style={{ background: meta.soft, color: meta.color }}
                  >
                    {meta.icon} {meta.label}
                  </span>
                  <div className="insplib-actions">
                    <button
                      className={`icon-btn fav ${i.favorite ? 'on' : ''}`}
                      onClick={() => toggleFav(i.id)}
                      title={i.favorite ? '取消收藏' : '收藏'}
                    >
                      {i.favorite ? '★' : '☆'}
                    </button>
                    <button
                      className="btn ghost sm"
                      onClick={() => convert(i)}
                      title="转成选题"
                    >
                      转选题
                    </button>
                    <button
                      className="icon-btn"
                      onClick={() => remove(i.id)}
                      title="删除"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <p className="insplib-text">{i.text}</p>
                <div className="insplib-foot">
                  {i.source && <span className="insplib-source">来源：{i.source}</span>}
                  <span className="insplib-time">
                    {new Date(i.createdAt).toLocaleString('zh-CN', {
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
