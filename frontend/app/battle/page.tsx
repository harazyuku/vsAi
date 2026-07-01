"use client";

import { useState } from "react";
import SchoolBackground from "./components/Background/SchoolBackground";
import CourtBackground from "./components/Background/CourtBackground";
import DeathGameBackground from "./components/Background/DeathGameBackground";
import ShuffleScreen from "./components/ShuffleScreen";
import TeamScreen from "./components/TeamScreen";
import BattleScreen from "./components/BattleScreen";
import JudgeScreen from "./components/JudgeScreen";
import PhaseTransitionScreen from "./components/PhaseTransitionScreen";
import { useGameLogic } from "../../hooks/useGameLogic";
import { Topic } from "../config/aiConfig";

export default function Page() {
  const {
    messages, input, setinput, round, typingText, isTyping, isThinking, showNextRound, setShowNextRound,
    phase, screen, chatEndRef, teamMessages, aiCharacter, isShuffling, shufflingCharacter, currentTopic, userStance,
    isJudging, judgeResult, sendMessage, sendTeamMessage, handleAction, resetGame
  } = useGameLogic();
  
  const [showShuffle, setShowShuffle] = useState(true);

  // currentTopic または aiCharacter がロードされるまでは ShuffleScreen を表示
  if (!currentTopic || (!aiCharacter && isShuffling)) {
    return (
      <ShuffleScreen 
        shufflingCharacter={shufflingCharacter} 
        finalCharacter={aiCharacter}
        topic={currentTopic || { topic: "", instructionTemplate: "", stances: [], background: "school" }}
        userStance={userStance || ""}
        onClose={() => setShowShuffle(false)}
      />
    );
  }

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

      {showShuffle && (
        <ShuffleScreen 
          shufflingCharacter={isShuffling ? shufflingCharacter : null} 
          finalCharacter={aiCharacter} 
          topic={currentTopic}
          userStance={userStance || ""}
          onClose={() => setShowShuffle(false)}
        />
      )}

      {showNextRound && (
        <PhaseTransitionScreen 
          screen={screen} 
          round={round} 
          onClose={() => setShowNextRound(false)} 
        />
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
          aiCharacter={aiCharacter}
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
