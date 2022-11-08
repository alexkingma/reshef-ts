enum MonsterPosition {
  Attack = "ATTACK_POSITION",
  Defence = "DEFENCE_POSITION",
}

enum CardVisibility {
  FaceDown = "FACE_DOWN",
  FaceUp = "FACE_UP",
}

interface Zone {
  card: Card | null;
  cardPos: CardVisibility;
}

type MonsterZone = Zone & {
  pos: MonsterPosition;
};

type Deck = Card[];

interface DuellistDuelState {
  lp: number;
  hand: Card[];
  deck: Deck;
  graveyard: CardName | null;
  activeField: Field;
  monsterZones: MonsterZone[];
  spellTrapZones: Zone[];
}

interface DuelState {
  p1: DuellistDuelState;
  p2: DuellistDuelState;
  // whoseTurn: 1 | 2;
  // cursorPos: number;
}
