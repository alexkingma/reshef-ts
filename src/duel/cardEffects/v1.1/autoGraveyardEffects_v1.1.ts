import { BattlePosition } from "@/duel/enums/duel";
import { Monster } from "@/duel/enums/monster";
import { isInsect } from "@/duel/util/cardTypeUtil";
import { always } from "@/duel/util/common";
import { addToTopOfDeck } from "@/duel/util/deckUtil";
import { burn, endTurn, heal, isStartOfTurn } from "@/duel/util/duellistUtil";
import { clearGraveyard } from "@/duel/util/graveyardUtil";
import {
  getHighestAtkZoneIdx,
  hasEmptyZone,
  hasMatchInRow,
} from "@/duel/util/rowUtil";
import {
  clearZone,
  convertMonster,
  getZone,
  specialSummon,
} from "@/duel/util/zoneUtil";

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
        condition: () => hasEmptyZone(state, ownMonsters),
        effect: (state, { dKey, ownHand }) => {
          const handIdx = getHighestAtkZoneIdx(state, ownHand, isInsect);
          if (handIdx === -1) return; // no insect to summon
          const z = getZone(state, [...ownHand, handIdx]) as OccupiedZone;
          specialSummon(state, dKey, z.id);
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
  [Monster.RevivalJam]: (state, { dKey }) => {
    return [
      {
        condition: () => isStartOfTurn(state, dKey),
        effect: (state, { dKey }) => {
          burn(state, dKey, 1000);
          specialSummon(state, dKey, Monster.RevivalJam, {
            battlePosition: BattlePosition.Defence,
          });
          clearGraveyard(state, dKey);
        },
      },
    ];
  },
  [Monster.MaskedBeastDesGardius]: (state, { otherMonsters }) => {
    return [
      {
        condition: () => hasMatchInRow(state, otherMonsters),
        effect: (state, { dKey }) => {
          convertMonster(state, dKey);
          clearGraveyard(state, dKey);
        },
      },
    ];
  },
  [Monster.TheImmortalOfThunder]: () => {
    return [
      {
        condition: always,
        effect: (state, { dKey }) => {
          burn(state, dKey, 5000);
          clearGraveyard(state, dKey);
        },
      },
    ];
  },
  [Monster.TheUnhappyMaiden]: () => {
    return [
      {
        condition: always,
        effect: (state, coordsMap) => {
          const { dKey } = coordsMap;
          endTurn(state, coordsMap);
          clearGraveyard(state, dKey);
        },
      },
    ];
  },
  [Monster.DarkNecrofear]: (state, { otherMonsters }) => {
    return [
      {
        condition: () => hasMatchInRow(state, otherMonsters),
        effect: (state, { dKey }) => {
          convertMonster(state, dKey);
          clearGraveyard(state, dKey);
        },
      },
    ];
  },
};
