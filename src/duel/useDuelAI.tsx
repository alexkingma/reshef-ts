import { useAppDispatch, useAppSelector } from "@/hooks";
import { Orientation, RowKey } from "./common";
import { actions, selectDuel } from "./duelSlice";
import { useInteractionActions } from "./useDuelActions";
import { canAISummonMonster, getWeakestVictorIdx } from "./util/aiUtil";
import { getDuellistCoordsMap } from "./util/duellistUtil";
import {
  getFirstEmptyZoneIdx,
  getHighestAtkZoneIdx,
  getRow,
  hasEmptyZone,
} from "./util/rowUtil";
import { getZoneCoordsMap, isMonster, isSpell, isTrap } from "./util/zoneUtil";

export const useDuelAI = (dKey: DuellistKey) => {
  const state = useAppSelector(selectDuel);
  const dispatch = useAppDispatch();
  const {
    attack: attackAction,
    defend: defendAction,
    tribute: tributeAction,
    activateMonsterFlipEffect: activateMonsterFlipEffectAction,
    normalSummon: normalSummonAction,
    setSpellTrap: setSpellTrapAction,
    activateSpellEffect: activateSpellEffectAction,
    discard: discardAction,
    endTurn: endTurnAction,
    aiNormalSummon: aiNormalSummonAction,
  } = actions;
  const { setOriginZone, setTargetZone, resetInteractions } =
    useInteractionActions();
  const { ownHand, ownMonsters, ownSpellTrap, otherMonsters } =
    getDuellistCoordsMap(dKey);

  const executeLethal = (): boolean => {
    // TODO:
    // if opp has no monsters: check all mons from left to right
    // if opp has attack pos mons:
    //  check each mon, starting with highest atk, until one is successful (to account for alignment stuff)
    //  probably need to keep track of which mons we've checked in an arr or something
    // if opp has only defence pos mons: quit lethal attempt
    return false;
  };

  const setSpellTrap = (condition: (z: OccupiedZone) => boolean): boolean => {
    let emptyZoneIdx;
    try {
      emptyZoneIdx = getFirstEmptyZoneIdx(state, [dKey, RowKey.SpellTrap]);
    } catch {
      // no space to summon spells
      return false;
    }

    const hand = getRow(state, ownHand);
    for (const [idx, z] of hand.entries()) {
      if (!z.isOccupied || isMonster(z) || !condition(z)) continue;
      const originCoords: ZoneCoords = [...ownHand, idx as FieldCol];
      setOriginZone(originCoords);
      setTargetZone([...ownSpellTrap, emptyZoneIdx]);
      dispatch(setSpellTrapAction(getZoneCoordsMap(originCoords)));
      resetInteractions();
      return true;
    }
    return false;
  };

  const activateSpell = (): boolean => {
    // TODO: pass in one of three prebuilt spell-condition maps
    // powerups -> a monster exists that it works on
    // heal -> true
    // burn -> true
    // raigeki/BTK -> opponent has monster
    // HFD -> opp has spell
    // etc.
    return false;
  };

  const summonMonster = (): boolean => {
    if (state.activeTurn.hasNormalSummoned) return false;

    // A mon is "unsummonable" if the AI would have to tribute/overwrite
    // an equal atk or higher monster to get it on the field.
    const unsummonableIdxs: number[] = [];
    do {
      const originIdx = getHighestAtkZoneIdx(
        state,
        ownHand,
        (_, i) => !unsummonableIdxs.includes(i)
      );

      // no monsters left in hand to check --> do not normal summon this turn
      if (originIdx === -1) return false;

      const originCoords: ZoneCoords = [...ownHand, originIdx as FieldCol];
      if (canAISummonMonster(state, originCoords)) {
        // Note that AI summoning is different from the player's summon.
        // Humans tribute mons one at a time, while the AI tributes and/or
        // summons all in one discrete step.
        setOriginZone(originCoords);
        dispatch(aiNormalSummonAction(getZoneCoordsMap(originCoords)));
        resetInteractions();
        return true;
      } else {
        // this mon can't be summoned, try the next one
        unsummonableIdxs.push(originIdx);
      }
    } while (true);
  };

  const activateMonsterEffect = (): boolean => {
    // TODO: build a card-condition map for what state
    // monsters are/aren't acceptable to activate.
    // activate for all facedowns who satisfy, left to right
    return false;
  };

  const attack = (): boolean => {
    // TODO: change this
    // if there are faceup enemy mons:
    //   iterate own monsters, find lowest atk, unlocked, etc.
    //   look for highest atk faceup target that attacker can destroy while surviving
    // if there are still faceup mons after that, do the same loop, but this time accept mutual destruction outcomes
    // at this point, if there are still faceups, we ignore them and focus on facedowns
    //   this part should be mostly unchanged: attack with highest atk until one side runs out of mons
    // once all facedowns are gone, if there are still attackers and (unkillable, at this point) targets:
    //   all remaining attackers lock themselves in atk/def mode depending on if the enemy has a higher atk faceup or not
    // if there are no targets remaining, all attackers with >0 direct attack

    const targetMonsters = getRow(state, otherMonsters) as MonsterZone[];

    // attack the faceup mon with highest atk
    for (const [i, targetZone] of targetMonsters.entries()) {
      if (!targetZone.isOccupied) continue;
      if (targetZone.orientation === Orientation.FaceDown) continue;

      // determine lowest atk own mon that still wins
      const weakestVictorIdx = getWeakestVictorIdx(state, dKey, i as FieldCol);
      if (weakestVictorIdx === -1) {
        // no monsters exist that can beat this target
        continue;
      }

      const originCoords: ZoneCoords = [...ownMonsters, weakestVictorIdx];
      const targetCoords: ZoneCoords = [...otherMonsters, i as FieldCol];
      setOriginZone(originCoords);
      setTargetZone(targetCoords);
      dispatch(attackAction(getZoneCoordsMap(originCoords)));
      resetInteractions();
      return true;
    }

    // if there are no faceup mons, attack the facedowns instead
    for (const [i, targetZone] of targetMonsters.entries()) {
      if (!targetZone.isOccupied) continue;
      if (targetZone.orientation === Orientation.FaceUp) continue;

      // attack from strongest to weakest
      const attackerIdx = getHighestAtkZoneIdx(
        state,
        ownMonsters,
        (z) => !(z as OccupiedMonsterZone).isLocked
      );
      if (attackerIdx === -1) {
        // no monsters to attack with
        continue;
      }

      const originCoords: ZoneCoords = [...ownMonsters, attackerIdx];
      const targetCoords: ZoneCoords = [...otherMonsters, i as FieldCol];
      setOriginZone(originCoords);
      setTargetZone(targetCoords);
      dispatch(attackAction(getZoneCoordsMap(originCoords)));
      resetInteractions();
      return true;
    }

    // once there are no opponent monsters remaining, attack directly
    const attackerIdx = getHighestAtkZoneIdx(
      state,
      ownMonsters,
      (z) => !(z as OccupiedMonsterZone).isLocked
    );

    if (attackerIdx === -1) {
      // no monsters to attack with
      return false;
    }

    const originCoords: ZoneCoords = [...ownMonsters, attackerIdx];
    setOriginZone(originCoords);
    dispatch(attackAction(getZoneCoordsMap(originCoords)));
    resetInteractions();
    return true;
  };

  const discardFromHand = (): boolean => {
    // before ending turn, ensure the hand has a free zone
    // so you have space to draw a card next turn

    // already space, do nothing
    if (hasEmptyZone(state, ownHand)) return false;

    // TODO: how does the AI determine which card to discard?
    dispatch(discardAction(getZoneCoordsMap([...ownHand, 0] as ZoneCoords)));
    return true;
  };

  const endTurn = () => {
    dispatch(endTurnAction(getDuellistCoordsMap(dKey)));
  };

  const makeDecision = () => {
    // each fn returns true if a valid action was performed,
    // or false if no action was performed and the next priority task
    // should be moved onto in the same update cycle
    if (executeLethal()) return;
    if (setSpellTrap(isSpell)) return;
    if (activateSpell()) return; // heal, raigeki, BTD
    if (summonMonster()) return;
    if (activateSpell()) return; // powerups
    if (activateMonsterEffect()) return;
    if (attack()) return;
    // TODO: defend with any monsters that can't attack
    if (activateSpell()) return; // SoRL, PoG
    if (setSpellTrap(isTrap)) return;
    if (discardFromHand()) return;
    endTurn();
  };

  return makeDecision;
};
