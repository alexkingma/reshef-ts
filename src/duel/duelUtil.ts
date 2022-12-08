import cards from "../assets/cards";
import {
  BattlePosition,
  Field,
  Monster,
  Orientation,
  RowKey,
  Trap,
} from "./common";
import { ReducerArg } from "./duelSlice";

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

const getRandomCard = (): Card => {
  const dbCard = cards[Math.floor(Math.random() * cards.length)];
  return getCard(dbCard.name);
};

export const getInitialDuel = (
  cardQuantMap1: CardQuantityMap,
  cardQuantMap2: CardQuantityMap
): Duel => {
  return {
    p1: generateNewDuellist(cardQuantMap1),
    p2: generateNewDuellist(cardQuantMap2),
    activeTurn: {
      duellistKey: "p1",
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
    const isEffect = (c: Card) => c.category === "Monster" && c.effect;
    let cardName;
    do {
      cardName = getRandomCard().name;
    } while (cardName in map || !isEffect(getCard(cardName)));

    map[cardName] = quant;
  }

  return map;
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
  zones: Zone[],
  defaultToFirst: boolean = false
) => {
  const nextFreeZoneIdx = zones.findIndex((zone) => !zone.isOccupied);
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

export const getFirstOccupiedZoneIdx = (zones: Zone[]) => {
  return zones.findIndex((z) => z.isOccupied) as FieldCol | -1;
};

export const getHighestAtkZoneIdx = (
  zones: Zone[],
  condition: (z: OccupiedZone) => boolean = () => true
) => {
  let idx = -1;
  let highestAtk = -1;
  zones.forEach((z, i) => {
    if (!z.isOccupied || z.card.category !== "Monster" || !condition(z)) return;
    if (z.card.effAtk > highestAtk) {
      highestAtk = z.card.effAtk;
      idx = i;
    }
  });
  return idx as FieldCol | -1;
};

export const getFirstMatchInRowIdx = (zones: Zone[], cardName: CardName) => {
  return zones.findIndex((z) => z.isOccupied && z.card.name === cardName);
};

export const getOtherDuellistKey = (key: DuellistKey) => {
  return key === "p1" ? "p2" : "p1";
};

export const getNumTributesRequired = ({
  level,
}: MonsterCard): 0 | 1 | 2 | 3 => {
  return level >= 9 ? 3 : level >= 7 ? 2 : level >= 5 ? 1 : 0;
};

export const getNumCardsInRow = (row: Zone[]) => {
  return row.filter((z) => z.isOccupied).length;
};

export const containsCard = (row: Zone[], cardName: CardName) => {
  return hasMatchInRow(row, (z) => z.card.name === cardName);
};

export const containsAllCards = (row: Zone[], ...cardNames: CardName[]) => {
  // all provided cards must be present in the given row
  // alternatively: none of the provided cards may NOT be present
  return !cardNames.filter((c) => !containsCard(row, c)).length;
};

export const hasMatchInRow = (
  row: Zone[],
  condition: (z: OccupiedZone) => boolean
) => {
  return countMatchesInRow(row, condition) > 0;
};

export const countMatchesInRow = (
  row: Zone[],
  condition: (z: OccupiedZone) => boolean
) => {
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

export const isType = (z: Zone, type: CardType): z is OccupiedMonsterZone =>
  isMonster(z) && z.card.type === type;

export const isSpecificMonster = (
  z: Zone,
  cardName: CardName
): z is OccupiedMonsterZone => isMonster(z) && z.card.name === cardName;

export const getExodiaCards = () => {
  return [
    Monster.ExodiaTheForbiddenOne,
    Monster.LeftArmOfTheForbiddenOne,
    Monster.LeftLegOfTheForbiddenOne,
    Monster.RightArmOfTheForbiddenOne,
    Monster.RightLegOfTheForbiddenOne,
  ] as CardName[];
};

export const isVictor = ({ originatorState, targetState }: ReducerArg) => {
  // TODO: opponent deck-out flag
  return (
    targetState.lp === 0 ||
    hasFullExodia(originatorState.hand) ||
    hasFullFINAL(originatorState.spellTrapZones)
  );
};

export const hasFullExodia = (hand: HandZone[]) => {
  return containsAllCards(hand, ...getExodiaCards());
};

export const hasFullFINAL = (spellTrapRow: SpellTrapZone[]) => {
  return containsAllCards(
    spellTrapRow,
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

export const canActivateEffect = (z: OccupiedMonsterZone) =>
  !z.isLocked && z.card.effect && z.orientation === Orientation.FaceDown;
