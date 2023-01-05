import cards from "../assets/cards";
import { recalcCombatStats } from "./combatUtil";
import {
  BattlePosition,
  Field,
  GraveyardEffectMonster,
  Monster,
  Orientation,
  PermAutoEffectMonster,
  RowKey,
  Trap,
} from "./common";
import { DuellistCoordsMap, StateMap, ZoneCoordsMap } from "./duelSlice";
import { monsterGraveyardEffectReducers } from "./monsterGraveyardEffectReducers";
import { monsterHandEffectReducers } from "./monsterHandEffectReducers";
import { monsterPermAutoEffectReducers } from "./monsterPermAutoEffectReducers";
import { MonsterAutoEffectReducer } from "./monsterTempPowerUpReducers";

export const getCard = (cardName: CardName): Card => {
  const dbCard = cards.find((c) => c.name === cardName)!;
  if (dbCard.category !== "Monster") {
    return dbCard;
  }
  return {
    ...dbCard,
    effAtk: dbCard.atk,
    effDef: dbCard.def,
  };
};

const getRandomCardName = (cardRules: Partial<Card> = {}): CardName => {
  const isMatch = (card: Card) => {
    return Object.entries(cardRules).every(
      ([key, val]) => card[key as keyof Card] === val
    );
  };

  let dbCard;
  do {
    dbCard = cards[Math.floor(Math.random() * cards.length)];
  } while (!isMatch(getCard(dbCard.name)));
  return dbCard.name;
};

export const getInitialDuel = (
  cardQuantMap1: CardQuantityMap,
  cardQuantMap2: CardQuantityMap
): Duel => {
  return {
    p1: randomiseDuellistState(cardQuantMap1),
    p2: randomiseDuellistState(cardQuantMap2),
    activeTurn: {
      duellistKey: "p1",
      isStartOfTurn: true,
      hasNormalSummoned: false,
      numTributedMonsters: 0,
    },
    activeField: Field.Arena,
    cursorPos: ["p1", RowKey.Hand, 0],
  };
};

export const getTempCardQuantMap = (): CardQuantityMap => {
  const map: CardQuantityMap = {};
  let numCardsRemaining = 40;
  while (numCardsRemaining > 0) {
    const quant = 1;
    numCardsRemaining -= quant;

    // don't overwrite existing cards in the map
    let cardName;
    do {
      cardName = getRandomCardName({ effect: true });
    } while (cardName in map);

    map[cardName] = quant;
  }

  return map;
};

export const randomiseDuellistState = (cardMap: CardQuantityMap): Duellist => {
  const rand = () => Math.random() > 0.5;
  const deck = initialiseDeck(cardMap);
  return {
    lp: Math.ceil(Math.random() * 8) * 1000,
    hand: deck.splice(0, 5).map((card) =>
      rand()
        ? { isOccupied: false }
        : {
            isOccupied: true,
            card,
            orientation: Orientation.FaceDown,
          }
    ),
    deck: deck.slice(0, Math.floor(Math.random() * 35)),
    graveyard: getRandomCardName({ category: "Monster" }),
    monsterZones: Array.from({ length: 5 }).map(() =>
      rand()
        ? { isOccupied: false }
        : {
            ...generateOccupiedMonsterZone(getRandomCardName({ effect: true })),
            battlePosition: rand()
              ? BattlePosition.Attack
              : BattlePosition.Defence,
            orientation: rand() ? Orientation.FaceDown : Orientation.FaceUp,
          }
    ),
    spellTrapZones: Array.from({ length: 5 }).map(() =>
      rand()
        ? { isOccupied: false }
        : {
            isOccupied: true,
            orientation: rand() ? Orientation.FaceDown : Orientation.FaceUp,
            card: getCard(
              getRandomCardName({ category: rand() ? "Trap" : "Magic" })
            ) as SpellOrTrapOrRitualCard,
          }
    ),
  };
};

export const generateNewDuellist = (cardMap: CardQuantityMap): Duellist => {
  const deck = initialiseDeck(cardMap);
  return {
    lp: 8000,
    hand: deck.splice(0, 5).map((card) => ({
      isOccupied: true,
      card,
      orientation: Orientation.FaceDown,
    })),
    deck: deck,
    graveyard: null,
    monsterZones: Array.from({ length: 5 }).map(() => ({ isOccupied: false })),
    spellTrapZones: Array.from({ length: 5 }).map(() => ({
      isOccupied: false,
    })),
  };
};

export const initialiseDeck = (cardQuantMap: CardQuantityMap): Deck => {
  const deck = Object.entries(cardQuantMap).reduce((deck, [cardName, qty]) => {
    const card = getCard(cardName as CardName);
    const cards: Card[] = Array.from({ length: qty });
    cards.fill(card);
    deck.push(...cards);
    return deck;
  }, [] as Deck);
  return shuffle(deck);
};

export const shuffle = <T extends any[]>(arr: T): T => {
  let currentIdx = arr.length;
  let randomIdx;
  while (currentIdx != 0) {
    randomIdx = Math.floor(Math.random() * currentIdx--);
    [arr[currentIdx], arr[randomIdx]] = [arr[randomIdx], arr[currentIdx]];
  }
  return arr;
};

export const getFirstEmptyZoneIdx = (
  state: Duel,
  [dKey, rKey]: RowCoords,
  defaultToFirst: boolean = false
) => {
  const row = state[dKey][rKey];
  const nextFreeZoneIdx = row.findIndex((zone) => !zone.isOccupied);
  if (nextFreeZoneIdx !== -1) return nextFreeZoneIdx as FieldCol;
  if (defaultToFirst) {
    // no free zones, return the default index
    return 0;
  } else {
    // sometimes we want to know that no zones are available, but not return a default
    throw new Error(
      "No free zones found, catch this error to implement custom logic."
    );
  }
};
export const hasEmptyZone = (state: Duel, rowCoords: RowCoords) => {
  try {
    getFirstEmptyZoneIdx(state, rowCoords);
    return true;
  } catch (e) {
    // no free space to summon
    return false;
  }
};

export const getFirstOccupiedZoneIdx = (
  state: Duel,
  [dKey, rKey]: RowCoords,
  condition: (z: OccupiedZone) => boolean = () => true
) => {
  const zone = state[dKey][rKey];
  return zone.findIndex((z) => z.isOccupied && condition(z)) as FieldCol | -1;
};

export const getHighestAtkZoneIdx = (
  state: Duel,
  [dKey, rKey]: RowCoords,
  condition: (z: OccupiedZone) => boolean = () => true
) => {
  let idx = -1;
  let highestAtk = -1;
  state[dKey][rKey].forEach((z, i) => {
    if (!z.isOccupied || z.card.category !== "Monster" || !condition(z)) return;
    if (z.card.effAtk > highestAtk) {
      highestAtk = z.card.effAtk;
      idx = i;
    }
  });
  return idx as FieldCol | -1;
};

export const getFirstMatchInRowIdx = (
  state: Duel,
  [dKey, rKey]: RowCoords,
  cardName: CardName
) => {
  const row = state[dKey][rKey];
  return row.findIndex((z) => z.isOccupied && z.card.name === cardName);
};

export const getOtherDuellistKey = (key: DuellistKey) => {
  return key === "p1" ? "p2" : "p1";
};

export const getStateMap = (
  state: Duel,
  duellistKey: DuellistKey
): StateMap => {
  const originatorState = state[duellistKey];
  const targetState = state[getOtherDuellistKey(duellistKey)];
  return {
    state, // only use when other props cannot be lastingly referenced in reducer
    originatorState,
    targetState,
    activeTurn: state.activeTurn,
    activeField: state.activeField,
  };
};

export const getZoneCoordsMap = (zoneCoords: ZoneCoords): ZoneCoordsMap => {
  const [dKey, , colIdx] = zoneCoords;
  return {
    zoneCoords,
    colIdx,
    ...getDuellistCoordsMap(dKey),
  };
};

export const getDuellistCoordsMap = (dKey: DuellistKey): DuellistCoordsMap => {
  const otherDKey = getOtherDuellistKey(dKey) as DuellistKey;
  return {
    dKey,
    otherDKey,

    // own rows
    ownMonsters: [dKey, RowKey.Monster],
    ownSpellTrap: [dKey, RowKey.SpellTrap],
    ownHand: [dKey, RowKey.Hand],

    // opponent rows
    otherMonsters: [otherDKey, RowKey.Monster],
    otherSpellTrap: [otherDKey, RowKey.SpellTrap],
    otherHand: [otherDKey, RowKey.Hand],
  };
};

export const isOwnTurn = (state: Duel, dKey: DuellistKey) => {
  return state.activeTurn.duellistKey === dKey;
};

export const isStartOfTurn = (state: Duel, dKey: DuellistKey) => {
  return state.activeTurn.isStartOfTurn && isOwnTurn(state, dKey);
};

export const isStartOfEitherTurn = (state: Duel) => {
  return state.activeTurn.isStartOfTurn;
};

export const getNumTributesRequired = ({
  level,
}: MonsterCard): 0 | 1 | 2 | 3 => {
  return level >= 9 ? 3 : level >= 7 ? 2 : level >= 5 ? 1 : 0;
};

export const containsAnyCards = (
  state: Duel,
  rowCoords: RowCoords,
  ...cardNames: CardName[]
) => {
  return cardNames.some((c) =>
    hasMatchInRow(state, rowCoords, (z) => z.card.name === c)
  );
};

export const containsAllCards = (
  state: Duel,
  rowCoords: RowCoords,
  ...cardNames: CardName[]
) => {
  // all provided cards must be present in the given row
  // alternatively: none of the provided cards may NOT be present
  return cardNames.every((c) => containsAnyCards(state, rowCoords, c));
};

export const graveyardContainsCards = (
  state: Duel,
  dKey: DuellistKey,
  ...cardNames: CardName[]
) => {
  if (!state[dKey].graveyard) return false; // graveyard is empty
  return cardNames.some((c) => c === state[dKey].graveyard);
};

export const hasMatchInRow = (
  state: Duel,
  rowCoords: RowCoords,
  condition: (z: OccupiedZone) => boolean = () => true
) => {
  return countMatchesInRow(state, rowCoords, condition) > 0;
};

export const countMatchesInRow = (
  state: Duel,
  [dKey, rKey]: RowCoords,
  condition: (z: OccupiedZone) => boolean = () => true
) => {
  const row = state[dKey][rKey];
  return row.filter((z) => z.isOccupied && condition(z)).length;
};

export const generateOccupiedMonsterZone = (
  cardName: CardName
): OccupiedMonsterZone => ({
  // use this to avoid boilerplate elsewhere
  isOccupied: true,
  card: getCard(cardName) as MonsterCard,
  battlePosition: BattlePosition.Attack,
  orientation: Orientation.FaceUp,
  isLocked: false,
  permPowerUpLevel: 0,
  tempPowerUpLevel: 0,
});

export const isTrap = (z: Zone): z is OccupiedSpellTrapZone => {
  return z.isOccupied && z.card.category === "Trap";
};

export const isSpell = (z: Zone): z is OccupiedSpellTrapZone => {
  return z.isOccupied && z.card.category === "Magic";
};

export const isMonster = (z: Zone): z is OccupiedMonsterZone => {
  return z.isOccupied && z.card.category === "Monster";
};

export const isDefMode = (z: Zone): z is OccupiedMonsterZone => {
  return isMonster(z) && z.battlePosition === BattlePosition.Defence;
};

export const isType = (z: Zone, type: CardType): z is OccupiedMonsterZone =>
  isMonster(z) && z.card.type === type;

export const isAlignment = (
  z: Zone,
  alignment: Alignment
): z is OccupiedMonsterZone => isMonster(z) && z.card.alignment === alignment;

export const isSpecificMonster = (
  z: Zone,
  cardName: CardName
): z is OccupiedMonsterZone => isMonster(z) && z.card.name === cardName;

const isOrientation = (z: Zone, o: Orientation): z is OccupiedMonsterZone =>
  z.isOccupied && z.orientation === o;

export const isFaceDown = (z: OccupiedZone) =>
  isOrientation(z, Orientation.FaceDown);

export const isFaceUp = (z: OccupiedZone) =>
  isOrientation(z, Orientation.FaceUp);

export const getExodiaCards = () => {
  return [
    Monster.ExodiaTheForbiddenOne,
    Monster.LeftArmOfTheForbiddenOne,
    Monster.LeftLegOfTheForbiddenOne,
    Monster.RightArmOfTheForbiddenOne,
    Monster.RightLegOfTheForbiddenOne,
  ] as CardName[];
};

export const isVictor = (state: Duel) => {
  // TODO: opponent deck-out flag
  // return (
  //   targetState.lp === 0 ||
  //   hasFullExodia(originatorState.hand) ||
  //   hasFullFINAL(originatorState.spellTrapZones)
  // );
};

export const hasFullExodia = (state: Duel, rowCoords: RowCoords) => {
  return containsAllCards(state, rowCoords, ...getExodiaCards());
};

export const hasFullFINAL = (state: Duel, rowCoords: RowCoords) => {
  return containsAllCards(
    state,
    rowCoords,
    Trap.DestinyBoard,
    Trap.SpiritMessageI,
    Trap.SpiritMessageN,
    Trap.SpiritMessageA,
    Trap.SpiritMessageL
  );
};

export const getZone = (state: Duel, [dKey, rKey, col]: ZoneCoords) => {
  return state[dKey][rKey][col];
};

export const getRow = (state: Duel, [dKey, rKey]: RowCoords) => {
  return state[dKey][rKey];
};

export const canActivateEffect = (z: OccupiedMonsterZone) =>
  !z.isLocked && z.card.effect && z.orientation === Orientation.FaceDown;

export const activateTempEffect = (
  stateMap: StateMap,
  coordsMap: ZoneCoordsMap,
  reducer: MonsterAutoEffectReducer
) => {
  const { state } = stateMap;
  const { zoneCoords } = coordsMap;
  const originalZone = getZone(state, zoneCoords) as OccupiedMonsterZone;
  const originalCardName = originalZone.card.name;

  const conEffectPairs = reducer(stateMap, coordsMap);
  conEffectPairs.forEach(({ condition, effect }) => {
    if (condition()) {
      effect(stateMap, coordsMap);

      // See postDirectMonsterAction() for context on this check.
      // Auto effects are slightly different since they don't lock
      // or change battle position, but the reasoning is the same.
      if (isSpecificMonster(originalZone, originalCardName)) {
        originalZone.orientation = Orientation.FaceUp;
      }
    }
  });
};

export const checkGraveyardEffect = (stateMap: StateMap, dKey: DuellistKey) => {
  const { graveyard } = stateMap.state[dKey];
  if (!graveyard) return;
  const reducer =
    monsterGraveyardEffectReducers[graveyard as GraveyardEffectMonster];
  if (!reducer) return;

  const conEffectPairs = reducer(stateMap, getDuellistCoordsMap(dKey));
  conEffectPairs.forEach(({ condition, effect }) => {
    if (condition()) {
      effect(stateMap, getDuellistCoordsMap(dKey));
    }
  });
};

export const checkMonsterAutoEffect = (
  stateMap: StateMap,
  coordsMap: ZoneCoordsMap,
  reducerMap: {
    [cardName in CardName]?: any;
  }
) => {
  const { state } = stateMap;
  const { zoneCoords } = coordsMap;
  const zone = getZone(state, zoneCoords);
  if (!zone.isOccupied) return;
  const reducer = reducerMap[zone.card.name as PermAutoEffectMonster];
  if (!reducer) return;

  activateTempEffect(stateMap, coordsMap, reducer);
};

export const checkPermAutoEffects = (stateMap: StateMap) => {
  const { state, activeTurn } = stateMap;

  const dKey = activeTurn.duellistKey;
  const otherDKey = getOtherDuellistKey(dKey);
  const originatorState = state[dKey];
  const targetState = state[otherDKey];

  checkGraveyardEffect(stateMap, dKey);
  checkGraveyardEffect(stateMap, otherDKey);

  originatorState.monsterZones.forEach((_, i) => {
    checkMonsterAutoEffect(
      stateMap,
      getZoneCoordsMap([dKey, RowKey.Monster, i as FieldCol]),
      monsterPermAutoEffectReducers
    );
  });

  targetState.monsterZones.forEach((_, i) => {
    checkMonsterAutoEffect(
      stateMap,
      getZoneCoordsMap([otherDKey, RowKey.Monster, i as FieldCol]),
      monsterPermAutoEffectReducers
    );
  });

  // TODO: spell/trap zones (DCJ, MoP, ... are there more?)

  originatorState.hand.forEach((_, i) => {
    checkMonsterAutoEffect(
      stateMap,
      getZoneCoordsMap([dKey, RowKey.Hand, i as FieldCol]),
      monsterHandEffectReducers
    );
  });

  targetState.hand.forEach((_, i) => {
    checkMonsterAutoEffect(
      stateMap,
      getZoneCoordsMap([otherDKey, RowKey.Hand, i as FieldCol]),
      monsterHandEffectReducers
    );
  });
};

export const checkAutoEffects = (stateMap: StateMap) => {
  // Temp power-up effect cards are separate from
  // permanent (but still auto) effect cards.
  // Temp power-ups must be calculated so that the permanent
  // effects may accurately deduce the "strongest" card, etc.
  // Then, once permanent effects (destruction, spec. summoning, etc.)
  // are complete, temp power-ups should be recalculated one final time.
  recalcCombatStats(stateMap);
  checkPermAutoEffects(stateMap);
  recalcCombatStats(stateMap);
};

export const postDirectMonsterAction = (
  state: Duel,
  zoneCoords: ZoneCoords,
  originalCardName: CardName
) => {
  // After attacking or manually activating an effect,
  // that monster should be flipped/locked, etc.

  // The exception is if the monster has destroyed/replaced itself
  // (e.g. special summoning another monster in its place).
  const zonePostAction = getZone(state, zoneCoords);
  if (!isSpecificMonster(zonePostAction, originalCardName)) return;

  zonePostAction.battlePosition = BattlePosition.Attack;
  zonePostAction.orientation = Orientation.FaceUp;
  zonePostAction.isLocked = true;
};
