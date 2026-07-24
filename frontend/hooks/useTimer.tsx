import { useEffect, useRef, useState } from "react";

export const useTimer = () => {
  const [time, setTime] = useState(60);

  const teamTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const battleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // チーム画面タイマー
  const startTeamTimer = (seconds = 6000000) => {
    setTime(seconds);

    return new Promise<void>((resolve) => {
      teamTimerRef.current = setInterval(() => {
        setTime((prev) => {
          if (prev <= 1) {
            stopTeamTimer();
            resolve();
            return 0;
          }

          return prev - 1;
        });
      }, 1000);
    });
  };

  // バトル画面タイマー
  const startBattleTimer = (seconds = 360) => {
    setTime(seconds);

    return new Promise<void>((resolve) => {
      battleTimerRef.current = setInterval(() => {
        setTime((prev) => {
          if (prev <= 1) {
            stopBattleTimer();
            resolve();
            return 0;
          }

          return prev - 1;
        });
      }, 1000);
    });
  };

  const stopTeamTimer = () => {
    if (teamTimerRef.current) {
      clearInterval(teamTimerRef.current);
      teamTimerRef.current = null;
    }
  };

  const stopBattleTimer = () => {
    if (battleTimerRef.current) {
      clearInterval(battleTimerRef.current);
      battleTimerRef.current = null;
    }
  };

  // アンマウント時に両方止める
  useEffect(() => {
    return () => {
      stopTeamTimer();
      stopBattleTimer();
    };
  }, []);

  return {
    time,
    startTeamTimer,
    startBattleTimer,
    stopTeamTimer,
    stopBattleTimer,
  };
};