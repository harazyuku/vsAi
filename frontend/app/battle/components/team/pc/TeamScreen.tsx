import type { ComponentProps } from "react";
import BaseTeamScreen from "../../shared/pc/BaseTeamScreen";

type Props = Omit<ComponentProps<typeof BaseTeamScreen>, "isMultiplayer">;

export default function TeamTeamScreen(props: Props) {
  return <BaseTeamScreen {...props} isMultiplayer />;
}
