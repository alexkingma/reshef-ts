import { useAppDispatch, useAppSelector } from "../hooks";
import { hasFlipEffect } from "./cardEffects/flipEffects";
import {
  actions,
  selectActiveTurn,
  selectIsMyTurn,
  selectOpponentHasMonster,
  selectZone,
} from "./duelSlice";
import { InteractionMode, RowKey } from "./enums/duel";
import { getCard, getNumTributesRequired } from "./util/cardUtil";
import { spellHasTarget } from "./util/targetedSpellUtil";
import { canActivateFlipEffect, isMonster, isSpell } from "./util/zoneUtil";

const {
  // zone
  directAttack: directAttackAction,
  setDefencePos: defendAction,
  tribute: tributeAction,
  flipMonster: flipMonsterAction,
  activateDirectSpell: activateDirectSpellAction,
  discard: discardAction,

  // interaction
  setPendingCoords,
  setInteractionMode,
  resetInteractions,
} = actions;

interface InteractionProps {
  label: string;
  condition: (z: OccupiedZone) => boolean;
  effect: () => void;
}

export enum InteractionKey {
  Attack = "ATTACK",
  Summon = "SUMMON",
  SetSpellTrap = "SET_SPELL_TRAP",
  ActivateFlipEffect = "ACTIVATE_FLIP_EFFECT",
  ActivateSpell = "ACTIVATE_SPELL",
  Tribute = "TRIBUTE",
  Defend = "DEFEND",
  Discard = "DISCARD",
}

type DuelInteractionMap = {
  [key in InteractionKey]: InteractionProps;
};

export const useDuelInteraction = (
  zoneCoords: ZoneCoords
): DuelInteractionMap => {
  const [dKey, rowKey] = zoneCoords;
  const isRow = (...rows: RowKey[]) => rows.includes(rowKey as RowKey);

  const dispatch = useAppDispatch();
  const z = useAppSelector(selectZone(zoneCoords)) as OccupiedZone;
  const oppHasMonster = useAppSelector(selectOpponentHasMonster(dKey));
  const isMyTurn = useAppSelector(selectIsMyTurn(dKey));
  const { hasNormalSummoned, numTributedMonsters } =
    useAppSelector(selectActiveTurn);

  const canNormalSummon = (z: OccupiedMonsterZone) => {
    if (!isMyTurn || hasNormalSummoned) return false;
    const card = getCard(z.id) as MonsterCard;
    return numTributedMonsters >= getNumTributesRequired(card);
  };

  const interactionMap: DuelInteractionMap = {
    [InteractionKey.Attack]: {
      label: "Attack",
      condition: (z: Zone) =>
        isMyTurn && isMonster(z) && !z.isLocked && isRow(RowKey.Monster),
      effect: () => {
        if (oppHasMonster) {
          // direct attack not possible, next step is to pick a monster to target
          dispatch(setPendingCoords(zoneCoords));
          dispatch(setInteractionMode(InteractionMode.ChoosingOpponentMonster));
          // TODO: set cursor to be on opponent's first monster
        } else {
          // no monsters to target, direct attack
          dispatch(directAttackAction({ originCoords: zoneCoords }));
        }
      },
    },
    [InteractionKey.Defend]: {
      label: "Defend",
      condition: (z: Zone) =>
        isMyTurn && isMonster(z) && !z.isLocked && isRow(RowKey.Monster),
      effect: () => {
        dispatch(defendAction({ originCoords: zoneCoords }));
      },
    },
    [InteractionKey.Summon]: {
      label: "Summon",
      condition: (z: Zone) =>
        isMyTurn && isMonster(z) && canNormalSummon(z) && isRow(RowKey.Hand),
      effect: () => {
        dispatch(setPendingCoords(zoneCoords));
        dispatch(setInteractionMode(InteractionMode.ChoosingOwnMonsterZone));
        // TODO: set cursor to be on first free zone (or 0 idx)
      },
    },
    [InteractionKey.SetSpellTrap]: {
      label: "Set",
      condition: (z: Zone) => isMyTurn && !isMonster(z) && isRow(RowKey.Hand),
      effect: () => {
        dispatch(setPendingCoords(zoneCoords));
        dispatch(setInteractionMode(InteractionMode.ChoosingOwnSpellTrapZone));
        // TODO: set cursor to be on first free zone (or 0 idx)
      },
    },
    [InteractionKey.ActivateSpell]: {
      label: "Activate",
      condition: (z: Zone) => isMyTurn && isSpell(z) && isRow(RowKey.SpellTrap),
      effect: () => {
        if (spellHasTarget(z.id)) {
          dispatch(setPendingCoords(zoneCoords));
          dispatch(setInteractionMode(InteractionMode.ChoosingOwnMonster));
          // TODO: set cursor to be on first monster
        } else {
          dispatch(activateDirectSpellAction({ originCoords: zoneCoords }));
          dispatch(resetInteractions());
        }
      },
    },
    [InteractionKey.ActivateFlipEffect]: {
      label: "Flip Effect",
      condition: (z: Zone) =>
        isMyTurn &&
        isMonster(z) &&
        !z.isLocked &&
        hasFlipEffect(z.id) &&
        canActivateFlipEffect(z) &&
        isRow(RowKey.Monster),
      effect: () => {
        dispatch(flipMonsterAction({ originCoords: zoneCoords }));
      },
    },
    [InteractionKey.Tribute]: {
      label: "Tribute",
      condition: (z: Zone) =>
        isMyTurn && isMonster(z) && !z.isLocked && isRow(RowKey.Monster),
      effect: () => {
        dispatch(tributeAction({ originCoords: zoneCoords }));
      },
    },
    [InteractionKey.Discard]: {
      label: "Discard",
      condition: () =>
        isMyTurn && isRow(RowKey.Hand, RowKey.SpellTrap, RowKey.Monster),
      effect: () => {
        dispatch(discardAction({ originCoords: zoneCoords }));
      },
    },
  };

  return interactionMap;
};
