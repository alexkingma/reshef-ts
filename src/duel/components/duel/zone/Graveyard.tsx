import { selectGraveyardZone } from "@/duel/duelSlice";
import { DKey, RowKey } from "@/duel/enums/duel";
import { isOccupied } from "@/duel/util/zoneUtil";
import { useAppSelector } from "@/hooks";
import { useMemo } from "react";
import { Card } from "../card/Card";
import { InteractiveZone } from "./InteractiveZone";
import { ZoneBackground } from "./ZoneBackground";

interface Props {
  duellistKey: DKey;
}

export const Graveyard = ({ duellistKey }: Props) => {
  const z = useAppSelector(selectGraveyardZone(duellistKey));

  const zoneCoords: ZoneCoords = useMemo(
    () => [duellistKey, RowKey.Graveyard, 0],
    [duellistKey]
  );

  return (
    <InteractiveZone zoneCoords={zoneCoords}>
      {isOccupied(z) ? (
        <Card zoneCoords={zoneCoords} />
      ) : (
        <ZoneBackground customClasses="graveyardBackground" />
      )}
    </InteractiveZone>
  );
};
