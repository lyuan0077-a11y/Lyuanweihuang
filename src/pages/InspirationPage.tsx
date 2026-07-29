import { useMemo, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { pushTopic } from '../lib/store'
import { getDailyTopics, HOT_CATEGORIES } from '../lib/hotTopics'
import { HotTopicCard } from '../components/HotTopicCard'
import type { HotCategory, HotTopic, Inspiration } from '../lib/types'

const CATS: HotCategory[] = ['comedy', 'makeup', 'fashion', 'singing', 'piano', 'insight', 'lifestyle', 'emotion']

export function InspirationPage({
  onConvert,
}: {
  onConvert: () => void
}) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [filter, setFilter] = useState<HotCategory | 'all'>('all')
  const [refreshSeed, setRefreshSeed] = useState(0)
  const [showCapture, setShowCapture] = useState(false)
  const [text, setText] = useState('')
  const [tag, setTag] = useState('脚本')
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [inspList, setInspList] = useLocalStorage<Inspiration[]>('wb.inspirations', [])

  const topics = useMemo(() => {
    const base = getDailyTopics(today, 12)
    // refresh seed 仅做一次重新洗牌
    if (refreshSeed > 0) {
      for (let k = 0; k < refreshSeed; k++) {
        for (let i = base.length - 1; i > 0; i--) {
          const j = ((k + 17) * (i + 3)) % (i + 1)
          ;[base[i], base[j]] = [base[j], base[i]]
        }
      }
    }
    return filter === 'all'
      ? base
      : base.filter((t) => t.category === filter)
  }, [today, filter, refreshSeed])

  function addTopic(t: HotTopic) {
    pushTopic({
      title: t.title,
      note: `灵感来源：${t.source || '每日爆款选题'}；二创角度：${t.angles
        .map((a) => a.title)
        .join(' / ')}`,
      heat: t.hotLevel,
    })
    setSaved((prev) => new Set([...Array.from(prev), t.id]))
    onConvert()
  }

  function addInspiration(t: HotTopic) {
    const item: Inspiration = {
      id: Date.now(),
      text: `[选题灵感] ${t.title} — ${t.angles.map((a) => a.title).join(' / ')}`,
      tag,
      createdAt: Date.now(),
      converted: false,
    }
    setInspList((prev) => [item, ...prev])
    setSaved((prev) => new Set([...Array.from(prev), t.id]))
  }

  function addManualInspiration() {
    const v = text.trim()
    if (!v) return
    const item: Inspiration = {
      id: Date.now(),
      text: v,
      tag,
      createdAt: Date.now(),
      converted: false,
    }
    setInspList((prev) => [item, ...prev])
    setText('')
  }

  return (
    <div className="hot-page">
      <div className="hot-header card">
        <div className="hot-header-main">
          <div>
            <div className="hot-title-lg">
              选题每日灵感
              <span className="hot-date">{today}</span>
            </div>
            <div className="hot-sub">
              每天换一批可二创的选题，点击「加入选题」直接进你的选题库
            </div>
          </div>
          <div className="hot-actions-top">
            <button
              className="btn ghost"
              onClick={() => setRefreshSeed((s) => s + 1)}
            >
              🔄 换一批
            </button>
            <button
              className="btn ghost"
              onClick={() => setShowCapture((s) => !s)}
            >
              {showCapture ? '收起速记' : '✎ 灵感速记'}
            </button>
          </div>
        </div>

        <div className="filter-bar">
          <button
            className={`chip-cat filter ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            全部
          </button>
          {CATS.map((c) => {
            const m = HOT_CATEGORIES[c]
            return (
              <button
                key={c}
                className={`chip-cat filter ${filter === c ? 'active' : ''}`}
                style={
                  filter === c
                    ? { background: m.color, color: '#fff' }
                    : { background: m.soft, color: m.color }
                }
                onClick={() => setFilter(c)}
              >
                <span className="chip-icon">{m.icon}</span>
                {m.label}
              </button>
            )
          })}
        </div>
      </div>

      {showCapture && (
        <div className="card capture">
          <div className="card-head">
            <div className="card-title">
              <span className="dot" style={{ background: '#8a6dff' }} />
              灵感速记
            </div>
            <span className="card-sub">刷到爆款时先记下来，回车保存</span>
          </div>
          <textarea
            className="textarea"
            placeholder="想到什么就写什么：一个标题、一个角度、一句开头钩子…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                addManualInspiration()
              }
            }}
          />
          <div className="capture-foot">
            <div className="tag-pick">
              {['脚本', '选题', '标题', '封面', '剪辑', '运营', '其他'].map((t) => (
                <button
                  key={t}
                  className={`chip sm ${tag === t ? 'active' : ''}`}
                  onClick={() => setTag(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            <button className="btn" onClick={addManualInspiration}>
              保存灵感
            </button>
          </div>
        </div>
      )}

      <div className="hot-list">
        {topics.length === 0 ? (
          <div className="empty card">今天没有符合条件的选题，换个分类看看</div>
        ) : (
          topics.map((t, i) => (
            <HotTopicCard
              key={t.id}
              index={i}
              topic={t}
              onAddTopic={addTopic}
              onAddInspiration={addInspiration}
              onReplace={() => setRefreshSeed((s) => s + 1)}
            />
          ))
        )}
      </div>

      {saved.size > 0 && (
        <div className="hot-toast">
          已添加 {saved.size} 条到选题库/灵感池
        </div>
      )}
    </div>
  )
}
