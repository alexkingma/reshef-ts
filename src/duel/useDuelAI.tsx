import { useAppDispatch, useAppSelector } from "@/hooks";
import { useEffect } from "react";
import {
  actions,
  selectActiveTurn,
  selectConfig,
  selectDuel,
  selectIsCPU,
  selectIsDuelOver,
  selectIsMyTurn,
} from "./duelSlice";
import { BattlePosition } from "./enums/duel";
import { useInteractionActions } from "./useDuelActions";
import { monsterUsageMap } from "./util/aiMonsterFlipEffectUsageUtil";
import { spellUsageMap } from "./util/aiSpellUsageUtil";
import {
  canAISummonMonster,
  getFaceUpAttacker,
  getFaceUpTarget,
  getIdealBattlePos,
  getLethalAttackerTarget,
} from "./util/aiUtil";
import { getDuellistCoordsMap, selfUnderSoRL } from "./util/duellistUtil";
import {
  getFirstEmptyZoneIdx,
  getFirstOccupiedZoneIdx,
  getHighestAtkZoneIdx,
  getRow,
  hasEmptyZone,
} from "./util/rowUtil";
import { isValidSpellTarget, spellHasTarget } from "./util/targetedSpellUtil";
import {
  getZoneCoordsMap,
  isEmpty,
  isFaceDown,
  isLocked,
  isMonster,
  isOccupied,
  isSpell,
  isTrap,
  isUnlocked,
} from "./util/zoneUtil";

const decisions: Record<string, number> = {};

export const useDuelAI = (onDecision: () => void) => {
  const state = useAppSelector(selectDuel);
  const isDuelOver = useAppSelector(selectIsDuelOver);
  const dispatch = useAppDispatch();
  const {
    attack: attackAction,
    setDefencePos: setDefencePosAction,
    setAttackPos: setAttackPosAction,
    activateMonsterFlipEffect: activateMonsterFlipEffectAction,
    setSpellTrap: setSpellTrapAction,
    activateSpellEffect: activateSpellEffectAction,
    discard: discardAction,
    endTurn: endTurnAction,
    aiNormalSummon: aiNormalSummonAction,
  } = actions;
  const { dKey: dKey } = useAppSelector(selectActiveTurn);
  const { setOriginZone, setTargetZone, resetInteractions } =
    useInteractionActions();
  const { ownHand, ownMonsters, ownSpellTrap, otherMonsters } =
    getDuellistCoordsMap(dKey);

  const isMyTurn = useAppSelector(selectIsMyTurn(dKey));
  const { cpuDelayMs } = useAppSelector(selectConfig);
  const isCPU = useAppSelector(selectIsCPU(dKey));

  const executeLethal = (): boolean => {
    // Attempt to end the duel in a single attack, to save time.
    // Note that burn spells are never left on the field unused, so
    // there's no need to consider them out of order.
    const lethal = getLethalAttackerTarget(state, dKey);
    if (!lethal) return false;

    const { attackerIdx, targetIdx } = lethal;
    if (Number.isInteger(targetIdx)) {
      // mon-vs-mon attack
      commitAttack(attackerIdx, targetIdx);
    } else {
      // direct attack
      commitAttack(attackerIdx);
    }
    return true;
  };

  const setSpellTrap = (condition: (z: OccupiedZone) => boolean): boolean => {
    const emptyZoneIdx = getFirstEmptyZoneIdx(state, [...ownSpellTrap]);
    if (emptyZoneIdx === -1) return false; // no space

    const hand = getRow(state, ownHand);
    for (const [idx, z] of hand.entries()) {
      if (isEmpty(z) || isMonster(z) || !condition(z)) continue;
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
    // activate all spells that the usage criteria are satisfied for
    for (const [i, originZone] of getRow(state, ownSpellTrap).entries()) {
      if (!isSpell(originZone)) continue;

      const originCoords: ZoneCoords = [...ownSpellTrap, i];
      const coordsMap = getZoneCoordsMap(originCoords);
      const condition = spellUsageMap[originZone.id];
      if (!condition || !condition(state, coordsMap)) continue;

      setOriginZone(originCoords);
      if (spellHasTarget(originZone.id)) {
        const targetIdx = getHighestAtkZoneIdx(
          state,
          ownMonsters,
          (targetZone) => isValidSpellTarget(originZone.id, targetZone.id)
        );
        if (targetIdx === -1) continue;
        setTargetZone([...ownMonsters, targetIdx]);
      }
      dispatch(activateSpellEffectAction(coordsMap));
      resetInteractions();
      return true;
    }
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
    // activate all monster effects that fulfil activation criteria
    for (const [i, originZone] of getRow(state, ownMonsters).entries()) {
      if (
        isOccupied(originZone) &&
        isFaceDown(originZone) &&
        !isLocked(originZone)
      ) {
        const originCoords: ZoneCoords = [...ownMonsters, i];
        const coordsMap = getZoneCoordsMap(originCoords);
        const condition = monsterUsageMap[originZone.id];
        if (!condition || !condition(state, coordsMap)) continue;

        setOriginZone(originCoords);
        dispatch(activateMonsterFlipEffectAction(coordsMap));
        resetInteractions();
        return true;
      }
    }
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
    if (selfUnderSoRL(state, dKey)) return false;

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
    if (selfUnderSoRL(state, dKey)) return false;

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
    if (selfUnderSoRL(state, dKey)) return false;

    // If opponent monsters still exist, direct attacking is impossible.
    // This can happen if the opponent's monsters are too strong to be beaten,
    // forcing the AI to surrender further attacking chances with its remaining unlocked monsters.
    const targetIdx = getFirstOccupiedZoneIdx(state, otherMonsters);
    if (targetIdx !== -1) return false;

    const attackerIdx = getHighestAtkZoneIdx(
      state,
      ownMonsters,
      (z) => isUnlocked(z) && z.effAtk > 0
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
    if (originIdx === -1) return false;

    const originCoords: ZoneCoords = [...ownMonsters, originIdx];
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
    // TODO: don't ever discard god cards
    dispatch(discardAction(getZoneCoordsMap([...ownHand, 0] as ZoneCoords)));
    return true;
  };

  const endTurn = () => {
    dispatch(endTurnAction(getDuellistCoordsMap(dKey)));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const makeDecision = () => {
    // if at any point in a turn a duellist wins/loses, the AI
    // stops making decisions and surrenders control up the chain
    // to display victory messages, quit the duel, etc.
    if (isDuelOver) return "duelOver";

    // each fn returns true if a valid action was performed,
    // or false if no action was performed and the next priority task
    // should be moved onto in the same update cycle
    if (executeLethal()) return "executeLethal";
    if (setSpellTrap(isSpell)) return "setSpell";
    if (activateSpell()) return "activateSpell";
    if (summonMonster()) return "summonMonster";
    if (activateMonsterEffect()) return "activateMonsterEffect";
    if (attackFaceUpTarget()) return "attackFaceUpTarget";
    if (attackFaceDownTarget()) return "attackFaceDownTarget";
    if (attackDirectly()) return "attackDirectly";
    if (defendIfWeak()) return "defendIfWeak";
    if (setSpellTrap(isTrap)) return "setTrap";
    if (discardFromHand()) return "discardFromHand";
    endTurn();
    return "endTurn";
  };

  useEffect(() => {
    if (isDuelOver && Object.keys(decisions).length) {
      console.log("AI decision count", decisions);
    }
  }, [isDuelOver]);

  useEffect(() => {
    let decisionMakingTimeout: NodeJS.Timeout;
    if (isCPU && isMyTurn && !isDuelOver) {
      decisionMakingTimeout = setTimeout(() => {
        const d = makeDecision();
        decisions[d] ??= 0;
        decisions[d]++;
        onDecision();
      }, cpuDelayMs);
    }
    return () => clearTimeout(decisionMakingTimeout);
  }, [isCPU, isMyTurn, cpuDelayMs, isDuelOver, makeDecision, onDecision]);
};
