import type { HotTopic } from '../lib/types'
import { ANGLE_META, HOT_CATEGORIES } from '../lib/hotTopics'
import { SKINCARE_CATEGORIES } from '../lib/skincareTopics'

interface Props {
  index: number
  topic: HotTopic
  isSkincare?: boolean
  onAddTopic?: (t: HotTopic) => void
  onAddInspiration?: (t: HotTopic) => void
  onReplace?: () => void
}

function catMeta(cat: string) {
  return (
    (HOT_CATEGORIES as Record<string, { label: string; color: string; soft: string; icon: string }>)[cat] ??
    (SKINCARE_CATEGORIES as Record<string, { label: string; color: string; soft: string; icon: string }>)[cat] ?? {
      label: cat,
      color: '#5b6b80',
      soft: '#eef0f4',
      icon: '·',
    }
  )
}

function hotLabel(level: number) {
  return '🔥'.repeat(level) + '·'.repeat(5 - level)
}

export function HotTopicCard({
  index,
  topic,
  isSkincare = false,
  onAddTopic,
  onAddInspiration,
  onReplace,
}: Props) {
  const cm = catMeta(topic.category as string)
  return (
    <div className="hot-card" data-cat={topic.category}>
      <div className="hot-head">
        <div className="hot-num">{index + 1}.</div>
        <div className="hot-title">{topic.title}</div>
      </div>

      <div className="hot-meta">
        <span
          className="chip-cat"
          style={{ background: cm.soft, color: cm.color }}
        >
          <span className="chip-icon">{cm.icon}</span>
          {cm.label}
        </span>
        <span className="hot-fire" title={`热度 ${topic.hotLevel}/5`}>
          {hotLabel(topic.hotLevel)}
        </span>
        {topic.viewLabel && (
          <span className="hot-view">
            <span className="view-ico">📈</span>
            {topic.viewLabel}
          </span>
        )}
      </div>

      <div className="hot-reason">
        <span className="reason-label">为什么适合二创</span>
        <span className="reason-text">{topic.reason}</span>
      </div>

      <div className="hot-angles">
        <div className="angles-label">改版角度（点击查看）</div>
        <div className="angles-list">
          {topic.angles.map((a, i) => {
            const m = ANGLE_META[a.type]
            return (
              <div
                key={i}
                className="angle-chip"
                style={{ background: m.soft, color: m.color }}
                title={a.description}
              >
                <span className="angle-ico">{m.icon}</span>
                <span className="angle-title">{a.title}</span>
              </div>
            )
          })}
        </div>
        <details className="angle-detail">
          <summary>查看角度说明</summary>
          <ul className="angle-desc-list">
            {topic.angles.map((a, i) => {
              const m = ANGLE_META[a.type]
              return (
                <li key={i}>
                  <span
                    className="ad-tag"
                    style={{ background: m.soft, color: m.color }}
                  >
                    {m.icon} {m.label}
                  </span>
                  <span className="ad-title">{a.title}：</span>
                  <span className="ad-desc">{a.description}</span>
                </li>
              )
            })}
          </ul>
        </details>
      </div>

      <div className="hot-foot">
        <div className="platforms">
          <span className="pf-label">去平台看：</span>
          {topic.platforms.slice(0, 4).map((p) => (
            <a
              key={p.name}
              className="pf-link"
              href={p.searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: p.color }}
              title={`去 ${p.name} 搜索"${topic.title.split(/[，。、：]/)[0]}"`}
            >
              <span className="pf-ico">{p.icon}</span>
              {p.name}
            </a>
          ))}
        </div>
        <div className="hot-actions">
          {onReplace && (
            <button className="btn ghost sm" onClick={onReplace} title="换一条">
              🔄 换一条
            </button>
          )}
          {onAddInspiration && (
            <button className="btn ghost sm" onClick={() => onAddInspiration(topic)}>
              存为灵感
            </button>
          )}
          {onAddTopic && (
            <button className="btn sm" onClick={() => onAddTopic(topic)}>
              加入选题
            </button>
          )}
        </div>
      </div>

      {topic.source && (
        <div className="hot-source">来源：{topic.source}</div>
      )}
    </div>
  )
}
