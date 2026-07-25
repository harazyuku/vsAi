import Link from "next/link";
import React from "react";

function Main() {
  return (
    <div className="relative z-10 flex min-h-[100dvh] items-center justify-center overflow-y-auto px-4 pb-8 pt-28 sm:px-8 sm:pt-32">
      <div className="flex w-full max-w-[700px] flex-col items-center rounded-2xl border border-white/10 bg-black/30 p-6 text-center backdrop-blur-xl sm:p-10 lg:p-14">

        <img
          src="/images/IMG_8718.PNG"
          alt="ロゴ"
          className="mb-6 h-auto max-h-[42dvh] w-full max-w-[420px] object-contain sm:mb-10"
        />



        <Link
          href="/howtoplay?from=start"
          className="w-full max-w-xs rounded-2xl bg-white px-6 py-4 text-base font-semibold text-black transition hover:scale-105 hover:opacity-90 sm:px-10 sm:text-lg"
        >
          今すぐ論破する
        </Link>

        <Link
          href="/matching"
          className="mt-3 w-full max-w-xs rounded-2xl border border-cyan-300/40 bg-cyan-400/10 px-6 py-4 text-base font-semibold text-cyan-100 transition hover:scale-105 hover:bg-cyan-400/20 sm:px-10 sm:text-lg"
        >
          2人で協力プレイ
        </Link>
      </div>
    </div>
  );
}

export default Main;
