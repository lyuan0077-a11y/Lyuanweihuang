export type PageKey =
  | 'plan'
  | 'topics'
  | 'inspiration'
  | 'skincare'
  | 'review'
  | 'library'
  | 'calendar'

const NAV: { key: PageKey; label: string; icon: string; desc: string }[] = [
  { key: 'plan', label: '每日计划', icon: '◷', desc: '看板·日课' },
  { key: 'topics', label: '选题', icon: '✦', desc: '选题库·状态' },
  { key: 'inspiration', label: '每日灵感', icon: '✎', desc: '选题爆款·二创' },
  { key: 'skincare', label: '护肤灵感', icon: '🌿', desc: '护肤爆款·二创' },
  { key: 'library', label: '灵感库', icon: '◈', desc: '工作·幽默·词·日常' },
  { key: 'review', label: '内容复盘', icon: '◷', desc: '数据·经验' },
  { key: 'calendar', label: '日历日程', icon: '▦', desc: '日程·倒计时' },
]

export function Sidebar({
  active,
  onChange,
}: {
  active: PageKey
  onChange: (p: PageKey) => void
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">工</div>
        <div className="sidebar-brand-text">
          <div className="sidebar-title">工作台</div>
          <div className="sidebar-sub">创作者中心</div>
        </div>
      </div>
      <nav className="nav">
        {NAV.map((n) => (
          <button
            key={n.key}
            className={`nav-item ${active === n.key ? 'active' : ''}`}
            onClick={() => onChange(n.key)}
          >
            <span className="nav-icon">{n.icon}</span>
            <span className="nav-text">
              <span className="nav-label">{n.label}</span>
              <span className="nav-desc">{n.desc}</span>
            </span>
          </button>
        ))}
      </nav>
      <div className="sidebar-foot">本地工作台 · 数据存于本机</div>
    </aside>
  )
}
