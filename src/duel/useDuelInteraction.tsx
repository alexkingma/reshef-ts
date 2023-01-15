import { useAppSelector } from "../hooks";
import { InteractionMode, RowKey } from "./common";
import {
  selectActiveTurn,
  selectIsMyTurn,
  selectOpponentHasMonster,
  selectZone,
} from "./duelSlice";
import { useCardActions, useInteractionActions } from "./useDuelActions";
import { getNumTributesRequired } from "./util/cardUtil";
import { spellHasTarget } from "./util/targetedSpellUtil";
import { canActivateEffect, isMonster, isSpell } from "./util/zoneUtil";

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

export const useDuelInteraction = (zoneCoords: ZoneCoords) => {
  const [duellistKey, rowKey] = zoneCoords;
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
    attack: attackAction,
    defend: defendAction,
    tribute: tributeAction,
    activateMonsterFlipEffect: activateMonsterFlipEffectAction,
    normalSummon: normalSummonAction,
    setSpellTrap: setSpellTrapAction,
    activateSpellEffect: activateSpellEffectAction,
    discard: discardAction,
  } = useCardActions(zoneCoords);
  const {
    setOriginZone,
    setInteractionMode,
    setPendingAction,
    resetInteractions,
  } = useInteractionActions();

  const interactionMap: DuelInteractionMap = {
    [InteractionKey.Attack]: {
      label: "Attack",
      condition: (z: Zone) =>
        isMyTurn && isMonster(z) && !z.isLocked && isRow(RowKey.Monster),
      effect: () => {
        setOriginZone(zoneCoords);
        if (opponentHasMonster) {
          // direct attack not possible, next step is to pick a monster to target
          setPendingAction(attackAction);
          setInteractionMode(InteractionMode.ChoosingOpponentMonster);
          // TODO: set cursor to be on opponent's first monster
        } else {
          // no monsters to target, direct attack
          attackAction();
          resetInteractions();
        }
      },
    },
    [InteractionKey.Defend]: {
      label: "Defend",
      condition: (z: Zone) =>
        isMyTurn && isMonster(z) && !z.isLocked && isRow(RowKey.Monster),
      effect: () => {
        setOriginZone(zoneCoords);
        defendAction();
        resetInteractions();
      },
    },
    [InteractionKey.Summon]: {
      label: "Summon",
      condition: (z: Zone) =>
        isMyTurn &&
        isMonster(z) &&
        canNormalSummon(z.card) &&
        isRow(RowKey.Hand),
      effect: () => {
        setOriginZone(zoneCoords);
        setPendingAction(normalSummonAction);
        setInteractionMode(InteractionMode.ChoosingOwnMonsterZone);
        // TODO: set cursor to be on first free zone (or 0 idx)
      },
    },
    [InteractionKey.SetSpellTrap]: {
      label: "Set",
      condition: (z: Zone) => isMyTurn && !isMonster(z) && isRow(RowKey.Hand),
      effect: () => {
        setOriginZone(zoneCoords);
        setPendingAction(setSpellTrapAction);
        setInteractionMode(InteractionMode.ChoosingOwnSpellTrapZone);
        // TODO: set cursor to be on first free zone (or 0 idx)
      },
    },
    [InteractionKey.ActivateSpell]: {
      label: "Activate",
      condition: (z: Zone) => isMyTurn && isSpell(z) && isRow(RowKey.SpellTrap),
      effect: () => {
        setOriginZone(zoneCoords);
        if (spellHasTarget(zone.card.name)) {
          setPendingAction(activateSpellEffectAction);
          setInteractionMode(InteractionMode.ChoosingOwnMonster);
          // TODO: set cursor to be on first monster
        } else {
          activateSpellEffectAction();
          resetInteractions();
        }
      },
    },
    [InteractionKey.ActivateFlipEffect]: {
      label: "Flip Effect",
      condition: (z: Zone) =>
        isMyTurn &&
        isMonster(z) &&
        !z.isLocked &&
        canActivateEffect(z) &&
        isRow(RowKey.Monster),
      effect: () => {
        setOriginZone(zoneCoords);
        activateMonsterFlipEffectAction();
        resetInteractions();
      },
    },
    [InteractionKey.Tribute]: {
      label: "Tribute",
      condition: (z: Zone) =>
        isMyTurn && isMonster(z) && !z.isLocked && isRow(RowKey.Monster),
      effect: () => {
        setOriginZone(zoneCoords);
        tributeAction();
        resetInteractions();
      },
    },
    [InteractionKey.Discard]: {
      label: "Discard",
      condition: () => isMyTurn,
      effect: () => {
        setOriginZone(zoneCoords);
        discardAction();
        resetInteractions();
      },
    },
  };

  return interactionMap;
};
