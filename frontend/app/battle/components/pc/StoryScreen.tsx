"use client";

import { useGameLogic } from "@/hooks/useGameLogic/useGameLogic";
import { useStory } from "@/hooks/useStory";

type Props = ReturnType<typeof useGameLogic> & {
  onComplete: () => void;
};

const backgroundStyles = {
  court: "from-amber-950/90 via-slate-950 to-black",
  deathgame: "from-red-950/90 via-zinc-950 to-black",
  school: "from-blue-950/90 via-slate-950 to-black",
};

export default function StoryScreen({
  selectedAI,
  selectedTopic,
  stance,
  aiStance,
  onComplete,
}: Props) {
  const {
    currentLine,
    displayedText,
    isTyping,
    advanceStory,
    skipStory,
  } = useStory({
    selectedAI,
    selectedTopic,
    stance,
    aiStance,
    onComplete,
  });

  if (!selectedAI || !selectedTopic || !currentLine) {
    return <div className="h-full w-full bg-black" />;
  }

  const isNarration = currentLine.speaker === "ナレーション";
  const backgroundClass = backgroundStyles[selectedTopic.background];

  return (
    <div
      className={`relative h-full min-h-screen w-full cursor-pointer overflow-hidden bg-gradient-to-br ${backgroundClass}`}
      onClick={advanceStory}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.75)_100%)]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:52px_52px]" />

      <button
        type="button"
        className="absolute right-5 top-5 z-30 rounded-full border border-white/20 bg-black/40 px-5 py-2 text-xs font-bold tracking-widest text-white/70 transition hover:bg-white/10 hover:text-white"
        onClick={(event) => {
          event.stopPropagation();
          skipStory();
        }}
      >
        SKIP
      </button>

      <div
        className={`absolute inset-y-0 right-[-3%] z-10 flex w-[58%] items-center justify-center transition-all duration-500 ${
          currentLine.side === "enemy" ? "opacity-100 scale-100" : "opacity-35 scale-95"
        }`}
      >
        <div className="absolute h-[60%] w-[60%] rounded-full bg-red-500/15 blur-3xl" />
        <img
          src={selectedAI.icon}
          alt={selectedAI.name}
          className="relative max-h-[68vh] max-w-[75%] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
        />
      </div>

      <div
        className={`absolute bottom-[27%] left-[7%] z-10 transition-all duration-500 ${
          currentLine.side === "player" ? "opacity-100 translate-x-0" : "opacity-35 -translate-x-3"
        }`}
      >
        <p className="text-xs font-bold tracking-[0.4em] text-blue-300/60">YOUR POSITION</p>
        <p className="mt-2 text-2xl font-black text-white md:text-4xl">{stance}</p>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 p-4 md:p-10">
        <div
          className={`mx-auto max-w-6xl overflow-hidden rounded-2xl border backdrop-blur-xl transition-colors ${
            isNarration
              ? "border-white/20 bg-black/75"
              : currentLine.side === "enemy"
                ? "border-red-400/30 bg-red-950/70"
                : "border-blue-400/30 bg-blue-950/70"
          }`}
        >
          <div className="border-b border-white/10 px-5 py-3 md:px-8">
            <p className="text-sm font-black tracking-[0.2em] text-white/80">
              {currentLine.speaker === "対戦相手" ? selectedAI.name : currentLine.speaker}
            </p>
          </div>

          <div className="relative min-h-36 px-5 py-5 md:min-h-44 md:px-8 md:py-7">
            <p className="max-w-4xl text-base font-bold leading-8 text-white md:text-xl md:leading-9">
              {displayedText}
              {isTyping && <span className="ml-1 inline-block h-5 w-0.5 animate-pulse bg-white/80 align-middle" />}
            </p>

            {!isTyping && (
              <span className="absolute bottom-4 right-5 animate-bounce text-sm text-white/60">▼</span>
            )}
          </div>
        </div>

        <p className="mt-3 text-center text-[10px] tracking-[0.25em] text-white/35 md:text-xs">
          CLICK / ENTER
        </p>
      </div>
    </div>
  );
}
