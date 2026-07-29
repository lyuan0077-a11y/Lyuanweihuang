import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { DEFAULT_QUICK_LINKS } from '../lib/store'
import type { QuickLink, ShipRecord } from '../lib/types'

function todayStr() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

/** 取平台首字作为图标 */
function platformInitial(name: string): string {
  return name.charAt(0)
}

export function WorkModal({ onClose }: { onClose: () => void }) {
  const [links, setLinks] = useLocalStorage<QuickLink[]>(
    'wb.quickLinks',
    DEFAULT_QUICK_LINKS
  )
  const [ships, setShips] = useLocalStorage<ShipRecord[]>('wb.ships', [])

  // 快捷链接表单
  const [lnName, setLnName] = useState('')
  const [lnUrl, setLnUrl] = useState('')

  // 发货记录表单
  const [shipPlatform, setShipPlatform] = useState('')
  const [shipItems, setShipItems] = useState('')
  const [shipShipped, setShipShipped] = useState(false)
  const [shipNote, setShipNote] = useState('')

  // ===== 快捷链接 CRUD =====
  function addLink() {
    const name = lnName.trim()
    let url = lnUrl.trim()
    if (!name || !url) return
    if (!/^https?:\/\//.test(url)) url = 'https://' + url
    setLinks((prev) => [
      ...prev,
      { id: Date.now(), name, url, color: '#4f6dff', createdAt: Date.now() },
    ])
    setLnName('')
    setLnUrl('')
  }

  function removeLink(id: number) {
    setLinks((prev) => prev.filter((l) => l.id !== id))
  }

  // ===== 发货记录 CRUD =====
  function addShip() {
    const platform = shipPlatform.trim()
    const items = parseInt(shipItems, 10)
    if (!platform || isNaN(items) || items < 0) return
    const rec: ShipRecord = {
      id: Date.now(),
      platform,
      items,
      shipped: shipShipped,
      date: todayStr(),
      note: shipNote.trim() || undefined,
      createdAt: Date.now(),
    }
    setShips((prev) => [rec, ...prev])
    setShipPlatform('')
    setShipItems('')
    setShipShipped(false)
    setShipNote('')
  }

  function toggleShipped(id: number) {
    setShips((prev) =>
      prev.map((s) => (s.id === id ? { ...s, shipped: !s.shipped } : s))
    )
  }

  function removeShip(id: number) {
    setShips((prev) => prev.filter((s) => s.id !== id))
  }

  // ===== 统计 =====
  const todayShips = ships.filter((s) => s.date === todayStr())
  const todayItems = todayShips.reduce((sum, s) => sum + s.items, 0)
  const todayShipped = todayShips.filter((s) => s.shipped).length
  const todayPending = todayShips.filter((s) => !s.shipped).length
  const todayShippedItems = todayShips
    .filter((s) => s.shipped)
    .reduce((sum, s) => sum + s.items, 0)
  const todayPendingItems = todayShips
    .filter((s) => !s.shipped)
    .reduce((sum, s) => sum + s.items, 0)

  // 近7天发货件数趋势
  const weekDates: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    weekDates.push(ds)
  }
  const weekData = weekDates.map((ds) => {
    const dayShips = ships.filter((s) => s.date === ds)
    return {
      date: ds,
      label: `${parseInt(ds.slice(5, 7), 10)}/${parseInt(ds.slice(8, 10), 10)}`,
      items: dayShips.reduce((sum, s) => sum + s.items, 0),
      shipped: dayShips.filter((s) => s.shipped).reduce((sum, s) => sum + s.items, 0),
    }
  })

  // 迷你柱状图参数
  const W = 560
  const H = 170
  const padL = 34
  const padR = 14
  const padT = 16
  const padB = 30
  const plotW = W - padL - padR
  const plotH = H - padT - padB
  const maxItems = Math.max(5, ...weekData.map((d) => d.items))
  const niceMax = Math.ceil(maxItems / 5) * 5 || 5
  const baseY = padT + plotH
  const barGap = 14
  const barW = (plotW - barGap * 6) / 7

  return (
    <div className="modal-mask" onClick={onClose}>
      <div
        className="modal-box wm-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div className="modal-title">
            <span className="wm-head-ico">🛒</span>
            工作 · 电商工作台
          </div>
          <button className="icon-btn" onClick={onClose} title="关闭">
            ×
          </button>
        </div>

        {/* ===== 快捷入口 ===== */}
        <div className="wm-section">
          <div className="wm-section-title">
            快捷入口 · 一键跳转后台
            <span className="wm-section-sub">点击图标直接打开</span>
          </div>
          <div className="wm-link-grid">
            {links.map((ln) => (
              <div key={ln.id} className="wm-link-card">
                <a
                  href={ln.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wm-link-btn"
                  style={{ background: ln.color }}
                >
                  <span className="wm-link-ico">
                    {platformInitial(ln.name)}
                  </span>
                  <span className="wm-link-name">{ln.name}</span>
                </a>
                <button
                  className="wm-link-del"
                  onClick={() => removeLink(ln.id)}
                  title="删除"
                >
                  ×
                </button>
              </div>
            ))}
            {links.length === 0 && (
              <div className="wm-link-empty">
                还没有快捷入口，在下方添加
              </div>
            )}
          </div>

          {/* 添加链接 */}
          <div className="wm-link-add">
            <input
              className="input wm-ln-name"
              placeholder="平台名称"
              value={lnName}
              onChange={(e) => setLnName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addLink()
              }}
            />
            <input
              className="input wm-ln-url"
              placeholder="网址（如 creator.xiaohongshu.com）"
              value={lnUrl}
              onChange={(e) => setLnUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addLink()
              }}
            />
            <button className="btn" onClick={addLink}>
              添加
            </button>
          </div>
        </div>

        {/* ===== 今日发货统计 ===== */}
        <div className="wm-section">
          <div className="wm-section-title">
            今日发货 · 统计
            <span className="wm-section-sub">{todayStr()}</span>
          </div>
          <div className="wm-stats">
            <div className="wm-stat">
              <div className="wm-stat-val" style={{ color: '#4f6dff' }}>
                {todayItems}
              </div>
              <div className="wm-stat-label">今日总件数</div>
            </div>
            <div className="wm-stat">
              <div className="wm-stat-val" style={{ color: '#2bb673' }}>
                {todayShippedItems}
              </div>
              <div className="wm-stat-label">已发货件数</div>
            </div>
            <div className="wm-stat">
              <div className="wm-stat-val" style={{ color: '#f5a623' }}>
                {todayPendingItems}
              </div>
              <div className="wm-stat-label">待发货件数</div>
            </div>
            <div className="wm-stat">
              <div className="wm-stat-val" style={{ color: '#2bb673' }}>
                {todayShipped}
              </div>
              <div className="wm-stat-label">已发货笔数</div>
            </div>
            <div className="wm-stat">
              <div className="wm-stat-val" style={{ color: '#f5a623' }}>
                {todayPending}
              </div>
              <div className="wm-stat-label">待发货笔数</div>
            </div>
          </div>
        </div>

        {/* ===== 添加发货记录 ===== */}
        <div className="wm-section">
          <div className="wm-section-title">
            发货记录 · 添加
            <span className="wm-section-sub">输入件数和发货状态</span>
          </div>
          <div className="wm-ship-form">
            <input
              className="input wm-ship-platform"
              placeholder="平台（如小红书）"
              value={shipPlatform}
              onChange={(e) => setShipPlatform(e.target.value)}
              list="wm-platform-list"
              onKeyDown={(e) => {
                if (e.key === 'Enter') addShip()
              }}
            />
            <datalist id="wm-platform-list">
              {links.map((ln) => (
                <option key={ln.id} value={ln.name} />
              ))}
            </datalist>
            <input
              className="input wm-ship-items"
              type="number"
              min="0"
              placeholder="件数"
              value={shipItems}
              onChange={(e) => setShipItems(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addShip()
              }}
            />
            <button
              className={`wm-ship-toggle ${shipShipped ? 'on' : ''}`}
              onClick={() => setShipShipped((v) => !v)}
            >
              {shipShipped ? '✓ 已发货' : '○ 未发货'}
            </button>
            <input
              className="input wm-ship-note"
              placeholder="备注（可选）"
              value={shipNote}
              onChange={(e) => setShipNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addShip()
              }}
            />
            <button className="btn" onClick={addShip}>
              记录
            </button>
          </div>
        </div>

        {/* ===== 近7天发货趋势 ===== */}
        <div className="wm-section">
          <div className="wm-section-title">
            近7天发货 · 趋势
            <span className="wm-section-sub">每日发货件数</span>
          </div>
          <div className="wm-chart-wrap">
            <svg
              className="wm-chart"
              viewBox={`0 0 ${W} ${H}`}
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label="近7天发货件数"
            >
              {Array.from({ length: 5 }).map((_, i) => {
                const v = (niceMax / 4) * i
                const y = baseY - (v / niceMax) * plotH
                return (
                  <g key={i}>
                    <line
                      x1={padL}
                      y1={y}
                      x2={W - padR}
                      y2={y}
                      stroke="#e8ebf2"
                      strokeWidth="1"
                      strokeDasharray={i === 0 ? '0' : '3 4'}
                    />
                    <text
                      x={padL - 6}
                      y={y + 3.5}
                      textAnchor="end"
                      fontSize="10"
                      fill="#97a0b0"
                    >
                      {v}
                    </text>
                  </g>
                )
              })}
              <text
                x={padL - 6}
                y={padT - 4}
                textAnchor="end"
                fontSize="10"
                fill="#5b6472"
                fontWeight="600"
              >
                件
              </text>
              {weekData.map((d, i) => {
                const x = padL + i * (barW + barGap)
                const h = d.items ? (d.items / niceMax) * plotH : 0
                const y = baseY - h
                const isToday = d.date === todayStr()
                return (
                  <g key={i}>
                    <rect
                      x={x}
                      y={y}
                      width={barW}
                      height={h}
                      rx="4"
                      fill={
                        d.items
                          ? isToday
                            ? '#4f6dff'
                            : '#8fa5ff'
                          : '#eef0f4'
                      }
                    />
                    {d.items > 0 && (
                      <text
                        x={x + barW / 2}
                        y={y - 6}
                        textAnchor="middle"
                        fontSize="10.5"
                        fill="#1f2430"
                        fontWeight="700"
                      >
                        {d.items}
                      </text>
                    )}
                    <text
                      x={x + barW / 2}
                      y={baseY + 15}
                      textAnchor="middle"
                      fontSize="9"
                      fill={isToday ? '#4f6dff' : '#97a0b0'}
                      fontWeight={isToday ? 700 : 500}
                    >
                      {d.label}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
          <div className="wm-legend">
            <span className="wm-lg-item">
              <span className="wm-lg-dot" style={{ background: '#4f6dff' }} />
              今天
            </span>
            <span className="wm-lg-item">
              <span className="wm-lg-dot" style={{ background: '#8fa5ff' }} />
              近7天
            </span>
            <span className="wm-lg-item">
              <span className="wm-lg-dot" style={{ background: '#eef0f4' }} />
              无
            </span>
          </div>
        </div>

        {/* ===== 发货历史 ===== */}
        <div className="wm-section">
          <div className="wm-section-title">
            发货历史
            <span className="wm-section-sub">最近 20 条</span>
          </div>
          {ships.length === 0 ? (
            <div className="wm-ship-empty">
              还没有发货记录，在上方添加
            </div>
          ) : (
            <div className="wm-ship-list">
              {ships.slice(0, 20).map((s) => (
                <div
                  key={s.id}
                  className={`wm-ship-row ${s.shipped ? 'shipped' : ''}`}
                >
                  <span className="wm-ship-date">{s.date.slice(5)}</span>
                  <span
                    className="wm-ship-platform-tag"
                    style={{
                      background: '#eaf0ff',
                      color: '#3b58f0',
                    }}
                  >
                    {s.platform}
                  </span>
                  <span className="wm-ship-items">
                    <b>{s.items}</b> 件
                  </span>
                  <button
                    className={`wm-ship-badge ${s.shipped ? 'on' : 'off'}`}
                    onClick={() => toggleShipped(s.id)}
                  >
                    {s.shipped ? '✓ 已发货' : '○ 未发货'}
                  </button>
                  {s.note && (
                    <span className="wm-ship-note">{s.note}</span>
                  )}
                  <button
                    className="wm-ship-del"
                    onClick={() => removeShip(s.id)}
                    title="删除"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
