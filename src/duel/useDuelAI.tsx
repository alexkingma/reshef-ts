import { useAppDispatch, useAppSelector } from "@/hooks";
import { RowKey } from "./common";
import { actions, selectDuel } from "./duelSlice";
import { useInteractionActions } from "./useDuelActions";
import { canAISummon } from "./util/aiUtil";
import { getDuellistCoordsMap } from "./util/duellistUtil";
import { getFirstEmptyZoneIdx, getRow, hasEmptyZone } from "./util/rowUtil";
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
  } = actions;
  const { setOriginZone, setTargetZone, resetInteractions } =
    useInteractionActions();
  const { ownHand, ownMonsters, ownSpellTrap } = getDuellistCoordsMap(dKey);

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

    // TODO: what this should actually look like is:
    // find highest atk, unlocked mon in hand
    // if it can be summoned with the current number of tributes, summon it
    // if it needs tributes, check if you have X (more) monsters below its atk on field
    //  if enough tributes exist, find the lowest atk one and tribute it
    //  if not enough tributes exist, mark the card as locked and start the loop again
    // continue this process in a do-while until no unlocked mons remain to check

    let highestAtk = -1;
    let highestAtkIdx = -1;
    const hand = getRow(state, ownHand);
    hand.forEach((handZone, i) => {
      if (!isMonster(handZone)) return;

      if (
        handZone.card.effAtk > highestAtk &&
        canAISummon(state, [...ownHand, i as FieldCol])
      ) {
        highestAtk = handZone.card.effAtk;
        highestAtkIdx = i;
      }
    });

    // cannot summon any monsters
    if (highestAtkIdx === -1) return false;

    const originCoords: ZoneCoords = [...ownHand, highestAtkIdx as FieldCol];
    const targetCoords: ZoneCoords = [...ownMonsters, 0 as FieldCol]; // TODO: calculate idx properly
    setOriginZone(originCoords);
    setTargetZone(targetCoords);
    // TODO: if tributes are necessary, tribute them before summoning
    // TODO: account for how many tributes have been made already
    dispatch(normalSummonAction(getZoneCoordsMap(originCoords)));
    resetInteractions();
    return true;
  };

  const activateMonsterEffect = (): boolean => {
    // TODO: build a card-condition map for what state
    // conditions are/aren't acceptable to activate.
    // activate for all facedowns who satisfy, left to right
    return false;
  };

  const attack = (): boolean => {
    // TODO
    // determine target enemy mon with highest atk
    // if facedown: determine highest atk own mon as attacker
    // if faceup: determine lowest atk own mon that still wins -- via simulated attackMonster() calls
    // if no target mon, attack with highest first

    // if no enemy mon to attack, attack with unlocked highest atk
    return false;
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
    if (activateSpell()) return; // SoRL, PoG
    if (setSpellTrap(isTrap)) return;
    if (discardFromHand()) return;
    endTurn();
  };

  return makeDecision;
};
