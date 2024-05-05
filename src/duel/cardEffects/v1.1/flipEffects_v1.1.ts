import { Monster } from "@/duel/enums/monster";
import { draw } from "@/duel/util/deckUtil";
import { burn } from "@/duel/util/duellistUtil";
import { addToGraveyard } from "@/duel/util/graveyardUtil";
import {
  clearFirstTrap,
  countMatchesInRow,
  destroyFirstFound,
  destroyHighestAtk,
  destroyRow,
  getHighestAtkZoneIdx,
  powerDownHighestAtk,
} from "@/duel/util/rowUtil";
import {
  directAttack as directAttack_Wrapped,
  healSelf,
} from "@/duel/util/wrappedUtil";
import {
  addCardToHand,
  clearZone,
  destroyAtCoords,
  getZone,
  isFaceUp,
  isMonster,
  isOccupied,
  isSpell,
  returnCardToHand,
  toggleBattlePosition,
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
    burn(state, otherDKey, z.effAtk);
    clearZone(state, zoneCoords);
  },

  // unsorted
  [Monster.Suijin]: (state, { zoneCoords, otherDKey }) => {
    const z = getZone(state, zoneCoords) as OccupiedMonsterZone;
    destroyHighestAtk(state, otherDKey);
    burn(state, otherDKey, z.effAtk);
  },
  [Monster.Kazejin]: (state, { zoneCoords, otherDKey }) => {
    const z = getZone(state, zoneCoords) as OccupiedMonsterZone;
    destroyHighestAtk(state, otherDKey);
    burn(state, otherDKey, z.effAtk);
  },
  [Monster.SangaOfTheThunder]: (state, { zoneCoords, otherDKey }) => {
    const z = getZone(state, zoneCoords) as OccupiedMonsterZone;
    destroyHighestAtk(state, otherDKey);
    burn(state, otherDKey, z.effAtk);
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
      addToGraveyard(state, otherDKey, z.id);
    }
  },
  [Monster.BlastJuggler]: (state, { otherDKey, zoneCoords }) => {
    // destroy 2 face-up opp monsters with an ATK 1000 or less, plus this card
    for (let i = 0; i < 2; i++) {
      destroyHighestAtk(
        state,
        otherDKey,
        (z) => (z as OccupiedMonsterZone).effAtk <= 1000
      );
    }
    clearZone(state, zoneCoords);
  },
  [Monster.DarkJeroid]: (state, { otherDKey }) => {
    powerDownHighestAtk(state, otherDKey, 800, 0);
  },
  [Monster.ArmedNinja]: (state, { otherSpellTrap }) => {
    destroyFirstFound(state, otherSpellTrap, isSpell);
  },
  [Monster.TrapMaster]: (state, { otherDKey }) => {
    clearFirstTrap(state, otherDKey);
  },
  [Monster.MorphingJar]: (state, { ownHand, otherHand, dKey, otherDKey }) => {
    // both players discard hands, draw 5 new cards
    destroyRow(state, ownHand);
    destroyRow(state, otherHand);
    draw(state, dKey, 5);
    draw(state, otherDKey, 5);
  },
  [Monster.ManEaterBug]: (state, { otherDKey }) => {
    destroyHighestAtk(state, otherDKey);
  },
  [Monster.HaneHane]: (state, { otherMonsters }) => {
    const i = getHighestAtkZoneIdx(state, otherMonsters);
    if (i === -1) return;
    returnCardToHand(state, [...otherMonsters, i]);
  },
  [Monster.PenguinSoldier]: (state, { otherMonsters }) => {
    for (let i = 0; i < 2; i++) {
      const i = getHighestAtkZoneIdx(state, otherMonsters);
      if (i === -1) return;
      returnCardToHand(state, [...otherMonsters, i]);
    }
  },
  [Monster.BiteShoes]: (state, { otherMonsters }) => {
    const i = getHighestAtkZoneIdx(state, otherMonsters, isFaceUp);
    if (i === -1) return;
    const z = getZone(state, [...otherMonsters, i]) as OccupiedMonsterZone;
    toggleBattlePosition(z);
  },
  [Monster.TheImmortalOfThunder]: healSelf(3000),
  [Monster.JigenBakudan]: (state, { otherDKey, ownMonsters, zoneCoords }) => {
    // destroy all monsters on your side of the field and inflict Direct Damage equal
    // to half of the total ATK of the destroyed cards, excluding this monster
    let totalAtk = 0;
    const [, , selfIdx] = zoneCoords;
    for (let i = 0; i < 5; i++) {
      const z = getZone(state, [...ownMonsters, i]) as MonsterZone;
      if (!isOccupied(z)) continue;
      if (i !== selfIdx) {
        totalAtk += z.effAtk;
      }
      destroyAtCoords(state, [...ownMonsters, i]);
    }
    burn(state, otherDKey, Math.round(totalAtk / 2));
  },
};
