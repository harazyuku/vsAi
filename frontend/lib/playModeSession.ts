const PLAY_MODE_KEY = "vsAi_playMode";

export function startSoloPlay() {
  window.sessionStorage.setItem(PLAY_MODE_KEY, "solo");
  window.sessionStorage.removeItem("vsAi_activeRoom");
  window.sessionStorage.removeItem("vsAi_sharedGame");
  window.sessionStorage.removeItem("vsAi_matchPlayer");
}

export function startMultiplayerPlay() {
  window.sessionStorage.setItem(PLAY_MODE_KEY, "multiplayer");
}

export function isMultiplayerPlay() {
  return (
    typeof window !== "undefined" &&
    window.sessionStorage.getItem(PLAY_MODE_KEY) === "multiplayer"
  );
}
