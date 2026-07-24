"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AICharacter, Topic } from "@/app/config/aiConfig";
import { createSchoolStory } from "./story/school";
import { createCourtStory } from "./story/court";
import { createDeathGameStory } from "./story/deathgame";
import type { StoryActorId, StoryActorView, StoryContext, StoryLine } from "./story/types";

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

    const context: StoryContext = {
      topic: selectedTopic.topic,
      stance,
      aiStance,
    };

    switch (selectedTopic.background) {
      case "school":
        return createSchoolStory(context);
      case "court":
        return createCourtStory(context);
      case "deathgame":
        return createDeathGameStory(context);
    }
  }, [aiStance, selectedAI, selectedTopic, stance]);

  const currentLine = story[lineIndex];
  const isTyping = Boolean(currentLine && displayedText.length < currentLine.text.length);

  useEffect(() => {
    const backdropUrls = story
      .map((line) => line.backdrop)
      .filter((backdrop): backdrop is string => Boolean(backdrop));

    backdropUrls.forEach((backdrop) => {
      const image = new Image();
      image.src = backdrop;
    });
  }, [story]);

  const lineSide =
    currentLine?.side ??
    (currentLine?.speaker === "原告側"
      ? stance === "原告"
        ? "player"
        : "enemy"
      : currentLine?.speaker === "被告側"
        ? stance === "被告"
          ? "player"
          : "enemy"
        : undefined);
  const revealedStances = useMemo(() => {
    const revealedLines = story.slice(0, lineIndex + 1);

    return {
      player: revealedLines.some((line) => line.revealStance === "player"),
      enemy: revealedLines.some((line) => line.revealStance === "enemy"),
    };
  }, [lineIndex, story]);

  const actorViews = useMemo<StoryActorView[]>(() => {
    if (!currentLine || !selectedAI) return [];

    const actors: Record<StoryActorId, Omit<StoryActorView, "isFocused">> = {
      claude: {
        id: "claude",
        src: "/images/chara-icons/claude.PNG",
        alt: "Claude Code",
        position: "left",
        placement: "left",
        size: "claude",
        flipX: false,
        isAICharacter: false,
      },
      mob: {
        id: "mob",
        src: "/images/chara-icons/mobu.PNG",
        alt: "開発者",
        position: "right",
        placement: "right",
        size: "normal",
        flipX: false,
        isAICharacter: false,
      },
      plaintiff: {
        id: "plaintiff",
        src: stance === "原告" ? "/images/chara-icons/player.PNG" : selectedAI.icon,
        alt: stance === "原告" ? "あなた（原告側）" : `${selectedAI.name}（原告側）`,
        position: "left",
        placement: "left",
        size: stance === "原告" ? "normal" : "ai",
        flipX: true,
        isAICharacter: stance !== "原告",
      },
      defendant: {
        id: "defendant",
        src: stance === "被告" ? "/images/chara-icons/player.PNG" : selectedAI.icon,
        alt: stance === "被告" ? "あなた（被告側）" : `${selectedAI.name}（被告側）`,
        position: "right",
        placement: "right",
        size: stance === "被告" ? "normal" : "ai",
        flipX: false,
        isAICharacter: stance !== "被告",
      },
      enemy: {
        id: "enemy",
        src: selectedAI.icon,
        alt: selectedAI.name,
        position: "right",
        placement: "right",
        size: "ai",
        flipX: false,
        isAICharacter: true,
      },
    };

    const visibleActors = currentLine.visibleActors ?? [];
    const showsClaudeAndPlaintiff =
      visibleActors.includes("claude") && visibleActors.includes("plaintiff");

    return visibleActors.map((actorId) => ({
      ...actors[actorId],
      placement:
        showsClaudeAndPlaintiff && actorId === "plaintiff"
          ? "center-left"
          : actors[actorId].placement,
      isFocused: currentLine.focusActor === actorId,
    }));
  }, [currentLine, selectedAI, stance]);

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
    lineSide,
    revealedStances,
    actorViews,
    backdrop: currentLine?.backdrop,
    advanceStory,
    skipStory,
  };
}
