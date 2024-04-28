import { RowKey } from "@/duel/common";
import { selectFieldCard } from "@/duel/duelSlice";
import { getCard } from "@/duel/util/cardUtil";
import { getFieldCardId } from "@/duel/util/fieldUtil";
import { useAppSelector } from "@/hooks";
import { FaceUpCard } from "../card/FaceUpCard";
import { InteractiveZone } from "./InteractiveZone";
import { ZoneBackground } from "./ZoneBackground";

interface Props {
  duellistKey: DuellistKey;
}

export const Field = ({ duellistKey }: Props) => {
  const fieldCardName = useAppSelector(selectFieldCard(duellistKey));

  return (
    <InteractiveZone zoneCoords={[duellistKey, RowKey.Field, 0]}>
      {fieldCardName ? (
        <div className="cardContainer">
          <FaceUpCard
            card={getCard(getFieldCardId(fieldCardName))}
            customClasses="alwaysVisible"
          />
        </div>
      ) : (
        <ZoneBackground customClasses={"fieldBackground"} />
      )}
    </InteractiveZone>
  );
};
