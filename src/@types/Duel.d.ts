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
  name: string;
  lp: number;
  hand: HandZone[];
  deck: Deck;
  graveyard: Graveyard;
  monsterZones: MonsterZone[];
  spellTrapZones: SpellTrapZone[];
}

interface DuelInteraction {
  // location of cursor; determines which card is being peeked/highlighted
  cursorCoords: ZoneCoords;

  // origin card in an action, e.g. attacking monster, originating spell, hand card to summon/set
  originCoords: ZoneCoords | null;

  // target card in an action, e.g. monster to be attacked, to be powered-up by a spell, zone to summon/set at
  targetCoords: ZoneCoords | null;

  // what style of movement/interactivity is the player currently permitted?
  mode: InteractionMode;

  // Some actions require multiple, discrete zone selections.
  // Store the deferred action here while the user selects the origin/target.
  // This also gives a chance to cancel out of the action before a target is selected.
  pendingAction: (() => void) | null;
}

interface Duel {
  p1: Duellist;
  p2: Duellist;
  activeTurn: Turn;
  activeField: Field;
  interaction: DuelInteraction;
}

interface Turn {
  duellistKey: DuellistKey;
  isStartOfTurn: boolean;
  hasNormalSummoned: boolean;
  numTributedMonsters: number;
}

type DuellistKey = "p1" | "p2";
type FieldCol = 0 | 1 | 2 | 3 | 4;
type RowKey = "hand" | "monsterZones" | "spellTrapZones";

type ZoneCoords = [dKey: DuellistKey, rowKey: RowKey, colIdx: FieldCol];
type ZoneCoordsForDuellist = OmitFirst<ZoneCoords>;
type RowCoords = OmitLast<ZoneCoords>;
