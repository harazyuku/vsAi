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
    lineSide,
    revealedStances,
    actorViews,
    backdrop,
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
  const isClaudeSpeaking = currentLine.speaker === "Claude Code";
  const backgroundClass = backgroundStyles[selectedTopic.background];
  const speakerLabel =
    currentLine.speaker === "あなた"
      ? `${stance}側（あなた）`
      : currentLine.speaker === "原告側" && stance === "原告"
        ? "原告側（あなた）"
        : currentLine.speaker === "被告側" && stance === "被告"
          ? "被告側（あなた）"
          : currentLine.speaker === "対戦相手"
            ? selectedAI.name
            : currentLine.speaker;

  return (
    <div
      className={`relative h-full min-h-screen w-full cursor-pointer overflow-hidden bg-gradient-to-br ${backgroundClass}`}
      onClick={advanceStory}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.75)_100%)]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:52px_52px]" />

      {backdrop && (
        <img
          src={backdrop}
          alt=""
          className="story-backdrop-in absolute inset-0 h-full w-full object-cover"
        />
      )}

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

      {actorViews.map((actor) => (
        <div
          key={actor.id}
          className={`absolute inset-y-0 z-10 flex items-center justify-center transition-all duration-500 ${
            actor.placement === "left"
              ? "left-[-4%] w-[42%]"
              : actor.placement === "center-left"
                ? "left-[25%] w-[38%]"
                : "right-[-2%] w-[52%]"
          } ${
            actor.isFocused
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-3 scale-90 opacity-35"
          }`}
        >
          <div className="absolute h-[55%] w-[55%] rounded-full bg-white/10 blur-3xl" />
          <img
            src={actor.src}
            alt={actor.alt}
            className={`relative drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] ${
              actor.size === "claude"
                ? "max-h-[45vh] max-w-[62%]"
                : actor.size === "ai"
                  ? "max-h-[44vh] max-w-[60%]"
                  : "max-h-[64vh] max-w-[72%]"
            } ${
              actor.flipX ? "scale-x-[-1]" : ""
            } ${
              actor.isAICharacter
                ? "aspect-square rounded-full border-4 border-white/20 bg-white object-cover"
                : "object-contain"
            }`}
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        </div>
      ))}

      {revealedStances.enemy && (
        <div
          className={`absolute top-[12%] z-20 story-stance-in ${
            aiStance === "原告" ? "left-[7%] text-left" : "right-[7%] text-right"
          }`}
        >
          <p className="text-xs font-bold tracking-[0.4em] text-red-300/70">ENEMY STANCE</p>
          <p className="mt-2 text-2xl font-black text-white md:text-4xl">{aiStance}</p>
        </div>
      )}

      {revealedStances.player && (
        <div
          className={`absolute top-[12%] z-20 story-stance-in ${
            stance === "原告" ? "left-[7%] text-left" : "right-[7%] text-right"
          }`}
        >
          <p className="text-xs font-bold tracking-[0.4em] text-blue-300/70">YOUR STANCE</p>
          <p className="mt-2 text-2xl font-black text-white md:text-4xl">{stance}</p>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 z-20 p-4 md:p-10">
        <div
          className={`mx-auto max-w-6xl overflow-hidden rounded-2xl border backdrop-blur-xl transition-colors ${
            isNarration
              ? "border-white/20 bg-black/75"
              : isClaudeSpeaking
                ? "border-orange-400/40 bg-orange-950/70"
              : lineSide === "enemy"
                ? "border-red-400/30 bg-red-950/70"
                : "border-blue-400/30 bg-blue-950/70"
          }`}
        >
          <div className="border-b border-white/10 px-5 py-3 md:px-8">
            <p className="text-sm font-black tracking-[0.2em] text-white/80">
              {speakerLabel}
            </p>
          </div>

          <div className="relative min-h-36 px-5 py-5 md:min-h-44 md:px-8 md:py-7">
            <p className="w-full break-words text-base font-bold leading-8 text-white md:text-xl md:leading-9">
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
