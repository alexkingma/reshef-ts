import levelIcon from "@/assets/images/level.png";
import spellIcon from "@/assets/images/spell.png";
import trapIcon from "@/assets/images/trap.png";
import { getAlignmentImage, getTypeImage } from "@/common/image";
import { selectCursorZone } from "@/duel/duelSlice";
import { getFinalPowerUpLevel } from "@/duel/util/zoneUtil";
import { useAppSelector } from "@/hooks";
import classNames from "classnames";
import React from "react";
import "./ZoneSummaryBar.scss";

export const ZoneSummaryBar = () => {
  const z = useAppSelector(selectCursorZone);

  // TODO: block viewing of opponent facedown cards
  if (!z.isOccupied) return <div className="zoneSummaryBar" />;
  const { name, category } = z.card;

  return (
    <div className={classNames("zoneSummaryBar")}>
      <div className="leftJustify">
        <div className="levelContainer">
          {/* render the level container regardless, in order to
          keep the name text aligned with the bottom of the bar */}
          {category === "Monster" && (
            <>
              <img src={levelIcon} className="levelIcon" />
              <div className="levelText">{z.card.level}</div>
            </>
          )}
        </div>
        <div className="name">{name}</div>
      </div>
      <div className="rightJustify">
        {category === "Monster" ? (
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
  const { effAtk, effDef, atk, def, alignment, type } = z.card;
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
  const { category, name } = z.card;

  return (
    <>
      {["Magic", "Ritual"].includes(category) && (
        <img src={spellIcon} className="icon" />
      )}
      {category === "Trap" && <img src={trapIcon} className="icon" />}
    </>
  );
};
