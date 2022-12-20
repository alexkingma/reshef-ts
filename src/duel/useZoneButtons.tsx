import React from "react";
import { useAppSelector } from "../hooks";
import { RowKey } from "./common";
import { selectActiveTurn, selectIsMyTurn, selectZone } from "./duelSlice";
import {
  canActivateEffect,
  getNumTributesRequired,
  isMonster,
  isSpell,
} from "./duelUtil";
import { useCardActions } from "./useCardActions";

export enum DuelButtonKey {
  Attack = "ATTACK",
  Summon = "SUMMON",
  Set = "SET",
  MonsterEffect = "MONSTER_EFFECT",
  SpellEffect = "SPELL_EFFECT",
  Tribute = "TRIBUTE",
  Defend = "DEFEND",
  Discard = "DISCARD",
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
  if (!condition(zone)) return null;

  return <button onClick={() => onClick(zoneIdx)}>{label}</button>;
};

export const useDuelButtons = (
  zoneCoords: ZoneCoords,
  buttonKeys: DuelButtonKey[]
) => {
  const [duellistKey, rowKey, colIdx] = zoneCoords;
  const isRow = (...rows: RowKey[]) => rows.includes(rowKey as RowKey);

  const zone = useAppSelector(selectZone(zoneCoords)) as OccupiedZone;
  const isMyTurn = useAppSelector(selectIsMyTurn(duellistKey));
  const { hasNormalSummoned, numTributedMonsters } =
    useAppSelector(selectActiveTurn);

  const canNormalSummon = (card: MonsterCard) => {
    if (!isMyTurn || hasNormalSummoned) return false;
    return numTributedMonsters >= getNumTributesRequired(card);
  };

  const {
    attack,
    defend,
    tribute,
    activateManualMonsterEffect,
    normalSummon,
    setSpellTrap,
    activateSpellEffect,
    discard,
  } = useCardActions(zoneCoords);

  const duelButtons: DuelButtonBlueprintMap = {
    [DuelButtonKey.Attack]: {
      label: "Attack",
      condition: (z) =>
        isMyTurn && isMonster(z) && !z.isLocked && isRow(RowKey.Monster),
      onClick: (i) => attack(),
    },
    [DuelButtonKey.Summon]: {
      label: "Summon",
      condition: (z) =>
        isMyTurn &&
        isMonster(z) &&
        canNormalSummon(z.card) &&
        isRow(RowKey.Hand),
      onClick: (i) => normalSummon(),
    },
    [DuelButtonKey.Set]: {
      label: "Set",
      condition: (z) => isMyTurn && !isMonster(z) && isRow(RowKey.Hand),
      onClick: (i) => setSpellTrap(),
    },
    [DuelButtonKey.SpellEffect]: {
      label: "Activate",
      condition: (z) => isMyTurn && isSpell(z) && isRow(RowKey.SpellTrap),
      onClick: (i) => activateSpellEffect(),
    },
    [DuelButtonKey.MonsterEffect]: {
      label: "Effect",
      condition: (z) =>
        isMyTurn &&
        isMonster(z) &&
        !z.isLocked &&
        canActivateEffect(z) &&
        isRow(RowKey.Monster),
      onClick: (i) => activateManualMonsterEffect(),
    },
    [DuelButtonKey.Tribute]: {
      label: "Tribute",
      condition: (z) =>
        isMyTurn && isMonster(z) && !z.isLocked && isRow(RowKey.Monster),
      onClick: (i) => tribute(),
    },
    [DuelButtonKey.Defend]: {
      label: "Defend",
      condition: (z) =>
        isMyTurn && isMonster(z) && !z.isLocked && isRow(RowKey.Monster),
      onClick: (i) => defend(),
    },
    [DuelButtonKey.Discard]: {
      label: "Discard",
      condition: () => isMyTurn,
      onClick: () => discard(),
    },
  };

  return (
    <>
      {buttonKeys.map((buttonKey) => {
        const buttonProps = duelButtons[buttonKey];
        return (
          <ZoneButton
            {...buttonProps}
            key={buttonKey}
            zone={zone}
            zoneIdx={colIdx}
          />
        );
      })}
    </>
  );
};
