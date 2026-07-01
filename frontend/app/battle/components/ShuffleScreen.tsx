"use client";

import { useEffect, useState } from "react";
import { AICharacter } from "../../config/aiConfig";

interface ShuffleScreenProps {
  shufflingCharacter: AICharacter | null;
  finalCharacter: AICharacter | null;
  onClose: () => void;
  userStance: string;
  topic: any;
}

export default function ShuffleScreen({
  shufflingCharacter,
  finalCharacter,
  onClose,
  userStance,
  topic,
}: ShuffleScreenProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [showTopic, setShowTopic] = useState(false);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (!shufflingCharacter && finalCharacter) {
      setIsRevealed(false);
      setShowTopic(false);
      setIsFading(false);

      setTimeout(() => {
        setIsRevealed(true);
      }, 500);

      setTimeout(() => {
        setShowTopic(true);
      }, 2000);

      setTimeout(() => {
        setIsFading(true);
        setTimeout(onClose, 500);
      }, 6000);
    }
  }, [shufflingCharacter, finalCharacter, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-500 ${isFading ? "opacity-0" : "opacity-100"
        }`}
    >
      {!isRevealed ? (
        <>
          <h2 className="text-4xl font-bold mb-12 text-white/80 animate-pulse">
            対戦相手を決定中...
          </h2>

          <div className="flex flex-col items-center gap-6">
            {shufflingCharacter && (
              <img
                src={shufflingCharacter.icon}
                className="w-64 h-64 rounded-full border-4 border-white"
              />
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-8 animate-in zoom-in duration-500">
          <h2 className="text-5xl font-black text-white">
            今回の相手は...
          </h2>

          {finalCharacter && (
            <img
              src={finalCharacter.icon}
              className="w-80 h-80 rounded-full border-8 border-white shadow-[0_0_50px_rgba(255,255,255,0.5)]"
            />
          )}

          <p className="text-6xl font-black tracking-widest text-white">
            {finalCharacter?.name}
          </p>

          {/* お題＆立場（ここが“演出ゾーン”） */}
          <div className="mt-6 text-center h-[120px] flex flex-col justify-center">
            <div
              className={`transition-all duration-700 ease-out ${showTopic
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
                }`}
            >
              <div className="text-sm text-white/50">今回のお題</div>
              <div className="text-2xl font-bold text-white mt-2 max-w-2xl break-words">
                「{topic?.topic}」
              </div>

              <div className="mt-4 flex items-center justify-center gap-8">
                <p className="text-sm text-white/50">あなたは</p>

                <p className="text-3xl font-black text-white tracking-widest">
                  「{userStance}」 派
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}