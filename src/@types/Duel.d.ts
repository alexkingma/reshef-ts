interface EmptyZone {
  isOccupied: false;
}

interface OccupiedZone {
  isOccupied: true;
  card: Card;
  orientation: Orientation;
}

type MonsterZone = EmptyZone | OccupiedMonsterZone;

type OccupiedMonsterZone = OccupiedZone & {
  card: MonsterCard;
  battlePosition: BattlePosition;
  powerUpLevel: number;
  hasAttacked: boolean;
};

type SpellTrapZone = EmptyZone | OccupiedSpellTrapZone;

type OccupiedSpellTrapZone = OccupiedZone & { card: SpellOrTrapOrRitualCard };

type HandZone = EmptyZone | OccupiedZone;

type Deck = Card[];

interface DuellistDuelState {
  lp: number;
  hand: HandZone[];
  deck: Deck;
  graveyard: CardName | null;
  monsterZones: MonsterZone[];
  spellTrapZones: SpellTrapZone[];
}

interface DuelState {
  p1: DuellistDuelState;
  p2: DuellistDuelState;
  activeTurn: Turn;
  activeField: Field;
  cursorPos: FieldCoords;
  // focusedCard: FieldCoords; // for multi-selection (X mon attacks Y mon, Spell A powers up Monster B, etc.)
}

interface Turn {
  duellistKey: DuellistKey;
  hasNormalSummoned: boolean;
  numTributedMonsters: number;
}

type FieldCol = 0 | 1 | 2 | 3 | 4;

type FieldCoords = [rowIdx: FieldRow, colIdx: FieldCol];

type DuellistKey = "p1" | "p2";
