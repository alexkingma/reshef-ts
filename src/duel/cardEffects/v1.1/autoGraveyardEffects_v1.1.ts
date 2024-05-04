import { Monster } from "@/duel/common";
import { isInsect } from "@/duel/util/cardTypeUtil";
import { addToTopOfDeck } from "@/duel/util/deckUtil";
import { heal, isStartOfTurn } from "@/duel/util/duellistUtil";
import { clearGraveyard } from "@/duel/util/graveyardUtil";
import { getHighestAtkZoneIdx, hasEmptyZone } from "@/duel/util/rowUtil";
import { clearZone, getZone, specialSummon } from "@/duel/util/zoneUtil";

type GraveyardEffectReducer = (
  state: Duel,
  coordsMap: DuellistCoordsMap
) => void;

type GraveyardEffectReducers = {
  [key in Monster]?: (
    state: Duel,
    coordsMap: DuellistCoordsMap
  ) => {
    condition: () => boolean;
    effect: GraveyardEffectReducer;
  }[];
};

export const graveyardEffects: GraveyardEffectReducers = {
  [Monster.CockroachKnight]: () => {
    return [
      {
        condition: () => true,
        effect: (state, { dKey }) => {
          clearGraveyard(state, dKey);
          addToTopOfDeck(state, dKey, Monster.CockroachKnight);
        },
      },
    ];
  },
  [Monster.PinchHopper]: (state, { ownMonsters }) => {
    return [
      {
        condition: () => {
          return hasEmptyZone(state, ownMonsters);
        },
        effect: (state, { dKey, ownHand }) => {
          const handIdx = getHighestAtkZoneIdx(state, ownHand, isInsect);
          if (handIdx === -1) return; // no insect to summon
          const { card } = getZone(state, [
            ...ownHand,
            handIdx,
          ]) as OccupiedZone;
          specialSummon(state, dKey, card.id);
          clearZone(state, [...ownHand, handIdx]);
        },
      },
    ];
  },
  [Monster.Gernia]: (state, { ownMonsters, otherDKey }) => {
    return [
      {
        condition: () => {
          return (
            hasEmptyZone(state, ownMonsters) && isStartOfTurn(state, otherDKey)
          );
        },
        effect: (state, { dKey }) => {
          specialSummon(state, dKey, Monster.Gernia);
          clearGraveyard(state, dKey);
        },
      },
    ];
  },
  [Monster.SkullMarkLadyBug]: () => {
    return [
      {
        condition: () => true,
        effect: (state, { dKey }) => {
          heal(state, dKey, 1000);
          clearGraveyard(state, dKey);
        },
      },
    ];
  },
};
