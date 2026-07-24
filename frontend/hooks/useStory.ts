"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AICharacter, Topic } from "@/app/config/aiConfig";

export type StoryLine = {
  speaker: "ナレーション" | "あなた" | "対戦相手";
  text: string;
  side?: "player" | "enemy";
};

type UseStoryProps = {
  selectedAI?: AICharacter | null;
  selectedTopic?: Topic | null;
  stance: string;
  aiStance: string;
  onComplete: () => void;
  typingSpeed?: number;
};

export function useStory({
  selectedAI,
  selectedTopic,
  stance,
  aiStance,
  onComplete,
  typingSpeed = 32,
}: UseStoryProps) {
  const [lineIndex, setLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const typingTimerRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const advanceStoryRef = useRef<() => void>(() => undefined);

  const story = useMemo<StoryLine[]>(() => {
    if (!selectedAI || !selectedTopic) return [];

    return [
      {
        speaker: "ナレーション",
        text: "ひとつの出来事をきっかけに、二つの主張が激しくぶつかろうとしていた。",
      },
      {
        speaker: "対戦相手",
        side: "enemy",
        text: `私の立場は「${aiStance}」だ。この結論を譲るつもりはない。`,
      },
      {
        speaker: "あなた",
        side: "player",
        text: `なら、こちらは「${stance}」の立場から話そう。`,
      },
      {
        speaker: "ナレーション",
        text: selectedTopic.topic,
      },
      {
        speaker: "対戦相手",
        side: "enemy",
        text: "互いの主張は平行線のまま。決着は、言葉でつけるしかないようだ。",
      },
      {
        speaker: "ナレーション",
        text: "それぞれの正義を懸けた討論が、いま始まる。",
      },
    ];
  }, [aiStance, selectedAI, selectedTopic, stance]);

  const currentLine = story[lineIndex];
  const isTyping = Boolean(currentLine && displayedText.length < currentLine.text.length);

  const stopTypingTimer = useCallback(() => {
    if (typingTimerRef.current === null) return;
    window.clearInterval(typingTimerRef.current);
    typingTimerRef.current = null;
  }, []);

  useEffect(() => {
    if (!currentLine) return;

    let characterIndex = 0;

    typingTimerRef.current = window.setInterval(() => {
      characterIndex += 1;
      setDisplayedText(currentLine.text.slice(0, characterIndex));

      if (characterIndex >= currentLine.text.length) {
        stopTypingTimer();
      }
    }, typingSpeed);

    return stopTypingTimer;
  }, [currentLine, stopTypingTimer, typingSpeed]);

  const completeOnce = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    stopTypingTimer();
    onComplete();
  }, [onComplete, stopTypingTimer]);

  const advanceStory = useCallback(() => {
    if (!currentLine) return;

    if (isTyping) {
      stopTypingTimer();
      setDisplayedText(currentLine.text);
      return;
    }

    if (lineIndex < story.length - 1) {
      setDisplayedText("");
      setLineIndex((current) => current + 1);
      return;
    }

    completeOnce();
  }, [completeOnce, currentLine, isTyping, lineIndex, stopTypingTimer, story.length]);

  const skipStory = useCallback(() => {
    completeOnce();
  }, [completeOnce]);

  useEffect(() => {
    advanceStoryRef.current = advanceStory;
  }, [advanceStory]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" || event.repeat) return;

      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLButtonElement
      ) {
        return;
      }

      event.preventDefault();
      advanceStoryRef.current();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    story,
    currentLine,
    lineIndex,
    displayedText,
    isTyping,
    advanceStory,
    skipStory,
  };
}
