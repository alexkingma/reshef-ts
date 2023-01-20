import { useAppDispatch, useAppSelector } from "@/hooks";
import { BattlePosition, RowKey } from "./common";
import { actions, selectDuel } from "./duelSlice";
import { useInteractionActions } from "./useDuelActions";
import {
  canAISummonMonster,
  getFaceUpAttacker,
  getFaceUpTarget,
  getIdealBattlePos,
} from "./util/aiUtil";
import { getDuellistCoordsMap } from "./util/duellistUtil";
import {
  getFirstEmptyZoneIdx,
  getFirstOccupiedZoneIdx,
  getHighestAtkZoneIdx,
  getRow,
  hasEmptyZone,
} from "./util/rowUtil";
import {
  getZoneCoordsMap,
  isFaceDown,
  isMonster,
  isSpell,
  isTrap,
  isUnlocked,
} from "./util/zoneUtil";

export const useDuelAI = (dKey: DuellistKey) => {
  const state = useAppSelector(selectDuel);
  const dispatch = useAppDispatch();
  const {
    attack: attackAction,
    setDefencePos: setDefencePosAction,
    setAttackPos: setAttackPosAction,
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
      const originCoords: ZoneCoords = [...ownHand, idx];
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

      const originCoords: ZoneCoords = [...ownHand, originIdx];
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

  const commitAttack = (attackerIdx: number, targetIdx?: number) => {
    // this is a helper fn only
    const originCoords: ZoneCoords = [...ownMonsters, attackerIdx];
    setOriginZone(originCoords);
    if (Number.isInteger(targetIdx)) {
      setTargetZone([...otherMonsters, targetIdx!]);
    }
    dispatch(attackAction(getZoneCoordsMap(originCoords)));
    resetInteractions();
  };

  const attackFaceUpTarget = (): boolean => {
    // if a mon fails to find a target, blacklist it for future attacker lookups
    const failedOwnMonIdxs: number[] = [];
    do {
      // start by checking weakest attackers, since alignment advantage is a thing
      const attackerIdx = getFaceUpAttacker(state, dKey, failedOwnMonIdxs);
      const originCoords: ZoneCoords = [...ownMonsters, attackerIdx];

      // no valid attackers remain on own field
      if (attackerIdx === -1) return false;

      // look for highest atk opponent mon that the current attacker can destroy
      const targetIdx = getFaceUpTarget(state, originCoords);

      // selected attacker cannot defeat any opponent mons
      if (targetIdx === -1) {
        failedOwnMonIdxs.push(attackerIdx);
        continue;
      }

      // valid attacker and target found, go ahead with attack
      commitAttack(attackerIdx, targetIdx);
      return true;
    } while (true);
  };

  const attackFaceDownTarget = (): boolean => {
    // use strongest own mons to attack facedown opp mons left to right
    const targetIdx = getFirstOccupiedZoneIdx(state, otherMonsters, isFaceDown);
    if (targetIdx === -1) return false;

    const attackerIdx = getHighestAtkZoneIdx(state, ownMonsters, isUnlocked);
    if (attackerIdx === -1) return false;

    // valid attacker and target found, go ahead with attack
    commitAttack(attackerIdx, targetIdx);
    return true;
  };

  const attackDirectly = (): boolean => {
    // Once there are no opponent monsters left, attack directly with remaining mons.

    // If opponent monsters still exist, direct attacking is impossible.
    // This can happen if the opponent's monsters are too strong to be beaten,
    // forcing the AI to surrender further attacking chances with its remaining unlocked monsters.
    const targetIdx = getFirstOccupiedZoneIdx(state, otherMonsters);
    if (targetIdx !== -1) return false;

    const attackerIdx = getHighestAtkZoneIdx(
      state,
      ownMonsters,
      (z) => isUnlocked(z) && z.card.atk > 0
    );
    if (attackerIdx === -1) return false;

    commitAttack(attackerIdx);
    return true;
  };

  const defendIfWeak = (): boolean => {
    // Any unlocked mons at this point will not be able to attack this turn.
    // They should defend if they are stronger in DEF mode, or if an opponent
    // monster exists with higher atk than them.
    const originIdx = getFirstOccupiedZoneIdx(state, ownMonsters, isUnlocked);
    const originCoords: ZoneCoords = [...ownMonsters, originIdx];
    if (originIdx === -1) return false;

    const coordsMap: ZoneCoordsMap = getZoneCoordsMap(originCoords);
    setOriginZone(originCoords);
    if (getIdealBattlePos(state, originCoords) === BattlePosition.Attack) {
      dispatch(setAttackPosAction(coordsMap));
    } else {
      dispatch(setDefencePosAction(coordsMap));
    }
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
    if (attackFaceUpTarget()) return;
    if (attackFaceUpTarget()) return;
    if (attackFaceDownTarget()) return;
    if (attackDirectly()) return;
    if (defendIfWeak()) return;
    if (activateSpell()) return; // SoRL, PoG
    if (setSpellTrap(isTrap)) return;
    if (discardFromHand()) return;
    endTurn();
  };

  return makeDecision;
};
