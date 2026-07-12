import Link from "next/link";
import React from "react";

function Main() {
  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center">
      <div className="flex w-[700px] flex-col items-center rounded-2xl border border-white/10 bg-black/30 m-10 p-14 text-center backdrop-blur-xl">

        <img
          src="/images/IMG_8718.PNG"
          alt="ロゴ"
          className="mb-10 h-80 w-auto object-contain"
        />



        <Link
          href="/battle"
          className="rounded-2xl bg-white px-10 py-4 text-lg font-semibold text-black transition hover:scale-105 hover:opacity-90"
        >
          今すぐ論破しに行く
        </Link>
      </div>
    </div>
  );
}

export default Main;