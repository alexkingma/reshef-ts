import React from "react";
import { useAppSelector } from "../hooks";
import { InteractionMode, RowKey } from "./common";
import {
  selectActiveTurn,
  selectIsMyTurn,
  selectOpponentHasMonster,
  selectZone,
} from "./duelSlice";
import {
  canActivateEffect,
  getNumTributesRequired,
  hasTarget,
  isMonster,
  isSpell,
} from "./duelUtil";
import { useCardActions } from "./useCardActions";
import { useInteractionActions } from "./useInteractionActions";

export enum DuelButtonKey {
  Attack = "ATTACK",
  Summon = "SUMMON",
  SetSpellTrap = "SET_SPELL_TRAP",
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

export const useZoneButtons = (zoneCoords: ZoneCoords) => {
  const [duellistKey, rowKey, colIdx] = zoneCoords;
  const isRow = (...rows: RowKey[]) => rows.includes(rowKey as RowKey);

  const zone = useAppSelector(selectZone(zoneCoords)) as OccupiedZone;
  const opponentHasMonster = useAppSelector(
    selectOpponentHasMonster(duellistKey)
  );
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
    activateMonsterFlipEffect,
    normalSummon,
    setSpellTrap,
    activateSpellEffect,
    discard,
  } = useCardActions(zoneCoords);
  const {
    setOriginZone,
    setInteractionMode,
    setPendingAction,
    resetInteractions,
  } = useInteractionActions();

  const duelButtons: DuelButtonBlueprintMap = {
    [DuelButtonKey.Attack]: {
      label: "Attack",
      condition: (z) =>
        isMyTurn && isMonster(z) && !z.isLocked && isRow(RowKey.Monster),
      onClick: () => {
        setOriginZone(zoneCoords);
        if (opponentHasMonster) {
          // direct attack not possible, next step is to pick a monster to target
          setPendingAction(attack);
          setInteractionMode(InteractionMode.ChoosingOpponentMonster);
          // TODO: set cursor to be on opponent's first monster
        } else {
          // no monsters to target, direct attack
          attack();
          resetInteractions();
        }
      },
    },
    [DuelButtonKey.Defend]: {
      label: "Defend",
      condition: (z) =>
        isMyTurn && isMonster(z) && !z.isLocked && isRow(RowKey.Monster),
      onClick: () => defend(),
    },
    [DuelButtonKey.Summon]: {
      label: "Summon",
      condition: (z) =>
        isMyTurn &&
        isMonster(z) &&
        canNormalSummon(z.card) &&
        isRow(RowKey.Hand),
      onClick: () => {
        setOriginZone(zoneCoords);
        setPendingAction(normalSummon);
        setInteractionMode(InteractionMode.ChoosingOwnMonsterZone);
        // TODO: set cursor to be on first free zone (or 0 idx)
      },
    },
    [DuelButtonKey.SetSpellTrap]: {
      label: "Set",
      condition: (z) => isMyTurn && !isMonster(z) && isRow(RowKey.Hand),
      onClick: () => {
        setOriginZone(zoneCoords);
        setPendingAction(setSpellTrap);
        setInteractionMode(InteractionMode.ChoosingOwnSpellTrapZone);
        // TODO: set cursor to be on first free zone (or 0 idx)
      },
    },
    [DuelButtonKey.SpellEffect]: {
      label: "Activate",
      condition: (z) => isMyTurn && isSpell(z) && isRow(RowKey.SpellTrap),
      onClick: () => {
        if (hasTarget(zone.card.name)) {
          setOriginZone(zoneCoords);
          setPendingAction(activateSpellEffect);
          setInteractionMode(InteractionMode.ChoosingOwnMonster);
          // TODO: set cursor to be on first monster
        } else {
          activateSpellEffect();
        }
      },
    },
    [DuelButtonKey.MonsterEffect]: {
      label: "Flip Effect",
      condition: (z) =>
        isMyTurn &&
        isMonster(z) &&
        !z.isLocked &&
        canActivateEffect(z) &&
        isRow(RowKey.Monster),
      onClick: () => activateMonsterFlipEffect(),
    },
    [DuelButtonKey.Tribute]: {
      label: "Tribute",
      condition: (z) =>
        isMyTurn && isMonster(z) && !z.isLocked && isRow(RowKey.Monster),
      onClick: () => tribute(),
    },
    [DuelButtonKey.Discard]: {
      label: "Discard",
      condition: () => isMyTurn,
      onClick: () => discard(),
    },
  };

  return (
    <>
      {Object.entries(duelButtons).map(([buttonKey, buttonProps]) => {
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
