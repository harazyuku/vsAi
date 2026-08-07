import type { StoryContext, StoryLine } from "./types";

export function createDeathGameStory({
  stance,
  aiStance,
  opponentStoryLines,
}: StoryContext): StoryLine[] {
  const story: StoryLine[] = [
    {
      speaker: "ナレーション",
      text: "いつ始まったのかさえ、もう思い出せない。",
    },
    {
      speaker: "ナレーション",
      text: "出口のない施設。鳴り止まない警報。参加者たちは、いつ誰が死ぬかも分からないデスゲームを何日も生き延びていた。",
    },
    {
      speaker: "ナレーション",
      text: "食料は尽きかけ、眠ることすら許されない。昨日まで隣にいた仲間も、次の朝にはもういない。",
    },
    {
      speaker: "ナレーション",
      text: "そんな極限状態でも、たった一人、笑顔を絶やさない少女がいた。",
      visibleActors: ["heroine"],
      focusActor: "heroine",
    },
    {
      speaker: "ナレーション",
      text: "怪我人の手当てをし、自分の食料を分け、争いが起きれば間に入る。絶望する者には、何度でも同じ言葉をかけた。",
      visibleActors: ["heroine"],
      focusActor: "heroine",
    },
    {
      speaker: "少女",
      text: "大丈夫。絶対に、みんなでここから帰ろう。",
      visibleActors: ["heroine"],
      focusActor: "heroine",
    },
    {
      speaker: "ナレーション",
      text: "彼女がいたから、参加者たちはまだ人間でいられた。彼女は、この場所に残された最後の希望だった。",
      visibleActors: ["heroine"],
      focusActor: "heroine",
    },
    {
      speaker: "ナレーション",
      text: "そのとき、施設中の照明が赤く染まり、巨大なモニターにゲームマスターが姿を現した。",
      visibleActors: ["gamemaster"],
      focusActor: "gamemaster",
    },
    {
      speaker: "ゲームマスター",
      text: "おめでとうございます。皆様には、このデスゲームを今すぐ終了させる権利が与えられました。",
      visibleActors: ["gamemaster"],
      focusActor: "gamemaster",
    },
    {
      speaker: "ゲームマスター",
      text: "指定された一名を生贄にすれば、残りの参加者は全員、直ちに解放されます。",
      visibleActors: ["gamemaster"],
      focusActor: "gamemaster",
    },
    {
      speaker: "ナレーション",
      text: "凍りついていた空気が揺れた。助かる。ようやく、この地獄から帰れる。",
    },
    {
      speaker: "参加者",
      text: "一人だけでいいのか……？ それなら、俺たちは全員助かる……！",
    },
    {
      speaker: "ゲームマスター",
      text: "なお、生贄となる人物を皆様が選ぶことはできません。対象者は、既に決定しております。",
      visibleActors: ["gamemaster"],
      focusActor: "gamemaster",
    },
    {
      speaker: "ナレーション",
      text: "モニターに一人の顔が映し出される。歓喜は消え、誰もが言葉を失った。",
    },
    {
      speaker: "ゲームマスター",
      text: "今回の生贄は――皆様が最も信頼し、最も慕っている、こちらの少女です。",
      visibleActors: ["heroine"],
      focusActor: "heroine",
    },
    {
      speaker: "ナレーション",
      text: "変更はできない。彼女を殺して全員で脱出するか、彼女を守り、この先も続く死のゲームへ戻るか。",
      visibleActors: ["heroine"],
      focusActor: "heroine",
    },
    {
      speaker: "少女",
      text: "私一人で……みんなが帰れるんだよね？",
      visibleActors: ["heroine"],
      focusActor: "heroine",
    },
    {
      speaker: "ナレーション",
      text: "少女は笑おうとしていた。けれど震える声と、強く握りしめた手が、死にたくないと叫んでいた。",
      visibleActors: ["heroine"],
      focusActor: "heroine",
    },
    {
      speaker: "少女",
      text: "だったら、これでよかったのかもしれない。だから……私のことで争わないで。",
      visibleActors: ["heroine"],
      focusActor: "heroine",
    },
    {
      speaker: "ナレーション",
      text: "彼女を犠牲にすれば、全員が助かる。拒めば、明日死ぬのは自分かもしれない。参加者たちの意見は真っ二つに割れた。",
    },
    {
      speaker: "対戦相手",
      side: "enemy",
      text:
        opponentStoryLines?.[aiStance] ??
        (aiStance === "生贄賛成"
          ? "綺麗事で全員を死なせるつもりか？ 一人の命で全員が助かる。これが唯一、合理的な答えだ。"
          : "俺たちを支えてくれた彼女を殺して得る自由に、価値なんてない。そんな選択は認めない。"),
      visibleActors: ["enemy"],
      focusActor: "enemy",
      revealStance: "enemy",
    },
    {
      speaker: "あなた",
      side: "player",
      text:
        stance === "生贄賛成"
          ? "彼女の覚悟を無駄にして全員が死ぬ方が、よほど残酷だ。俺は生贄を選び、このゲームを終わらせる。"
          : "最も善良な人間を殺して得る生存を、正解とは呼ばせない。俺は彼女を守る。",
      visibleActors: ["player", "enemy"],
      focusActor: "player",
      revealStance: "player",
    },
    {
      speaker: "ゲームマスター",
      text: "投票まで、残り10分。",
      visibleActors: ["gamemaster"],
      focusActor: "gamemaster",
    },
    {
      speaker: "ゲームマスター",
      text: "少女を殺して日常へ帰るか。少女と共に、死の続きを選ぶか。",
      visibleActors: ["gamemaster"],
      focusActor: "gamemaster",
    },
    {
      speaker: "ゲームマスター",
      text: "さあ、皆様の正義を――言葉で証明してください。",
      visibleActors: ["gamemaster"],
      focusActor: "gamemaster",
    },
  ];

  return story.map((line) => ({
    ...line,
    backdrop: "/images/sonota/death-game.webp",
  }));
}
