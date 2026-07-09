import React from 'react'

function PhaseTransitionScreen() {
  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-500 `}>
      <div className="text-5xl font-bold animate-pulse">
        {/* {displayScreen === "team" ? "TEAM PHASE" : "BATTLE PHASE"} */}
      </div>
      <div className="text-xl text-white/60 mt-4">
        {/* 第 {displayRound} ラウンド */}
      </div>
    </div>
  )
}

export default PhaseTransitionScreen
