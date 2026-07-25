import type { ComponentProps } from "react";
import BaseBattleScreen from "../../shared/pc/BaseBattleScreen";

type Props = Omit<
  ComponentProps<typeof BaseBattleScreen>,
  "isMultiplayer" | "sendSharedBattleMessage"
>;

export default function SoloBattleScreen(props: Props) {
  return (
    <BaseBattleScreen
      {...props}
      isMultiplayer={false}
      sendSharedBattleMessage={() => undefined}
    />
  );
}
