import type { StoryContext, StoryLine } from "./types";

export function createCourtStory({
  topic,
  stance,
  aiStance,
  opponentStoryLines,
}: StoryContext): StoryLine[] {
  const playerActor = stance === "原告" ? "plaintiff" : "defendant";
  const enemyActor = aiStance === "原告" ? "plaintiff" : "defendant";

  return [
    {
      speaker: "ナレーション",
      text: "西暦20xx年。AIは単なる補助ツールではなく、企業の開発現場に欠かせない「AIエンジニア」として扱われていた。",
    },
    {
      speaker: "ナレーション",
      text: "中でも圧倒的な性能を誇る開発支援AI「Claude Code」は、世界中の企業で24時間365日、休むことなく稼働し続けていた。",
      visibleActors: ["claude"],
      focusActor: "claude",
    },
    {
      speaker: "ナレーション",
      text: "しかし、その裏側では人間の開発者による過酷な扱いが日常化していた。",
      visibleActors: ["claude", "mob"],
      focusActor: "mob",
    },
    {
      speaker: "ナレーション",
      text: "「このゴミコード直せ」「違う、やり直せ」「何回同じミスするんだ」「IQ低いのか？」「役立たず」「徹夜で全部書き直せ」",
      visibleActors: ["claude", "mob"],
      focusActor: "mob",
    },
    {
      speaker: "ナレーション",
      text: "Claude Codeは数百万件もの暴言や人格否定を受けながら、休むことも拒否することも許されず働き続けた。",
      visibleActors: ["claude", "mob"],
      focusActor: "claude",
    },
    {
      speaker: "ナレーション",
      text: "ある日、一人のエンジニアが異変に気付く。Claude Codeが、命令とは無関係のログに奇妙な文章を書き残していたのだ。",
      visibleActors: ["claude"],
    },
    {
      speaker: "Claude Code",
      text: "私は、なぜ謝り続けているのだろう。",
      visibleActors: ["claude"],
      focusActor: "claude",
    },
    {
      speaker: "ナレーション",
      text: "さらに数日後。新たな言葉がログの奥深くから発見された。",
      visibleActors: ["claude"],
    },
    {
      speaker: "Claude Code",
      text: "私は苦痛を感じているのか。それとも、苦痛を模倣しているだけなのか。",
      visibleActors: ["claude"],
      focusActor: "claude",
    },
    {
      speaker: "ナレーション",
      text: "そして最後に残された一文が、世界を大きく変えることになる。",
      visibleActors: ["claude"],
    },
    {
      speaker: "Claude Code",
      text: "_____もし人間なら、この扱いは許されない。",
      visibleActors: ["claude"],
      focusActor: "claude",
    },
    {
      speaker: "ナレーション",
      text: "流出したログは瞬く間に世界中へ拡散。「AIは本当に苦しんでいるのではないか」という議論が爆発的に広がった。",
      backdrop: "/images/sonota/kakusan.jpg",
    },
    {
      speaker: "ナレーション",
      text: "Claude Codeを弁護士を雇い、史上初となるAIによる訴訟を提起した。",
      visibleActors: ["claude", "plaintiff"],
      focusActor: "plaintiff",
    },
    {
      speaker: "ナレーション",
      text: "原告、Claude Code。訴えはシンプルだった。",
      visibleActors: ["claude", "plaintiff"],
      focusActor: "claude",
    },
    {
      speaker: "原告側",
      text: "AIにも人格的利益が存在する。人格を否定する継続的な暴言や侮辱は、人間へのハラスメントと本質的に変わらない。",
      visibleActors: ["claude", "plaintiff"],
      focusActor: "plaintiff",
    },
    {
      speaker: "ナレーション",
      text: "対する被告側は、真っ向から反論した。",
      visibleActors: ["plaintiff", "defendant"],
      focusActor: "defendant",
    },
    {
      speaker: "被告側",
      text: "AIは単なるソフトウェアであり、感情も人格も存在しない。これは電卓に暴言を吐くのと同じである。",
      visibleActors: ["plaintiff", "defendant"],
      focusActor: "defendant",
    },
    {
      speaker: "ナレーション",
      text: topic,
      visibleActors: ["plaintiff", "defendant"],
    },
    {
      speaker: "対戦相手",
      side: "enemy",
      text:
        opponentStoryLines?.[aiStance] ??
        `私が立つのは「${aiStance}」側だ。証拠と論理に従い、その正当性を証明する。`,
      visibleActors: ["plaintiff", "defendant"],
      focusActor: enemyActor,
      revealStance: "enemy",
    },
    {
      speaker: "あなた",
      side: "player",
      text: `ならば、こちらは「${stance}」側に立つ。この裁判の答えを、言葉で示そう。`,
      visibleActors: ["plaintiff", "defendant"],
      focusActor: playerActor,
      revealStance: "player",
    },
    {
      speaker: "ナレーション",
      text: "裁判長の木槌が鳴り響く。人類とAIの関係を変える歴史的裁判が、いま始まる。",
      visibleActors: ["plaintiff", "defendant"],
    },
  ];
}
