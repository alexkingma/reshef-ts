import { selectZone } from "@/duel/duelSlice";
import { RowKey } from "@/duel/enums/duel";
import { getCard } from "@/duel/util/cardUtil";
import { isPlayer } from "@/duel/util/duellistUtil";
import { isDefMode, isEmpty, isFaceUp, isMonster } from "@/duel/util/zoneUtil";
import { useAppSelector } from "@/hooks";
import classNames from "classnames";
import "./Card.scss";
import { FaceDownCard } from "./FaceDownCard";
import { FaceUpCard } from "./FaceUpCard";
import { LockedIndicator } from "./LockedIndicator";
import { MonsterStats } from "./MonsterStats";
import { NumTributesIndicator } from "./NumTributesIndicator";
import { PowerUpLevelIndicator } from "./PowerUpLevelIndicator";

const FaceUpMonsterIndicators = ({
  zone,
  card,
}: {
  zone: OccupiedMonsterZone;
  card: MonsterCard;
}) => {
  return (
    <>
      <MonsterStats atk={zone.effAtk} def={zone.effDef} />
      <NumTributesIndicator card={card} />
    </>
  );
};

interface Props {
  zoneCoords: ZoneCoords;
}

export const Card = ({ zoneCoords }: Props) => {
  const [dKey, rKey] = zoneCoords;
  const z = useAppSelector(selectZone(zoneCoords)) as OccupiedZone;

  if (isEmpty(z)) return null;

  const card = getCard(z.id);
  const isPlayerZone = isPlayer(dKey);
  const alwaysVisible = isFaceUp(z) || (rKey === RowKey.Hand && isPlayerZone);
  const customClasses = classNames(
    alwaysVisible && "alwaysVisible",
    isPlayerZone && "showOnHover"
  );

  return (
    <div className={classNames("cardContainer", isDefMode(z) && "defenceMode")}>
      <FaceUpCard card={card} customClasses={customClasses}>
        {isMonster(z) && (
          <FaceUpMonsterIndicators
            zone={z as OccupiedMonsterZone}
            card={card as MonsterCard}
          />
        )}
      </FaceUpCard>
      <FaceDownCard customClasses={customClasses} />
      {isMonster(z) && (
        <>
          <LockedIndicator
            zoneCoords={zoneCoords}
            customClasses={customClasses}
          />
          <PowerUpLevelIndicator
            zoneCoords={zoneCoords}
            customClasses={customClasses}
          />
        </>
      )}
    </div>
  );
};
