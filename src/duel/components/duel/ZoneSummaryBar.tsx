import levelIcon from "@/assets/images/level.png";
import spellIcon from "@/assets/images/spell.png";
import trapIcon from "@/assets/images/trap.png";
import { getAlignmentImage, getTypeImage } from "@/common/image";
import {
  selectCursorZone,
  selectShouldHighlightCursorZone,
} from "@/duel/duelSlice";
import { getCard } from "@/duel/util/cardUtil";
import {
  getFinalPowerUpLevel,
  isMonster,
  isOccupied,
  isTrap,
} from "@/duel/util/zoneUtil";
import { useAppSelector } from "@/hooks";
import classNames from "classnames";
import "./ZoneSummaryBar.scss";

export const ZoneSummaryBar = () => {
  const z = useAppSelector(selectCursorZone);
  const isHoverAllowed = useAppSelector(selectShouldHighlightCursorZone);

  // render empty bar for empty zones and opponent facedowns
  if (!isOccupied(z) || !isHoverAllowed) {
    return <div className="zoneSummaryBar" />;
  }

  const card = getCard(z.id);

  return (
    <div className={classNames("zoneSummaryBar")}>
      <div className="leftJustify">
        <div className="levelContainer">
          {/* render the level container regardless, in order to
          keep the name text aligned with the bottom of the bar */}
          {isMonster(z) && (
            <>
              <img src={levelIcon} className="levelIcon" />
              <div className="levelText">{(card as MonsterCard).level}</div>
            </>
          )}
        </div>
        <div className="name">{card.name}</div>
      </div>
      <div className="rightJustify">
        {isMonster(z) ? (
          <MonsterZonePartialSummaryBar />
        ) : (
          <SpellTrapRitualZonePartialSummaryBar />
        )}
      </div>
    </div>
  );
};

const MonsterZonePartialSummaryBar = () => {
  const z = useAppSelector(selectCursorZone) as OccupiedMonsterZone;
  const finalPowerUpLevel = getFinalPowerUpLevel(z);
  const { effAtk, effDef, id } = z;
  const { atk, def, alignment, type } = getCard(id) as MonsterCard;
  const hasPositivePowerUpLevel = finalPowerUpLevel > 0;
  const hasNegativePowerUpLevel = finalPowerUpLevel < 0;

  return (
    <>
      {(hasPositivePowerUpLevel || hasNegativePowerUpLevel) && (
        <div
          className={classNames(
            "powerUpLevel",
            hasPositivePowerUpLevel && "positive",
            hasNegativePowerUpLevel && "negative"
          )}
        >
          ({(hasPositivePowerUpLevel ? "+" : "") + finalPowerUpLevel})
        </div>
      )}

      <div className="atkDefContainer">
        <div className="atkDefIcons">
          <div>{"\u2694"}</div>
          <div>{"\u26CA"}</div>
        </div>
        <div className="atkDefValues">
          <div
            className={classNames(
              effAtk > atk && "positive",
              effAtk < atk && "negative"
            )}
          >
            {effAtk}
          </div>
          <div
            className={classNames(
              effDef > def && "positive",
              effDef < def && "negative"
            )}
          >
            {effDef}
          </div>
        </div>
      </div>

      <img src={getTypeImage(type)} className="icon" />
      <img src={getAlignmentImage(alignment)} className="icon" />
    </>
  );
};

const SpellTrapRitualZonePartialSummaryBar = () => {
  const z = useAppSelector(selectCursorZone) as OccupiedSpellTrapZone;

  return (
    <>
      {!isTrap(z) && <img src={spellIcon} className="icon" />}
      {isTrap(z) && <img src={trapIcon} className="icon" />}
    </>
  );
};
