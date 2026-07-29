import { useMemo, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { pushTopic } from '../lib/store'
import { getDailySkincareTopics, SKINCARE_CATEGORIES } from '../lib/skincareTopics'
import { HotTopicCard } from '../components/HotTopicCard'
import type { HotTopic, Inspiration, SkincareCategory } from '../lib/types'

const CATS: SkincareCategory[] = ['ingredient', 'routine', 'concern', 'device', 'sunscreen', 'antiaging']

export function SkincareInspirationPage({
  onConvert,
}: {
  onConvert: () => void
}) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [filter, setFilter] = useState<SkincareCategory | 'all'>('all')
  const [refreshSeed, setRefreshSeed] = useState(0)
  const [showCapture, setShowCapture] = useState(false)
  const [text, setText] = useState('')
  const [tag, setTag] = useState('成分')
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [inspList, setInspList] = useLocalStorage<Inspiration[]>('wb.inspirations', [])

  const topics = useMemo(() => {
    const base = getDailySkincareTopics(today, 12)
    if (refreshSeed > 0) {
      for (let k = 0; k < refreshSeed; k++) {
        for (let i = base.length - 1; i > 0; i--) {
          const j = ((k + 23) * (i + 5)) % (i + 1)
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
      note: `护肤灵感来源：${t.source || '每日护肤爆款'}；二创角度：${t.angles
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
      text: `[护肤灵感] ${t.title} — ${t.angles.map((a) => a.title).join(' / ')}`,
      tag: '护肤',
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
      tag: '护肤',
      createdAt: Date.now(),
      converted: false,
    }
    setInspList((prev) => [item, ...prev])
    setText('')
  }

  return (
    <div className="hot-page skincare">
      <div className="hot-header card">
        <div className="hot-header-main">
          <div>
            <div className="hot-title-lg">
              <span className="skin-emoji">🌿</span>
              护肤每日灵感
              <span className="hot-date">{today}</span>
            </div>
            <div className="hot-sub">
              每天一批护肤向爆款选题，含成分 / 步骤 / 肤质问题 / 美容仪 / 防晒 / 抗老
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
              {showCapture ? '收起速记' : '✎ 护肤速记'}
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
            const m = SKINCARE_CATEGORIES[c]
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
              <span className="dot" style={{ background: '#06b6d4' }} />
              护肤速记
            </div>
            <span className="card-sub">刷到护肤爆款时记下来</span>
          </div>
          <textarea
            className="textarea"
            placeholder="护肤爆款 / 成分发现 / 试用心得…"
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
              {['成分', '步骤', '产品', '肤质', '美容仪', '防晒', '其他'].map((t) => (
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
          <div className="empty card">今天没有符合条件的护肤选题，换个分类看看</div>
        ) : (
          topics.map((t, i) => (
            <HotTopicCard
              key={t.id}
              index={i}
              topic={t}
              isSkincare
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
