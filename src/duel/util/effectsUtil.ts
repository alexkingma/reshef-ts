import {
  CardTextPrefix as Pre,
  EffectDialogueTag as Tag,
} from "../enums/dialogue";
import { Field, RowKey } from "../enums/duel";
import { Monster } from "../enums/monster";
import { Trap } from "../enums/spellTrapRitual";
import { always } from "./common";
import { setActiveField } from "./fieldUtil";
import {
  countMatchesInRow,
  destroyFirstFound,
  hasMatchInRow,
  rowContainsCard,
  setRowFaceDown,
  updateMonsters,
} from "./rowUtil";
import {
  burnOther,
  destroyMonsterType,
  healSelf,
  permPowerUp,
} from "./wrappedUtil";
import {
  clearZone,
  destroyAtCoords,
  directAttack,
  getOriginZone,
  isMonster,
  isNotGodCard,
  specialSummon,
  tempPowerUp,
} from "./zoneUtil";

export const effect_DarkMagicianGirl = () => {
  const isDarkMagician = (z: Zone) => {
    const cards = [Monster.DarkMagician, Monster.MagicianOfBlackChaos];
    return isMonster(z) && cards.includes(z.id);
  };

  return {
    row: RowKey.Monster,
    condition: (state: Duel, { ownGraveyard, otherGraveyard }: Turn) => {
      return (
        hasMatchInRow(state, ownGraveyard, isDarkMagician) ||
        hasMatchInRow(state, otherGraveyard, isDarkMagician)
      );
    },
    effect: (
      state: Duel,
      { originCoords, ownGraveyard, otherGraveyard }: Turn
    ) => {
      const count =
        countMatchesInRow(state, ownGraveyard, isDarkMagician) +
        countMatchesInRow(state, otherGraveyard, isDarkMagician);
      tempPowerUp(state, originCoords!, count * 500, count * 500);
    },
    text: `${Pre.Auto}Powered up for all Dark Magicians in graveyards.`,
  };
};

export const effect_CastleOfDarkIllusions = () => ({
  row: RowKey.Monster,
  condition: always,
  effect: (state: Duel, { dKey, ownMonsters }: Turn) => {
    setActiveField(state, dKey, Field.Yami);
    // TODO: don't set self face down, or does it not matter?
    setRowFaceDown(state, ownMonsters);
  },
  text: `${Pre.Auto}All monsters on the own field are turned face down.\nThe field is turned to darkness.`,
});

export const effect_LavaGolem_Summon = () => ({
  row: RowKey.Hand,
  condition: (state: Duel, { otherMonsters }: Turn) => {
    return countMatchesInRow(state, otherMonsters, isNotGodCard) >= 2;
  },
  effect: (state: Duel, { originCoords, otherDKey, otherMonsters }: Turn) => {
    // If this is in the own hand, it can be made to appear on
    // the enemy's field for two enemy monsters as tributes.
    destroyFirstFound(state, otherMonsters, isNotGodCard);
    destroyFirstFound(state, otherMonsters, isNotGodCard);
    specialSummon(state, otherDKey, Monster.LavaGolem);
    clearZone(state, originCoords!);
  },
  text: `${Pre.Auto}Emerged on the foe's field for two enemy tributes.`,
});

export const effect_SpiritMessage = () => ({
  row: RowKey.SpellTrap,
  text: `${Pre.SpiritMessage}Disappeared because Destiny Board is missing.`,
  condition: (state: Duel, { ownSpellTrap }: Turn) => {
    return !rowContainsCard(state, ownSpellTrap, Trap.DestinyBoard);
  },
  effect: (state: Duel, { originCoords }: Turn) => {
    // I/N/A/L letters require Destiny Board to also be
    // on the field or they auto-disappear
    clearZone(state, originCoords!);
  },
});

export const effect_PowerUpSelfFromOwnMonsters = (
  condition: (z: OccupiedZone) => boolean = always,
  atkPerMatch: number = 500,
  defPerMatch: number = 500
) => {
  return {
    row: RowKey.Monster,
    condition: (state: Duel, { ownMonsters }: Turn) => {
      return hasMatchInRow(state, ownMonsters, condition);
    },
    effect: (state: Duel, { originCoords, ownMonsters }: Turn) => {
      const count = countMatchesInRow(state, ownMonsters, condition);
      tempPowerUp(
        state,
        originCoords!,
        count * atkPerMatch,
        count * defPerMatch
      );
    },
  };
};

export const effect_UpdateOwnMonsters = (
  effect: (z: OccupiedMonsterZone) => void,
  condition: (z: OccupiedZone) => boolean = always
) => {
  return {
    row: RowKey.Monster,
    condition: (state: Duel, { ownMonsters }: Turn) => {
      return hasMatchInRow(state, ownMonsters, condition);
    },
    effect: (state: Duel, { ownMonsters }: Turn) => {
      updateMonsters(state, ownMonsters, effect, condition);
    },
  };
};

export const effect_UpdateOtherMonsters = (
  effect: (z: OccupiedMonsterZone) => void,
  condition: (z: OccupiedZone) => boolean = always
) => {
  return {
    row: RowKey.Monster,
    condition: (state: Duel, { otherMonsters }: Turn) => {
      return hasMatchInRow(state, otherMonsters, condition);
    },
    effect: (state: Duel, { otherMonsters }: Turn) => {
      updateMonsters(state, otherMonsters, effect, condition);
    },
  };
};

export const effect_TrapDestroyAttacker = (
  atkCondition: (z: OccupiedMonsterZone) => boolean
) => {
  return {
    row: RowKey.SpellTrap,
    condition: (state: Duel) => {
      const attackerZone = getOriginZone(state) as OccupiedMonsterZone;
      return atkCondition(attackerZone);
    },
    effect: (state: Duel) => {
      destroyAtCoords(state, state.activeTurn.originCoords!);
    },
    text: `${Pre.Trap}${Tag.OriginZone} will disappear.`,
  };
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

export const effect_DirectAttack = () => ({
  text: `${Pre.Manual}It will inflict LP damage equal to the attack power on the opponent directly.`,
  effect: (state: Duel, { originCoords }: Turn) => {
    directAttack(state, originCoords!);
  },
});
