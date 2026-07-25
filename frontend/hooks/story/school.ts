import type { StoryContext, StoryLine } from "./types";

export function createSchoolStory({
  stance,
  aiStance,
  opponentStoryLines,
}: StoryContext): StoryLine[] {
  const story: StoryLine[] = [
    {
      speaker: "ナレーション",
      text: "昼休み。小学三年二組。今日は月に一度、みんなが待ち望む「からあげの日」だった。",
      scene: "karaage",
    },
    {
      speaker: "ナレーション",
      text: "給食のおかずは、特製唐揚げが二個。教室中が笑顔に包まれていた。",
      scene: "karaage",
    },
    {
      speaker: "佐藤くん",
      text: "一個は、あとで食べようっと！",
      scene: "karaage",
      visibleActors: ["sato"],
      focusActor: "sato",
    },
    {
      speaker: "ナレーション",
      text: "佐藤くんは唐揚げを一つ残し、牛乳を取りに席を立った。わずか三十秒後、席へ戻ると――",
      scene: "empty-plate",
    },
    {
      speaker: "佐藤くん",
      text: "……え？ ぼくの唐揚げがない！！",
      scene: "empty-plate",
      visibleActors: ["sato"],
      focusActor: "sato",
    },
    {
      speaker: "ナレーション",
      text: "教室が静まり返る。口元を隠す子、目をそらす子、笑いをこらえる子。しかし、誰も名乗り出ない。",
      scene: "empty-plate",
    },
    {
      speaker: "ナレーション",
      text: "担任の山田先生は、黒板に大きな文字を書いた。",
      scene: "class-trial",
    },
    {
      speaker: "山田先生",
      text: "学級裁判――『最後の唐揚げは、誰が食べてもよかったのか？』",
      scene: "class-trial",
    },
    {
      speaker: "山田先生",
      text: "今日は犯人探しをしません。もし、あなただったら食べますか？ みんなで考えましょう。",
      scene: "class-trial",
    },
    {
      speaker: "クラスメイト",
      text: "置きっぱなしにした佐藤くんが悪い！ 給食なんだから、誰が食べてもいいでしょ！",
      scene: "class-trial",
      visibleActors: ["gaki2"],
      focusActor: "gaki2",
    },
    {
      speaker: "クラスメイト",
      text: "でも、佐藤くんの机に置いてあったんだよ！ 勝手に食べる前に聞くべきだよ！",
      scene: "class-trial",
      visibleActors: ["gaki3"],
      focusActor: "gaki3",
    },
    {
      speaker: "クラスメイト",
      text: "腐るなら食べた方がいい！",
      scene: "class-trial",
      visibleActors: ["gaki2"],
      focusActor: "gaki2",
    },
    {
      speaker: "クラスメイト",
      text: "まだ三十秒しか経ってないよ！",
      scene: "class-trial",
      visibleActors: ["gaki3"],
      focusActor: "gaki3",
    },
    {
      speaker: "ナレーション",
      text: "意見が飛び交う中、一人の女の子が静かに手を挙げた。",
      scene: "class-trial",
    },
    {
      speaker: "女子生徒",
      text: "……もし、佐藤くんが、その唐揚げを一番楽しみにしていたとしたら？",
      scene: "class-trial",
      visibleActors: ["gaki4"],
      focusActor: "gaki4",
    },
    {
      speaker: "ナレーション",
      text: "教室が、再び静まり返った。",
      scene: "class-trial",
    },
    {
      speaker: "山田先生",
      text: "大切なのは、唐揚げの持ち主ですか？ お腹が空いていた人ですか？ それとも、食べてもいいと確認しなかったことですか？",
      scene: "class-trial",
    },
    {
      speaker: "対戦相手",
      side: "enemy",
      text:
        opponentStoryLines?.[aiStance] ??
        `俺は「${aiStance}」側だ。最後の唐揚げを食べる権利があったのか、はっきりさせよう。`,
      visibleActors: ["enemy"],
      focusActor: "enemy",
      revealStance: "enemy",
    },
    {
      speaker: "あなた",
      side: "player",
      text:
        stance === "食べてもよい"
          ? "どう考えても「食べてもよい」側でしょ！いみわかんないし。"
          : "「食べてはいけない」側にきまってるってゆってる。いいかげんにして",
      visibleActors: ["player", "enemy"],
      focusActor: "player",
      revealStance: "player",
    },
    {
      speaker: "ナレーション",
      text: "こうして、たった一個の唐揚げを巡る、三年二組史上最大の討論が始まった。",
      visibleActors: ["player", "enemy"],
    },
  ];

  const backdrops = {
    karaage: "/images/sonota/kyusyoku.webp",
    "empty-plate": "/images/sonota/karaagenosara.webp",
    "class-trial": "/images/sonota/gakkyusaiban.webp",
  } as const;
  let activeBackdrop: string | undefined;

  return story.map(({ scene, ...line }) => {
    if (scene) {
      activeBackdrop = backdrops[scene as keyof typeof backdrops];
    }

    return {
      ...line,
      backdrop: activeBackdrop,
    };
  });
}
