import React, { useRef, useState, useEffect } from 'react'
import { useGameLogic } from '@/hooks/useGameLogic/useGameLogic';

// import { topics, type Topics } from "../../config/aiConfig";

type IntroState = "shuffle" | "select";

type Props = ReturnType<typeof useGameLogic> & {
  onChangeScreen: () => void;
  closeIntro: () => void;
};

function IntroScreen({
  onChangeScreen,
  closeIntro,

  stance,
  setStance,
  aiStance,
  setAiStance,
  selectedAI,
  setSelectedAI,
  selectedTopic,
  setSelectedTopic,
  selectAi,
  selectTopic,
  selectStance,
  selectAiStance,

  wait,
  aiList,
  topicList
}: Props) {


  const [introState, setIntroState] = useState<IntroState>("shuffle");
  const [show, setShow] = useState(false);
  const [showCharacterReveal, setShowCharacterReveal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // シャッフル処理
  const startShuffle = () => {
    let i = 0;

    const timer = setInterval(() => {
      setSelectedAI(aiList[i % aiList.length]);
      i++;
    }, 50);
    return timer;
  };

  // 画面切り替え処理
  const showSelect = () => setIntroState("select");

  // フロー
  const introFlow = async () => {
    // シャッフル
    const timer = startShuffle();

    await wait(1700);

    clearInterval(timer);

    const ai = selectAi();
    // ランダムで対戦相手が決まる
    setSelectedAI(ai);

    // キャラ決定画面
    setShowCharacterReveal(true);
    clearInterval(timer);


    // キャラ表示
    setSelectedAI(ai);
    setIntroState("select");
    showSelect();

    // お題を表示（隠れてたものをただ出しただけ）
    await wait(1500);
    setShow(true);

    await wait(3000);
    // teamScreenを表示
    onChangeScreen();
    // introScreenがスッと消えるcss
    setIsClosing(true);

    // introScreenを消す
    await wait(1000);
    closeIntro();
  };

  useEffect(() => {
    introFlow();

  }, []);



  return (
    <div
      className={`min-h-screen w-full bg-black ${isClosing ? "fade-out" : ""
        }`}
    >
      {introState === "shuffle" ? (
        <div
          className="
        min-h-screen
        flex
        flex-col
        items-center
        justify-center
        gap-8
        px-4
        animate-in
        zoom-in
        duration-500
      "
        >

          <h2
            className="
          text-3xl
          md:text-5xl
          font-black
          text-white
          text-center
          animate-pulse
        "
          >
            対戦相手を決定中...
          </h2>


          <div className="flex flex-col items-center gap-6">

            <img
              src={selectedAI?.icon}
              className="
            w-48
            h-48
            md:w-80
            md:h-80
            rounded-full
            border-4
            md:border-8
            border-white
          "
            />

          </div>


          <div className="mt-6 text-center h-[120px] md:h-[200px]" />

        </div>

      ) : (

        <div
          className="
        min-h-screen
        flex
        flex-col
        items-center
        justify-center
        gap-8
        px-4
        animate-in
        zoom-in
        duration-500
      "
        >

          <h2
            className="
          text-3xl
          md:text-5xl
          font-black
          text-white
          text-center
        "
          >
            今回の相手は...
          </h2>



          <div
            className={`
          flex
          flex-col
          items-center
          gap-6
          ${showCharacterReveal
                ? "zoom-slash"
                : ""
              }
        `}
          >

            {selectedAI && (

              <img
                src={selectedAI.icon}
                className="
              w-48
              h-48
              md:w-80
              md:h-80
              rounded-full
              border-4
              md:border-8
              border-white
              shadow-[0_0_50px_rgba(255,255,255,0.5)]
            "
              />

            )}



            <p
              className="
            text-4xl
            md:text-6xl
            font-black
            tracking-wider
            text-white
            text-center
            break-words
          "
            >
              {selectedAI?.name}
            </p>

          </div>




          <div
            className="
          mt-6
          text-center
          h-[120px]
          flex
          flex-col
          justify-center
        "
          >

            <div
              className={`
            transition-all
            duration-700
            ease-out
            ${show
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
                }
          `}
            >

              <div className="text-sm text-white/50">
                今回のお題
              </div>


              <div
                className="
              text-lg
              md:text-2xl
              font-bold
              text-white
              mt-2
              max-w-2xl
              break-words
            "
              >
                {selectedTopic?.topic}
              </div>



              <div
                className="
              mt-4
              flex
              items-center
              justify-center
              gap-4
              md:gap-8
            "
              >

                <p className="text-sm text-white/50">
                  あなたは
                </p>


                <p
                  className="
                text-2xl
                md:text-3xl
                font-black
                text-white
                tracking-widest
              "
                >
                  {stance} 派
                </p>


              </div>

            </div>

          </div>


        </div>

      )}

    </div>
  )
}

export default IntroScreen
