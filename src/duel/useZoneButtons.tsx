import React from "react";
import { useAppSelector } from "../hooks";
import { DuellistRow, FieldCoords, FieldRow } from "./common";
import { selectActiveTurn, selectIsMyTurn, selectZone } from "./duelSlice";
import {
  canActivateEffect,
  getNumTributesRequired,
  isMonster,
} from "./duelUtil";
import useDuelActions from "./useDuelActions";

export enum DuelButtonKey {
  Attack = "ATTACK",
  Effect = "EFFECT",
  Tribute = "TRIBUTE",
  Discard = "DISCARD",
  Set = "SET",
  Summon = "SUMMON",
  Defend = "DEFEND",
}

interface DuelButtonBlueprint {
  label: string;
  condition: (z: OccupiedZone) => boolean;
  onClick: (zoneIdx: FieldCol) => void;
}

type DuelButtonBlueprintMap = {
  [key in DuelButtonKey]: DuelButtonBlueprint;
};

type Props = DuelButtonBlueprint & {
  zone: OccupiedZone;
  zoneIdx: FieldCol;
};

const ZoneButton = ({ zone, zoneIdx, label, condition, onClick }: Props) => {
  return (
    <button onClick={() => onClick(zoneIdx)} disabled={!condition(zone)}>
      {label}
    </button>
  );
};

export const useDuelButtons = (
  duellistKey: DuellistKey,
  zoneCoords: FieldCoords,
  buttonKeys: DuelButtonKey[]
) => {
  const [row, col] = zoneCoords;
  const zone = useAppSelector(selectZone(zoneCoords)) as OccupiedZone;
  const isMyTurn = useAppSelector(selectIsMyTurn(duellistKey));
  const { hasNormalSummoned, numTributedMonsters } =
    useAppSelector(selectActiveTurn);

  const canNormalSummon = (card: MonsterCard) => {
    if (!isMyTurn || hasNormalSummoned) return false;
    return numTributedMonsters >= getNumTributesRequired(card);
  };

  // const isRow = (...rows: DuellistRow[]) => rows.includes(row);

  const {
    changeBattlePosition,
    tribute,
    discard,
    attackMonster,
    setSpellTrap,
    activateManualMonsterEffect,
    normalSummon,
  } = useDuelActions(duellistKey);

  console.log(zoneCoords);

  const duelButtons: DuelButtonBlueprintMap = {
    [DuelButtonKey.Attack]: {
      label: "Attack",
      condition: (z) => isMyTurn && isMonster(z) && !z.isLocked,
      onClick: (i) => attackMonster(i),
    },
    [DuelButtonKey.Effect]: {
      label: "Effect",
      condition: (z) =>
        isMyTurn && isMonster(z) && !z.isLocked && canActivateEffect(z),
      onClick: (i) => activateManualMonsterEffect(i),
    },
    [DuelButtonKey.Tribute]: {
      label: "Tribute",
      condition: (z) => isMyTurn && isMonster(z) && !z.isLocked,
      onClick: (i) => tribute(i),
    },
    [DuelButtonKey.Discard]: {
      label: "Discard",
      condition: () => isMyTurn,
      onClick: () => discard(zoneCoords),
    },
    [DuelButtonKey.Set]: {
      label: "Set",
      condition: (z) => isMyTurn && !isMonster(z),
      onClick: (i) => setSpellTrap(i),
    },
    [DuelButtonKey.Summon]: {
      label: "Summon",
      condition: (z) => isMyTurn && isMonster(z) && canNormalSummon(z.card),
      onClick: (i) => normalSummon(i),
    },
    [DuelButtonKey.Defend]: {
      label: "Defend",
      condition: (z) => isMyTurn && isMonster(z) && !z.isLocked,
      onClick: (i) => changeBattlePosition(i),
    },
  };

  return (
    <>
      {buttonKeys.map((buttonKey) => {
        const buttonProps = duelButtons[buttonKey];
        return (
          <ZoneButton
            key={buttonKey}
            {...buttonProps}
            zone={zone}
            zoneIdx={col}
          />
        );
      })}
    </>
  );
};
