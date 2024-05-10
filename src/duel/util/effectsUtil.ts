import { CardTextPrefix as Pre } from "../enums/dialogue";
import { Field, RowKey } from "../enums/duel";
import { Monster } from "../enums/monster";
import { always } from "./common";
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
  directAttack,
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
  text: `${Pre.Auto}Powered up for all Dark Magicians in graveyards.`,
};

export const effect_CastleOfDarkIllusions = {
  row: RowKey.Monster,
  condition: always,
  effect: (state: Duel, { dKey, ownMonsters }: ZoneCoordsMap) => {
    setActiveField(state, dKey, Field.Yami);
    // TODO: don't set self face down, or does it not matter?
    setRowFaceDown(state, ownMonsters);
  },
  text: `${Pre.Auto}All monsters on the own field are turned face down.\nThe field is turned to darkness.`,
};

export const effect_LavaGolem_Summon = {
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
  text: `${Pre.Auto}Emerged on the foe's field for two enemy tributes.`,
};

export const effect_BurnSpell = (amt: number) => ({
  text: `${Pre.Manual}It will inflict ${amt}LP damage on the opponent.`,
  effect: burnOther(amt),
});

export const effect_HealSpell = (amt: number) => ({
  text: `${Pre.Manual}The player's LP will be restored by ${amt}.`,
  effect: healSelf(amt),
});

export const effect_EquipSpell = () => ({
  text: `${Pre.Manual}It powered up a monster.`,
  effect: permPowerUp(),
});

export const effect_TypeDestructionSpell = (type: CardType) => ({
  text: `${Pre.Manual}All ${type.toLowerCase()} on the foe's field will be destroyed.`,
  effect: destroyMonsterType(type),
});

export const effect_DirectAttack = {
  text: `${Pre.Manual}It will inflict LP damage equal to the attack power on the opponent directly.`,
  effect: directAttack,
};
