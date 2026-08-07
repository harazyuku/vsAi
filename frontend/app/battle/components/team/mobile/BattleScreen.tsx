import type { ComponentProps } from "react";
import BaseBattleScreen from "../../shared/mobile/BaseBattleScreen";

type Props = Omit<ComponentProps<typeof BaseBattleScreen>, "isMultiplayer">;

export default function TeamBattleScreen(props: Props) {
  return <BaseBattleScreen {...props} isMultiplayer />;
}
