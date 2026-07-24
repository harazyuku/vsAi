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

export default function MobileStoryScreen({
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
    return <div className="h-[100dvh] w-full bg-black" />;
  }

  const isNarration = currentLine.speaker === "ナレーション";
  const isClaudeSpeaking = currentLine.speaker === "Claude Code";
  const isGameMasterSpeaking = currentLine.speaker === "ゲームマスター";
  const isHeroineSpeaking = currentLine.speaker === "少女";
  const isMobSpeaking = currentLine.speaker === "参加者";
  const isSatoSpeaking = currentLine.speaker === "佐藤くん";
  const isTeacherSpeaking = currentLine.speaker === "山田先生";
  const isClassmateOneSpeaking =
    currentLine.speaker === "クラスメイト" && currentLine.focusActor === "gaki2";
  const isClassmateTwoSpeaking =
    currentLine.speaker === "クラスメイト" && currentLine.focusActor === "gaki3";
  const isRaisedHandStudentSpeaking = currentLine.speaker === "女子生徒";

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

  const bubbleClass = isNarration
    ? "border-white/20 bg-black/85"
    : isSatoSpeaking
      ? "border-emerald-400/20 bg-emerald-950/85"
      : isTeacherSpeaking
        ? "border-violet-400/20 bg-violet-950/85"
        : isClassmateOneSpeaking
          ? "border-red-400/20 bg-red-950/85"
          : isClassmateTwoSpeaking
            ? "border-cyan-300/20 bg-cyan-950/85"
            : isRaisedHandStudentSpeaking
              ? "border-pink-300/20 bg-pink-950/85"
              : isGameMasterSpeaking
                ? "border-red-900/60 bg-black/90"
                : isHeroineSpeaking
                  ? "border-sky-200/25 bg-slate-900/90"
                  : isMobSpeaking
                    ? "border-zinc-400/20 bg-zinc-900/90"
                    : isClaudeSpeaking
                      ? "border-orange-400/40 bg-orange-950/85"
                      : lineSide === "enemy"
                        ? "border-red-400/30 bg-red-950/85"
                        : "border-blue-400/30 bg-blue-950/85";

  return (
    <div
      className={`relative h-[100dvh] w-full cursor-pointer overflow-hidden bg-gradient-to-br ${backgroundStyles[selectedTopic.background]}`}
      onClick={advanceStory}
    >
      {backdrop && (
        <img
          src={backdrop}
          alt=""
          className="story-backdrop-in absolute inset-0 h-full w-full object-cover object-center"
        />
      )}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-black/45" />

      <button
        type="button"
        className="absolute right-3 top-[max(12px,env(safe-area-inset-top))] z-40 rounded-full border border-white/20 bg-black/55 px-4 py-2 text-[10px] font-black tracking-[0.2em] text-white/75"
        onClick={(event) => {
          event.stopPropagation();
          skipStory();
        }}
      >
        SKIP
      </button>

      <div className="pointer-events-none absolute inset-x-3 top-[8%] z-30 flex justify-between gap-3">
        <div className={`max-w-[46%] ${revealedStances.player ? "story-stance-in" : "invisible"}`}>
          <p className="text-[9px] font-black tracking-[0.25em] text-blue-300/75">YOUR STANCE</p>
          <p className="mt-1 break-words text-lg font-black text-white">{stance}</p>
        </div>
        <div className={`max-w-[46%] text-right ${revealedStances.enemy ? "story-stance-in" : "invisible"}`}>
          <p className="text-[9px] font-black tracking-[0.25em] text-red-300/75">ENEMY STANCE</p>
          <p className="mt-1 break-words text-lg font-black text-white">{aiStance}</p>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-[31%] top-[12%] z-10">
        {actorViews.map((actor, index) => {
          const hasPair = actorViews.length > 1;
          const positionClass = hasPair
            ? index === 0
              ? "left-[-8%] w-[58%]"
              : "right-[-8%] w-[58%]"
            : "left-1/2 w-[82%] -translate-x-1/2";
          const sizeClass =
            actor.id === "sato"
              ? "story-sato-mask max-h-[43dvh] max-w-[92%]"
              : actor.id.startsWith("gaki")
                ? "story-student-mask max-h-[38dvh] max-w-[72%]"
                : actor.size === "monitor"
                  ? "story-monitor-mask aspect-video max-h-[34dvh] w-[92%] rounded-md border-8 border-black bg-black object-cover object-[50%_22%]"
                  : actor.size === "portrait"
                    ? "story-portrait-mask aspect-[3/4] max-h-[42dvh] max-w-[76%] object-cover object-top"
                  : actor.isAICharacter
                    ? "aspect-square max-h-[34dvh] max-w-[74%] rounded-full border-4 border-white/20 bg-white object-cover"
                    : "max-h-[44dvh] max-w-[82%] object-contain";

          return (
            <div
              key={actor.id}
              className={`absolute inset-y-0 flex items-end justify-center transition-all duration-500 ${positionClass} ${
                actor.isFocused ? "scale-100 opacity-100" : "scale-90 opacity-35"
              }`}
            >
              <img
                src={actor.src}
                alt={actor.alt}
                className={`drop-shadow-[0_16px_35px_rgba(0,0,0,.85)] ${sizeClass} ${
                  actor.flipX ? "scale-x-[-1]" : ""
                }`}
              />
            </div>
          );
        })}
      </div>

      <div className="absolute inset-x-0 bottom-[max(12px,env(safe-area-inset-bottom))] z-30 px-3">
        <div className={`overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-sm ${bubbleClass}`}>
          <div className="border-b border-white/10 px-4 py-2.5">
            <p className="text-xs font-black tracking-[0.16em] text-white/80">{speakerLabel}</p>
          </div>
          <div className="relative min-h-[150px] px-4 py-4">
            <p className="break-words text-[17px] font-bold leading-7 text-white">
              {displayedText}
              {isTyping && (
                <span className="ml-1 inline-block h-5 w-0.5 animate-pulse bg-white/80 align-middle" />
              )}
            </p>
            {!isTyping && (
              <span className="absolute bottom-3 right-4 animate-bounce text-xs text-white/60">▼</span>
            )}
          </div>
        </div>
        <p className="mt-2 text-center text-[9px] tracking-[0.22em] text-white/35">TAP / ENTER</p>
      </div>
    </div>
  );
}
