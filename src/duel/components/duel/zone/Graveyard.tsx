import { selectGraveyardZone } from "@/duel/duelSlice";
import { DuellistKey, RowKey } from "@/duel/enums/duel";
import { getCard } from "@/duel/util/cardUtil";
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
      {z.isOccupied ? (
        <div className="cardContainer">
          <FaceUpCard card={getCard(z.card.id)} customClasses="alwaysVisible" />
        </div>
      ) : (
        <ZoneBackground customClasses="graveyardBackground" />
      )}
    </InteractiveZone>
  );
};
