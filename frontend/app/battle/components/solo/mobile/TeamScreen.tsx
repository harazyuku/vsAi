import type { ComponentProps } from "react";
import BaseTeamScreen from "../../shared/mobile/BaseTeamScreen";

type Props = Omit<
  ComponentProps<typeof BaseTeamScreen>,
  "isMultiplayer" | "sendSharedTeamMessage"
>;

export default function SoloTeamScreen(props: Props) {
  return (
    <BaseTeamScreen
      {...props}
      isMultiplayer={false}
      sendSharedTeamMessage={() => undefined}
    />
  );
}
