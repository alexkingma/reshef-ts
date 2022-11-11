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
  activeField: Field;
  monsterZones: MonsterZone[];
  spellTrapZones: SpellTrapZone[];
}

interface DuelState {
  p1: DuellistDuelState;
  p2: DuellistDuelState;
  // whoseTurn: 1 | 2;
  // cursorPos: number;
}

type DuellistKey = keyof DuelState;
