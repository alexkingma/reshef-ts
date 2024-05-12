import { Field } from "../enums/duel";
import { Monster } from "../enums/monster";
import { isOneOfAlignments } from "./cardAlignmentUtil";
import { isOneOfTypes } from "./cardTypeUtil";
import { draw as drawDirect } from "./deckUtil";
import { burn, heal } from "./duellistUtil";
import { setActiveField as setActiveFieldDirect } from "./fieldUtil";
import { destroyRow } from "./rowUtil";
import {
  isMinAtk,
  isSpecificMonster,
  permPowerUp as permPowerUpDirect,
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
  setActiveFieldDirect(state, state.activeTurn.dKey, newField);
};

export const destroyRows = (rowsToDestroy: RowCoords[]) => (state: Duel) => {
  rowsToDestroy.forEach((row) => destroyRow(state, row));
};

const destroyOppMonsters =
  (condition: (zone: OccupiedZone) => boolean) =>
  (state: Duel, { otherMonsters }: CoordsMap) => {
    destroyRow(state, otherMonsters, condition);
  };

export const destroy1500PlusAtk = () =>
  destroyOppMonsters((z) => isMinAtk(z, 1500));

export const destroyMonsterType = (type: CardType) =>
  destroyOppMonsters(isOneOfTypes(type));

export const destroyMonsterAlignment = (alignment: Alignment) =>
  destroyOppMonsters(isOneOfAlignments(alignment));

export const draw =
  (numCards: number = 1) =>
  (state: Duel, { dKey }: DuellistCoordsMap) => {
    drawDirect(state, dKey, numCards);
  };

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
