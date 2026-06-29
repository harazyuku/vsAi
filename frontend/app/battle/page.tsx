"use client";

import SchoolBackground from "./components/Background/SchoolBackground";
import CourtBackground from "./components/Background/CourtBackground";
import DeathGameBackground from "./components/Background/DeathGameBackground";
import TeamScreen from "./components/TeamScreen";
import BattleScreen from "./components/BattleScreen";
import JudgeScreen from "./components/JudgeScreen";
import { useGameLogic } from "../../hooks/useGameLogic";

export default function Page() {
  const {
    messages, input, setinput, round, typingText, isTyping, isThinking, showNextRound,
    phase, screen, chatEndRef, teamMessages, aiCharacter, currentTopic, userStance,
    isJudging, judgeResult, sendMessage, sendTeamMessage, handleAction, resetGame
  } = useGameLogic();

  if (!aiCharacter || !currentTopic) return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
      <div className="text-center space-y-4">
        <div className="text-4xl font-black tracking-widest animate-pulse text-white">
          NOW LOADING...
        </div>
        <div className="w-16 h-1 bg-white/20 mx-auto rounded-full overflow-hidden">
          <div className="h-full bg-white animate-loading-bar"></div>
        </div>
      </div>
    </div>
  );

  const renderBackground = () => {
    switch (currentTopic.background) {
      case "court":
        return <CourtBackground />;
      case "deathgame":
        return <DeathGameBackground />;
      case "school":
      default:
        return <SchoolBackground />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative">
      <div className="fixed inset-0 z-0">
        {renderBackground()}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {showNextRound && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80">
          <div className="text-5xl font-bold animate-pulse">
            {screen === "team" ? "TEAM PHASE" : "BATTLE PHASE"}
          </div>
          <div className="text-xl text-white/60 mt-4">
            第 {round} ラウンド
          </div>
        </div>
      )}

      {screen === "team" ? (
        <TeamScreen
          round={round}
          messages={messages}
          teamMessages={teamMessages}
          input={input}
          onChangeInput={setinput}
          onSendTeamMessage={sendTeamMessage}
          onConfirmTeamAction={handleAction}
          topic={currentTopic.topic}
          userStance={userStance!}
        />
      ) : screen === "battle" ? (
        <BattleScreen
          round={round}
          messages={messages}
          teamMessages={teamMessages}
          input={input}
          onChangeInput={setinput}
          onSendMessage={handleAction}
          phase={phase}
          isTyping={isTyping}
          typingText={typingText}
          isThinking={isThinking}
          chatEndRef={chatEndRef}
          topic={currentTopic.topic}
          userStance={userStance!}
          aiCharacter={aiCharacter!}
        />
      ) : (
        <JudgeScreen 
          isLoading={isJudging} 
          result={judgeResult} 
          onReset={resetGame} 
        />
      )}
    </div>
  );
}
