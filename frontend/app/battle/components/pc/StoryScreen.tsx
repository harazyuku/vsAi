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
  const playerStancePosition =
    selectedTopic.background === "court" && stance === "被告"
      ? "right-[7%] text-right"
      : "left-[7%] text-left";
  const enemyStancePosition =
    selectedTopic.background === "court"
      ? aiStance === "原告"
        ? "left-[7%] text-left"
        : "right-[7%] text-right"
      : "right-[7%] text-right";

  return (
    <div
      className={`relative h-[100dvh] min-h-[100dvh] w-full cursor-pointer overflow-hidden bg-gradient-to-br ${backgroundClass}`}
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

      {backdrop && selectedTopic.background === "school" && (
        <div className="pointer-events-none absolute inset-0 z-[1] bg-black/40" />
      )}

      {currentLine.scene === "anonymous-chat" && (
        <div className="story-scene-in absolute left-1/2 top-[7%] z-10 w-[min(88vw,560px)] -translate-x-1/2 rounded-[2rem] border border-white/15 bg-zinc-950/90 p-6 shadow-[0_30px_100px_rgba(0,0,0,.8)]">
          <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <p className="text-xs font-black tracking-[0.2em] text-white/35">ANONYMOUS CHAT</p>
              <p className="mt-1 font-bold text-white/80">2年A組・匿名ルーム</p>
            </div>
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
          </div>
          <div className="space-y-3">
            {["まだ学校来てるの？", "その写真、マジで笑える", "学校来んな", "消えろ", "死ね"].map(
              (message, index) => (
                <div
                  key={message}
                  className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm font-bold ${
                    index % 2 === 0
                      ? "bg-white/10 text-white/75"
                      : "ml-auto bg-red-950/80 text-red-100/80"
                  }`}
                >
                  <span className="mr-2 text-[10px] text-white/25">匿名{index + 1}</span>
                  {message}
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {currentLine.scene === "breaking-news" && (
        <div className="story-scene-in absolute inset-x-[6%] top-[12%] z-10 overflow-hidden rounded-xl border border-white/20 bg-slate-950/90 shadow-[0_30px_100px_rgba(0,0,0,.75)]">
          <div className="flex items-center gap-4 bg-red-700 px-6 py-3">
            <span className="text-xl font-black italic tracking-wider">BREAKING NEWS</span>
            <span className="h-px flex-1 bg-white/40" />
            <span className="text-xs font-bold">LIVE</span>
          </div>
          <div className="px-8 py-9 text-center">
            <p className="text-sm font-bold tracking-[0.25em] text-white/40">名門校で生徒死亡</p>
            <p className="mt-4 text-2xl font-black leading-relaxed md:text-4xl">
              学校はなぜ、
              <br />
              いじめを防げなかったのか
            </p>
          </div>
          <div className="bg-white px-5 py-2 text-sm font-black text-black">
            学校側の安全管理に批判集中　再発防止策の発表へ
          </div>
        </div>
      )}

      {currentLine.scene === "guardian-ai" && (
        <div className="story-scene-in absolute left-1/2 top-[7%] z-10 w-[min(90vw,760px)] -translate-x-1/2 overflow-hidden rounded-2xl border border-cyan-300/25 bg-slate-950/90 shadow-[0_0_70px_rgba(34,211,238,.12)]">
          <div className="border-b border-cyan-300/15 bg-cyan-400/[0.08] px-6 py-4">
            <p className="text-xs font-black tracking-[0.35em] text-cyan-300/60">SCHOOL SAFETY SYSTEM</p>
            <p className="mt-1 text-3xl font-black text-white">Guardian <span className="text-cyan-300">AI</span></p>
          </div>
          <div className="grid grid-cols-2 gap-3 p-6 md:grid-cols-3">
            {["メッセージ", "SNS", "検索履歴", "通話履歴", "写真", "位置情報"].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="text-sm font-bold text-white/70">{item}</span>
                <span className="text-xs font-black text-emerald-300">MONITORING</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2 border-t border-white/10 bg-red-950/30 py-3 text-xs font-black tracking-[0.2em] text-red-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
            24 HOURS ACTIVE
          </div>
        </div>
      )}

      {currentLine.scene === "diary" && (
        <div className="story-scene-in absolute left-1/2 top-[6%] z-10 h-[48vh] w-[min(78vw,620px)] -translate-x-1/2 -rotate-1 overflow-hidden rounded-sm bg-[#e9e1ca] px-10 py-9 text-slate-800 shadow-[0_35px_100px_rgba(0,0,0,.8)]">
          <div className="absolute inset-0 opacity-40 [background-image:repeating-linear-gradient(transparent_0,transparent_31px,rgba(71,85,105,.28)_32px)]" />
          <p className="relative font-serif text-sm text-slate-500">朝倉美咲　日記</p>
          <p className="relative mt-20 text-center font-serif text-2xl font-bold leading-loose md:text-4xl">
            誰にも見られない場所が、
            <br />
            一つだけ欲しかった。
          </p>
          <div className="absolute bottom-8 left-1/2 h-24 w-20 -translate-x-1/2 rounded-full bg-blue-400/10 blur-md" />
        </div>
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
          className={`absolute z-10 flex items-center justify-center transition-all duration-500 ${
            actor.id === "mob"
              ? "inset-x-[3%] top-[5%] h-[68%] w-[94%]"
              : actor.placement === "left"
              ? "left-[-16%] top-0 h-[62%] w-[76%] min-[1100px]:inset-y-0 min-[1100px]:left-[-4%] min-[1100px]:h-auto min-[1100px]:w-[42%]"
              : actor.placement === "center-left"
                ? "left-[-4%] top-0 h-[62%] w-[76%] min-[1100px]:inset-y-0 min-[1100px]:left-[25%] min-[1100px]:h-auto min-[1100px]:w-[38%]"
                : actor.placement === "center"
                  ? "left-1/2 top-[6%] h-[42%] w-[86%] -translate-x-1/2 min-[1100px]:top-[8%] min-[1100px]:h-[46%] min-[1100px]:w-[38%]"
                : "right-[-16%] top-0 h-[62%] w-[76%] min-[1100px]:inset-y-0 min-[1100px]:right-[-2%] min-[1100px]:h-auto min-[1100px]:w-[52%]"
          } ${
            actor.id.startsWith("gaki")
              ? "pb-[18vh] min-[1100px]:pb-[14vh]"
              : actor.id === "sato"
                ? "pb-[12vh] min-[1100px]:pb-[7vh]"
                : ""
          } ${
            actor.isFocused
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-3 scale-90 opacity-35"
          }`}
        >
          <div className="story-actor-in relative flex h-full w-full items-center justify-center">
            <div className="absolute h-[55%] w-[55%] rounded-full bg-white/10 blur-3xl" />
            <img
              src={actor.src}
              alt={actor.alt}
              className={`relative drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] ${
                actor.id.startsWith("gaki") ? "story-student-mask" : ""
              } ${
                actor.id === "sato" ? "story-sato-mask" : ""
              } ${
                actor.id === "mob" ? "story-engineer-mask" : ""
              } ${
                actor.id === "heroine" ||
                actor.id === "player" ||
                (!actor.isAICharacter &&
                  (actor.id === "plaintiff" || actor.id === "defendant"))
                  ? "story-character-bottom-fade"
                  : ""
              } ${
                actor.id === "heroine" && currentLine.speaker === "少女"
                  ? "story-heroine-tremble"
                  : actor.id === "gamemaster"
                    ? "story-monitor-in"
                    : ""
              } ${
                actor.id === "mob"
                  ? "story-engineer-mask aspect-[3/2] w-[min(62vw,760px)] max-w-none object-cover"
                  : actor.size === "claude"
                  ? "max-h-[45vh] max-w-[62%]"
                  : actor.size === "portrait"
                    ? "story-portrait-mask aspect-[3/4] max-h-[58vh] max-w-[72%] object-cover object-top"
                  : actor.size === "monitor"
                      ? "story-monitor-mask aspect-video h-full w-full rounded-md border-[10px] border-black bg-black object-cover object-[50%_22%] shadow-[0_0_50px_rgba(239,68,68,.35)]"
                  : actor.size === "student"
                    ? actor.id === "sato"
                      ? "max-h-[58vh] max-w-[96%] object-contain"
                      : "max-h-[44vh] max-w-[60%] object-contain"
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
        </div>
      ))}

      {revealedStances.enemy && (
        <div
          className={`absolute top-[8%] z-20 story-stance-in md:top-[12%] ${enemyStancePosition}`}
        >
          <p className="text-xs font-bold tracking-[0.4em] text-red-300/70">ENEMY STANCE</p>
          <p className="mt-2 text-2xl font-black text-white md:text-4xl">{aiStance}</p>
        </div>
      )}

      {revealedStances.player && (
        <div
          className={`absolute top-[8%] z-20 story-stance-in md:top-[12%] ${playerStancePosition}`}
        >
          <p className="text-xs font-bold tracking-[0.4em] text-blue-300/70">YOUR STANCE</p>
          <p className="mt-2 text-2xl font-black text-white md:text-4xl">{stance}</p>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 z-20 p-2 sm:p-4 md:p-10">
        <div
          className={`mx-auto max-w-6xl overflow-hidden rounded-xl border backdrop-blur-sm transition-colors sm:rounded-2xl md:backdrop-blur-xl ${
            isNarration
              ? "border-white/20 bg-black/75"
              : isSatoSpeaking
                ? "border-emerald-400/20 bg-[linear-gradient(135deg,rgba(2,20,15,.9),rgba(6,78,59,.68))] shadow-[0_0_28px_rgba(16,185,129,.08)]"
              : isTeacherSpeaking
                ? "border-violet-400/20 bg-[linear-gradient(135deg,rgba(17,10,31,.9),rgba(76,29,149,.62))] shadow-[0_0_28px_rgba(139,92,246,.08)]"
              : isClassmateOneSpeaking
                ? "border-red-400/20 bg-[linear-gradient(135deg,rgba(28,8,10,.9),rgba(127,29,29,.58))] shadow-[0_0_28px_rgba(239,68,68,.07)]"
              : isClassmateTwoSpeaking
                ? "border-cyan-300/20 bg-[linear-gradient(135deg,rgba(6,22,27,.9),rgba(21,94,117,.58))] shadow-[0_0_28px_rgba(34,211,238,.07)]"
              : isRaisedHandStudentSpeaking
                ? "border-pink-300/20 bg-[linear-gradient(135deg,rgba(28,10,21,.9),rgba(131,24,67,.58))] shadow-[0_0_28px_rgba(244,114,182,.07)]"
              : isGameMasterSpeaking
                ? "border-red-900/60 bg-[linear-gradient(135deg,rgba(10,0,0,.92),rgba(69,10,10,.78))] shadow-[0_0_35px_rgba(127,29,29,.16)]"
              : isHeroineSpeaking
                ? "border-sky-200/25 bg-[linear-gradient(135deg,rgba(15,23,42,.86),rgba(30,64,89,.68))] shadow-[0_0_30px_rgba(125,211,252,.08)]"
              : isMobSpeaking
                ? "border-zinc-400/20 bg-[linear-gradient(135deg,rgba(24,24,27,.88),rgba(63,63,70,.66))]"
              : isClaudeSpeaking
                ? "border-orange-400/40 bg-orange-950/70"
              : lineSide === "enemy"
                ? "border-red-400/30 bg-red-950/70"
                : "border-blue-400/30 bg-blue-950/70"
          }`}
        >
          <div className="border-b border-white/10 px-4 py-2 sm:px-5 sm:py-3 md:px-8">
            <p className="text-xs font-black tracking-[0.15em] text-white/80 sm:text-sm sm:tracking-[0.2em]">
              {speakerLabel}
            </p>
          </div>

          <div className="relative min-h-28 px-4 py-3 sm:min-h-36 sm:px-5 sm:py-5 md:min-h-44 md:px-8 md:py-7">
            <p className="w-full break-words text-sm font-bold leading-6 text-white sm:text-base sm:leading-8 md:text-xl md:leading-9">
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
