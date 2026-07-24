import Link from 'next/link'
import React from 'react'

function Navbar() {
  return (
    <nav className="fixed left-2 right-2 top-2 z-50 flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-3 py-3 backdrop-blur-xl sm:left-4 sm:right-4 sm:top-4 sm:px-8 sm:py-4">

      {/* 左側 */}
      <div className="flex items-center gap-3">
        <img src="/images/ronpa_logo.png" alt='論破アリーナのロゴ' className="h-10 w-10 rounded-lg bg-white/10" />
        <span className="hidden font-semibold text-white min-[380px]:inline">
          論破アリーナ
        </span>
      </div>

      {/* 右側 */}
      <div className="flex items-center gap-3 text-sm text-white sm:gap-8 sm:text-base">
        {/* <Link href="/">Home</Link> */}
        <Link href="/howtoplay">遊び方</Link>
        {/* <Link href="/ranking">ランキング</Link> */}
        {/* <Link href="/profile">プロフィール</Link> */}

        <Link
          href="https://github.com/harazyuku/vsAi"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20"
        >
          <img className="h-full w-full rounded-full object-cover" src="/images/github_logo.jpg" alt="GitHubのロゴ" />
        </Link>
      </div>

    </nav>
  )
}

export default Navbar
