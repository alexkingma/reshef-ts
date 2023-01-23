import { Field, Trap } from "../common";
import { draw as drawDirect } from "./deckUtil";
import { burn, heal } from "./duellistUtil";
import { setActiveField as setActiveFieldDirect } from "./fieldUtil";
import {
  countConditional,
  countMatchesInRow,
  destroyRow,
  getHighestAtkZoneIdx,
  getRow,
  rowContainsAnyCards,
  updateMonsters,
} from "./rowUtil";
import {
  clearZone,
  destroyAtCoords,
  getOriginZone,
  permPowerUp as permPowerUpDirect,
  tempPowerUp as tempPowerUpDirect,
} from "./zoneUtil";

export const burnOther =
  (amt: number) =>
  (state: Duel, { otherDKey }: CoordsMap) => {
    burn(state, otherDKey, amt);
  };

export const healSelf =
  (amt: number) =>
  (state: Duel, { dKey }: CoordsMap) => {
    heal(state, dKey, amt);
  };

export const permPowerUp =
  (levels: number = 1) =>
  (state: Duel) => {
    const { targetCoords } = state.interaction;
    permPowerUpDirect(state, targetCoords!, levels);
  };

export const setOwnField = (newField: Field) => (state: Duel) => {
  setActiveFieldDirect(state, state.activeTurn.duellistKey, newField);
};

export const destroyRows = (rowsToDestroy: RowCoords[]) => (state: Duel) => {
  rowsToDestroy.forEach((row) => destroyRow(state, row));
};

export const destroyHighestAtk =
  () =>
  (state: Duel, { otherMonsters }: CoordsMap) => {
    const monsterZones = getRow(state, otherMonsters) as MonsterZone[];
    if (!monsterZones.some((z) => z.isOccupied)) {
      // no monsters exist, destroy nothing
      return;
    }

    const coords = [
      ...otherMonsters,
      getHighestAtkZoneIdx(state, otherMonsters),
    ] as ZoneCoords;
    destroyAtCoords(state, coords);
  };

const destroyMonsterConditional =
  (condition: (c: MonsterCard) => boolean) =>
  (state: Duel, { otherMonsters }: CoordsMap) => {
    const monsterZones = getRow(state, otherMonsters) as MonsterZone[];
    const validColIdxs = monsterZones.reduce((validCols, z, idx) => {
      if (z.isOccupied && condition(z.card)) {
        return [...validCols, idx];
      }
      return validCols;
    }, [] as number[]);

    if (!validColIdxs.length) {
      // no applicable monsters exist, destroy nothing
      return;
    }

    const coords = validColIdxs.map((col) => [
      ...otherMonsters,
      col,
    ]) as ZoneCoords[];

    coords.forEach((coord) => destroyAtCoords(state, coord));
  };

export const destroy1500PlusAtk = () =>
  destroyMonsterConditional((card) => card.atk >= 1500);

export const destroyMonsterType = (type: CardType) =>
  destroyMonsterConditional((card) => card.type === type);

export const destroyMonsterAlignment = (alignment: Alignment) =>
  destroyMonsterConditional((card) => card.alignment === alignment);

export const draw =
  (numCards: number = 1) =>
  (state: Duel, { dKey }: DuellistCoordsMap) => {
    drawDirect(state, dKey, numCards);
  };

export const getEffCon_powerUpSelfConditional = (
  rowConditionPairs: (
    | [Duel, RowCoords, (z: Zone) => boolean]
    | [Duel, RowCoords, (z: Zone) => boolean, number]
  )[],
  graveyardConditionPairs: (
    | [Duel, DuellistKey, (c: MonsterCard) => boolean]
    | [Duel, DuellistKey, (c: MonsterCard) => boolean, number]
  )[] = []
) => {
  return {
    condition: () => {
      return countConditional(rowConditionPairs, graveyardConditionPairs) > 0;
    },
    effect: (state: Duel, { zoneCoords }: ZoneCoordsMap) => {
      const count = countConditional(
        rowConditionPairs,
        graveyardConditionPairs
      );
      tempPowerUpDirect(state, zoneCoords, count);
    },
  };
};

export const getEffCon_updateMatchesInRow = (
  state: Duel,
  coords: RowCoords,
  effect: (z: OccupiedMonsterZone) => void,
  condition: (z: OccupiedMonsterZone) => boolean = () => true
) => {
  return {
    condition: () => {
      return (
        countMatchesInRow(state, coords, (z) =>
          condition(z as OccupiedMonsterZone)
        ) > 0
      );
    },
    effect: () => {
      updateMonsters(state, coords, effect, condition);
    },
  };
};

export const trapDestroyAttacker =
  (atkCondition: (z: OccupiedMonsterZone) => boolean) => (state: Duel) => {
    return {
      condition: () => {
        const attackerZone = getOriginZone(state) as OccupiedMonsterZone;
        return atkCondition(attackerZone);
      },
      effect: () => {
        destroyAtCoords(state, state.interaction.originCoords!);
      },
    };
  };

export const getEffCon_requireDestinyBoard =
  () =>
  (state: Duel, { zoneCoords, ownSpellTrap }: ZoneCoordsMap) => {
    return [
      {
        condition: () => {
          return !rowContainsAnyCards(state, ownSpellTrap, Trap.DestinyBoard);
        },
        effect: () => {
          // I/N/A/L letters require Destiny Board to also be
          // on the field or they auto-disappear
          clearZone(state, zoneCoords);
        },
      },
    ];
  };
