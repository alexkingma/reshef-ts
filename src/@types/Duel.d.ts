type Zone = EmptyZone | OccupiedZone;

interface EmptyZone {
  isOccupied: false;
}

interface OccupiedZone {
  isOccupied: true;
  card: Card;
  orientation: Orientation;
}

type MonsterZone = EmptyZone | OccupiedMonsterZone;

type OccupiedMonsterZone = Omit<OccupiedZone, "card"> & {
  card: MonsterCard;
  battlePosition: BattlePosition;
  permPowerUpLevel: number; // lingers indefinitely
  tempPowerUpLevel: number; // reset and re-applied after every action
  isLocked: boolean;
};

type SpellTrapZone = EmptyZone | OccupiedSpellTrapZone;

type OccupiedSpellTrapZone = Omit<OccupiedZone, "card"> & {
  card: SpellOrTrapOrRitualCard;
};

type HandZone = EmptyZone | OccupiedZone;

type Deck = Card[];
type Graveyard = CardName | null;

interface Duellist {
  lp: number;
  hand: HandZone[];
  deck: Deck;
  graveyard: Graveyard;
  monsterZones: MonsterZone[];
  spellTrapZones: SpellTrapZone[];
}

interface Duel {
  p1: Duellist;
  p2: Duellist;
  activeTurn: Turn;
  activeField: Field;
  cursorPos: ZoneCoords;
  // focusedCard: FieldCoords; // for multi-selection (X mon attacks Y mon, Spell A powers up Monster B, etc.)
}

interface Turn {
  duellistKey: DuellistKey;
  hasNormalSummoned: boolean;
  numTributedMonsters: number;
}

type DuellistKey = "p1" | "p2";
type FieldCol = 0 | 1 | 2 | 3 | 4;
type RowKey = "hand" | "monsterZones" | "spellTrapZones";

type ZoneCoords = [dKey: DuellistKey, rowKey: RowKey, colIdx: FieldCol];
type ZoneCoordsForDuellist = OmitFirst<ZoneCoords>;
type RowCoords = OmitLast<ZoneCoords>;
