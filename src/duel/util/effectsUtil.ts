import { Field, RowKey } from "../enums/duel";
import { Monster } from "../enums/monster";
import { setActiveField } from "./fieldUtil";
import {
  countMatchesInRow,
  destroyFirstFound,
  hasMatchInRow,
  setRowFaceDown,
} from "./rowUtil";
import {
  burnOther,
  destroyMonsterType,
  healSelf,
  permPowerUp,
} from "./wrappedUtil";
import {
  clearZone,
  isDarkMagician,
  isNotGodCard,
  specialSummon,
  tempPowerUp,
} from "./zoneUtil";

export const effCon_DarkMagicianGirl = {
  row: RowKey.Monster,
  condition: (state: Duel, { ownGraveyard, otherGraveyard }: ZoneCoordsMap) => {
    return (
      hasMatchInRow(state, ownGraveyard, isDarkMagician) ||
      hasMatchInRow(state, otherGraveyard, isDarkMagician)
    );
  },
  effect: (
    state: Duel,
    { zoneCoords, ownGraveyard, otherGraveyard }: ZoneCoordsMap
  ) => {
    const count =
      countMatchesInRow(state, ownGraveyard, isDarkMagician) +
      countMatchesInRow(state, otherGraveyard, isDarkMagician);
    tempPowerUp(state, zoneCoords, count * 500, count * 500);
  },
};

export const effect_CastleOfDarkIllusions = (
  state: Duel,
  { dKey, ownMonsters }: ZoneCoordsMap
) => {
  setActiveField(state, dKey, Field.Yami);
  // TODO: don't set self face down?
  setRowFaceDown(state, ownMonsters);
};

export const effConDi_LavaGolem_Summon = {
  condition: (state: Duel, { otherMonsters }: ZoneCoordsMap) => {
    return countMatchesInRow(state, otherMonsters, isNotGodCard) >= 2;
  },
  effect: (
    state: Duel,
    { zoneCoords, otherDKey, otherMonsters }: ZoneCoordsMap
  ) => {
    // If this is in the own hand, it can be made to appear on
    // the enemy's field for two enemy monsters as tributes.
    destroyFirstFound(state, otherMonsters, isNotGodCard);
    destroyFirstFound(state, otherMonsters, isNotGodCard);
    specialSummon(state, otherDKey, Monster.LavaGolem);
    clearZone(state, zoneCoords);
  },
  dialogue: "TODO",
};

export const effDi_BurnSpell = (amt: number) => ({
  dialogue: "TODO",
  effect: burnOther(amt),
});

export const effDi_HealSpell = (amt: number) => ({
  dialogue: "TODO",
  effect: healSelf(amt),
});

export const effDi_EquipSpell = () => ({
  dialogue: "TODO",
  effect: permPowerUp(),
});

export const effDi_TypeDestructionSpell = (type: CardType) => ({
  dialogue: "TODO",
  effect: destroyMonsterType(type),
});
