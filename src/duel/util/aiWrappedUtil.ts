import { Field } from "../enums/duel";
import { Monster } from "../enums/monster";
import { Spell } from "../enums/spellTrapRitual";
import { getCard } from "./cardUtil";
import { getActiveField, isBuffedByField } from "./fieldUtil";
import { countMatchesInRow, hasMatchInRow } from "./rowUtil";
import { isValidSpellTarget } from "./targetedSpellUtil";

export const shouldUseField =
  (newField: Field) =>
  (state: Duel, { ownMonsters, otherMonsters }: Turn) => {
    const activeField = getActiveField(state);
    if (newField === activeField) return false;

    const isBuffed = (field: Field) => (z: OccupiedZone) => {
      const { type } = getCard(z.id) as MonsterCard;
      return isBuffedByField(type, field);
    };

    if (newField === Field.Arena) {
      // turn off field if opponent is benefiting and AI isn't
      return (
        hasMatchInRow(state, otherMonsters, isBuffed(activeField)) &&
        !hasMatchInRow(state, ownMonsters, isBuffed(activeField))
      );
    }

    // if proposed field isn't Arena, only need to see a benefit for self
    return hasMatchInRow(state, ownMonsters, isBuffed(newField));
  };

export const spellHasValidTarget =
  (spell: Spell) =>
  (state: Duel, { ownMonsters }: Turn) =>
    hasMatchInRow(state, ownMonsters, (z) => isValidSpellTarget(spell, z.id));

export const opponentHasSpellTrap =
  (condition?: (z: OccupiedZone) => boolean) =>
  (state: Duel, { otherSpellTrap }: Turn) =>
    hasMatchInRow(state, otherSpellTrap, condition);

export const onlyOpponentHasMonster =
  (condition?: (z: OccupiedZone) => boolean) =>
  (state: Duel, { ownMonsters, otherMonsters }: Turn) =>
    hasMatchInRow(state, otherMonsters, condition) &&
    !hasMatchInRow(state, ownMonsters, condition);

export const opponentHasMonster =
  (condition?: (z: OccupiedZone) => boolean) =>
  (state: Duel, { otherMonsters }: Turn) =>
    hasMatchInRow(state, otherMonsters, condition);

export const selfHasMonster =
  (condition?: (z: OccupiedZone) => boolean) =>
  (state: Duel, { ownMonsters }: Turn) =>
    hasMatchInRow(state, ownMonsters, condition);

export const selfHasSpecificMonster = (...monsters: Monster[]) =>
  selfHasMonster((z) => monsters.includes(z.id));

export const selfHasAllSpecificMonsters = (...monsters: Monster[]) =>
  selfHasMonster((z) => monsters.every((m) => m === z.id));

export const hasEmptyMonsterZones =
  (numFreeZones: number = 1) =>
  (state: Duel, { ownMonsters }: Turn) =>
    5 - countMatchesInRow(state, ownMonsters) >= numFreeZones;
