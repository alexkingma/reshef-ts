import { Field, RowKey } from "../enums/duel";
import { Monster } from "../enums/monster";
import { Trap } from "../enums/spellTrapRitual";
import { isOneOfAlignments } from "./cardAlignmentUtil";
import { isOneOfTypes } from "./cardTypeUtil";
import { always } from "./common";
import { draw as drawDirect } from "./deckUtil";
import { burn, heal } from "./duellistUtil";
import { setActiveField as setActiveFieldDirect } from "./fieldUtil";
import {
  countMatchesInRow,
  destroyRow,
  getHighestAtkZoneIdx,
  getRow,
  hasMatchInRow,
  rowContainsAnyCards,
  updateMonsters,
} from "./rowUtil";
import {
  clearZone,
  destroyAtCoords,
  directAttack as directAttackDirect,
  getOriginZone,
  isMinAtk,
  isNotGodCard,
  isOccupied,
  isSpecificMonster,
  permPowerUp as permPowerUpDirect,
  tempPowerUp as tempPowerUpDirect,
} from "./zoneUtil";

export const burnOther =
  (amt: number) =>
  (state: Duel, { otherDKey }: CoordsMap) => {
    burn(state, otherDKey, amt);
  };

export const burnSelf =
  (amt: number) =>
  (state: Duel, { dKey }: CoordsMap) => {
    burn(state, dKey, amt);
  };

export const healSelf =
  (amt: number) =>
  (state: Duel, { dKey }: CoordsMap) => {
    heal(state, dKey, amt);
  };

export const permPowerUp =
  (atk: number = 500, def: number = 500) =>
  (state: Duel) => {
    const { targetCoords } = state.interaction;
    permPowerUpDirect(state, targetCoords!, atk, def);
  };

export const setOwnField = (newField: Field) => (state: Duel) => {
  setActiveFieldDirect(state, state.activeTurn.duellistKey, newField);
};

export const destroyRows = (rowsToDestroy: RowCoords[]) => (state: Duel) => {
  rowsToDestroy.forEach((row) => destroyRow(state, row));
};

export const directAttack = (state: Duel, { zoneCoords }: ZoneCoordsMap) => {
  directAttackDirect(state, zoneCoords);
};

export const destroyHighestAtk =
  () =>
  (state: Duel, { otherMonsters }: CoordsMap) => {
    const monsterZones = getRow(state, otherMonsters) as MonsterZone[];
    if (!monsterZones.some(isNotGodCard)) {
      // no destroyable monsters exist, destroy nothing
      return;
    }

    const coords = [
      ...otherMonsters,
      getHighestAtkZoneIdx(state, otherMonsters, isNotGodCard),
    ] as ZoneCoords;
    destroyAtCoords(state, coords);
  };

const destroyMonsterConditional =
  (condition: (zone: OccupiedMonsterZone) => boolean) =>
  (state: Duel, { otherMonsters }: CoordsMap) => {
    const monsterZones = getRow(state, otherMonsters) as MonsterZone[];
    const validColIdxs = monsterZones.reduce((validCols, z, idx) => {
      if (isOccupied(z) && condition(z)) {
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
  destroyMonsterConditional((z) => isMinAtk(z, 1500));

export const destroyMonsterType = (type: CardType) =>
  destroyMonsterConditional(isOneOfTypes(type));

export const destroyMonsterAlignment = (alignment: Alignment) =>
  destroyMonsterConditional(isOneOfAlignments(alignment));

export const draw =
  (numCards: number = 1) =>
  (state: Duel, { dKey }: DuellistCoordsMap) => {
    drawDirect(state, dKey, numCards);
  };

export const getEffCon_powerUpSelfFromOwnMonsters = (
  condition: (z: OccupiedZone) => boolean = always,
  atkPerMatch: number = 500,
  defPerMatch: number = 500
) => {
  return {
    row: RowKey.Monster,
    condition: (state: Duel, { ownMonsters }: ZoneCoordsMap) => {
      return hasMatchInRow(state, ownMonsters, condition);
    },
    effect: (state: Duel, { zoneCoords, ownMonsters }: ZoneCoordsMap) => {
      const count = countMatchesInRow(state, ownMonsters, condition);
      tempPowerUpDirect(
        state,
        zoneCoords,
        count * atkPerMatch,
        count * defPerMatch
      );
    },
  };
};

export const getEffCon_updateOwnMonsters = (
  effect: (z: OccupiedMonsterZone) => void,
  condition: (z: OccupiedZone) => boolean = always
) => {
  return {
    row: RowKey.Monster,
    condition: (state: Duel, { ownMonsters }: ZoneCoordsMap) => {
      return hasMatchInRow(state, ownMonsters, condition);
    },
    effect: (state: Duel, { ownMonsters }: ZoneCoordsMap) => {
      updateMonsters(state, ownMonsters, effect, condition);
    },
  };
};

export const getEffCon_updateOtherMonsters = (
  effect: (z: OccupiedMonsterZone) => void,
  condition: (z: OccupiedZone) => boolean = always
) => {
  return {
    row: RowKey.Monster,
    condition: (state: Duel, { otherMonsters }: ZoneCoordsMap) => {
      return hasMatchInRow(state, otherMonsters, condition);
    },
    effect: (state: Duel, { otherMonsters }: ZoneCoordsMap) => {
      updateMonsters(state, otherMonsters, effect, condition);
    },
  };
};

export const getEffCon_trapDestroyAttacker = (
  atkCondition: (z: OccupiedMonsterZone) => boolean
) => {
  return {
    row: RowKey.SpellTrap,
    condition: (state: Duel) => {
      const attackerZone = getOriginZone(state) as OccupiedMonsterZone;
      return atkCondition(attackerZone);
    },
    effect: (state: Duel) => {
      destroyAtCoords(state, state.interaction.originCoords!);
    },
  };
};

export const getEffCon_requireDestinyBoard = (): AutoEffectReducer => ({
  row: RowKey.SpellTrap,
  dialogue: "TODO",
  condition: (state: Duel, { ownSpellTrap }: ZoneCoordsMap) => {
    return !rowContainsAnyCards(state, ownSpellTrap, Trap.DestinyBoard);
  },
  effect: (state: Duel, { zoneCoords }: ZoneCoordsMap) => {
    // I/N/A/L letters require Destiny Board to also be
    // on the field or they auto-disappear
    clearZone(state, zoneCoords);
  },
});

export const tempDown =
  (atk: number, def: number) => (z: OccupiedMonsterZone) => {
    z.tempPowerUpAtk -= atk;
    z.tempPowerUpDef -= def;
  };

export const tempUp =
  (atk: number, def: number) => (z: OccupiedMonsterZone) => {
    z.tempPowerUpAtk += atk;
    z.tempPowerUpDef += def;
  };

export const isMon = (mon: Monster) => (z: Zone) => isSpecificMonster(z, mon);

export const isAnyOfMons =
  (...mons: Monster[]) =>
  (z: Zone) =>
    mons.some((mon) => isMon(mon)(z));
