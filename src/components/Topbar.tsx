import { useEffect, useState } from 'react'
import type { PageKey } from './Sidebar'

const PAGE_TITLE: Record<PageKey, string> = {
  plan: '每日计划',
  topics: '选题',
  inspiration: '每日灵感',
  skincare: '护肤灵感',
  library: '灵感库',
  review: '内容复盘',
  calendar: '日历日程',
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

function greeting(h: number): string {
  if (h < 6) return '夜深了，注意休息'
  if (h < 11) return '早上好，元气满满'
  if (h < 13) return '中午好，记得吃饭'
  if (h < 18) return '下午好，专注当下'
  if (h < 23) return '晚上好，辛苦一天了'
  return '夜深了，注意休息'
}

function pad(n: number): string {
  return n < 10 ? '0' + n : String(n)
}

export function Topbar({ page }: { page: PageKey }) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const h = now.getHours()
  const time = `${pad(h)}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  const date = `${now.getMonth() + 1}月${now.getDate()}日 星期${WEEKDAYS[now.getDay()]}`

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{PAGE_TITLE[page]}</h1>
        <span className="topbar-sub">{greeting(h)}</span>
      </div>
      <div className="topbar-right">
        <div className="topbar-date">{date}</div>
        <div className="topbar-time">{time}</div>
      </div>
    </header>
  )
}
