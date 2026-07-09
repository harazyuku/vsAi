import Link from 'next/link'
import React from 'react'

function Navbar() {
  return (
 <nav className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-8 py-4 backdrop-blur-xl">

  {/* 左側 */}
  <div className="flex items-center gap-3">
    <div className="h-10 w-10 rounded-lg bg-white/10" />
    <span className="font-semibold text-white">
      論破アリーナ
    </span>
  </div>

  {/* 右側 */}
  <div className="flex items-center gap-8 text-white">
    <Link href="/">Home</Link>
    <Link href="/history">戦歴</Link>
    <Link href="/ranking">ランキング</Link>
    <Link href="/profile">プロフィール</Link>

    <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
      👤
    </button>
  </div>

</nav>
  )
}

export default Navbar