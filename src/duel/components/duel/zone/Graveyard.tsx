import { selectGraveyardZone } from "@/duel/duelSlice";
import { DuellistKey, RowKey } from "@/duel/enums/duel";
import { getCard } from "@/duel/util/cardUtil";
import { isOccupied } from "@/duel/util/zoneUtil";
import { useAppSelector } from "@/hooks";
import { FaceUpCard } from "../card/FaceUpCard";
import { InteractiveZone } from "./InteractiveZone";
import { ZoneBackground } from "./ZoneBackground";

interface Props {
  duellistKey: DuellistKey;
}

export const Graveyard = ({ duellistKey }: Props) => {
  const z = useAppSelector(selectGraveyardZone(duellistKey));

  return (
    <InteractiveZone zoneCoords={[duellistKey, RowKey.Graveyard, 0]}>
      {isOccupied(z) ? (
        <div className="cardContainer">
          <FaceUpCard card={getCard(z.id)} customClasses="alwaysVisible" />
        </div>
      ) : (
        <ZoneBackground customClasses="graveyardBackground" />
      )}
    </InteractiveZone>
  );
};
