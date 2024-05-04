import { Monster } from "@/duel/common";
import { burn } from "@/duel/util/duellistUtil";
import { addToGraveyard } from "@/duel/util/graveyardUtil";
import {
  countMatchesInRow,
  destroyHighestAtk,
  powerDownHighestAtk,
} from "@/duel/util/rowUtil";
import { directAttack as directAttack_Wrapped } from "@/duel/util/wrappedUtil";
import {
  addCardToHand,
  clearZone,
  getZone,
  isMonster,
  isNotGodCard,
} from "@/duel/util/zoneUtil";

export const flipEffectReducers: CardSubsetReducerMap<
  Monster,
  DirectEffectReducer
> = {
  // direct attack
  [Monster.FireReaper]: directAttack_Wrapped,
  [Monster.Ooguchi]: directAttack_Wrapped,
  [Monster.RainbowFlower]: directAttack_Wrapped,
  [Monster.Jinzo7]: directAttack_Wrapped,
  [Monster.QueensDouble]: directAttack_Wrapped,
  [Monster.PenguinTorpedo]: (state, { zoneCoords, otherDKey }) => {
    const z = getZone(state, zoneCoords) as OccupiedMonsterZone;
    burn(state, otherDKey, z.card.effAtk);
    clearZone(state, zoneCoords);
  },

  // unsorted
  [Monster.Suijin]: (state, { zoneCoords, otherDKey }) => {
    const z = getZone(state, zoneCoords) as OccupiedMonsterZone;
    destroyHighestAtk(state, otherDKey, isNotGodCard);
    burn(state, otherDKey, z.card.effAtk);
  },
  [Monster.Kazejin]: (state, { zoneCoords, otherDKey }) => {
    const z = getZone(state, zoneCoords) as OccupiedMonsterZone;
    destroyHighestAtk(state, otherDKey, isNotGodCard);
    burn(state, otherDKey, z.card.effAtk);
  },
  [Monster.SangaOfTheThunder]: (state, { zoneCoords, otherDKey }) => {
    const z = getZone(state, zoneCoords) as OccupiedMonsterZone;
    destroyHighestAtk(state, otherDKey, isNotGodCard);
    burn(state, otherDKey, z.card.effAtk);
  },
  [Monster.Berfomet]: (state, { dKey }) => {
    addCardToHand(state, dKey, Monster.GazelleTheKingOfMythicalBeasts);
  },
  [Monster.NeedleBall]: (state, { dKey, otherDKey }) => {
    burn(state, dKey, 2000);
    burn(state, otherDKey, 1000);
  },
  [Monster.PrincessOfTsurugi]: (state, { otherSpellTrap, otherDKey }) => {
    const count = countMatchesInRow(state, otherSpellTrap);
    burn(state, otherDKey, 500 * count);
  },
  [Monster.NeedleWorm]: (state, { otherDKey }) => {
    const zones = state[otherDKey].deck.splice(0, 5);
    for (const z of zones) {
      if (!isMonster(z)) continue;
      addToGraveyard(state, otherDKey, z.card.id);
    }
  },
  [Monster.BlastJuggler]: (state, { otherDKey, zoneCoords }) => {
    // destroy 2 face-up opp monsters with an ATK 1000 or less, plus this card
    for (let i = 0; i < 2; i++) {
      destroyHighestAtk(
        state,
        otherDKey,
        (z) => (z as OccupiedMonsterZone).card.effAtk <= 1000
      );
    }
    clearZone(state, zoneCoords);
  },
  [Monster.DarkJeroid]: (state, { otherDKey }) => {
    powerDownHighestAtk(state, otherDKey);
  },
};
