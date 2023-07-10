interface EmptyZone {
  isOccupied: false;
}

interface OccupiedZone<K extends CardName = CardName> {
  isOccupied: true;
  card: Card<K>;
  orientation: Orientation;
}

type Zone<K extends CardName = CardName> = EmptyZone | OccupiedZone<K>;

type MonsterZone = EmptyZone | OccupiedMonsterZone;

type OccupiedMonsterZone = Omit<OccupiedZone<MonsterName>, "card"> & {
  card: MonsterCard;
  battlePosition: BattlePosition;
  permPowerUpLevel: number; // lingers indefinitely
  tempPowerUpLevel: number; // reset and re-applied after every action
  isLocked: boolean;
};

type SpellTrapZone = EmptyZone | OccupiedSpellTrapZone;

type OccupiedSpellTrapZone = Omit<OccupiedZone<SpellTrapRitualName>, "card"> & {
  card: SpellTrapCard;
};

type HandZone = Zone;
type DeckZone = OccupiedZone;
type GraveyardZone = Zone<MonsterName>;
type FieldZone = Zone<FieldName>;

interface Duellist {
  name: string;
  lp: number;
  hand: HandZone[];
  deckTemplate: CardQuantityMap;
  deck: DeckZone[];
  graveyard: GraveyardZone[];
  monsterZones: MonsterZone[];
  spellTrapZones: SpellTrapZone[];
  fieldZone: FieldZone[];
  activeEffects: {
    sorlTurnsRemaining: 0 | 1 | 2 | 3;
    brainControlZones: ZoneCoords[];
  };
  status: DuellistStatus;
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
  config: DuelConfig;
  p1: Duellist;
  p2: Duellist;
  activeTurn: Turn;
  interaction: DuelInteraction;
}

interface DuelConfig {
  p1Type: PlayerType;
  p2Type: PlayerType;
  p1Name: DuellableName; // TODO: need a way to also enable random cards/decks?
  p2Name: DuellableName;
  computerDelayMs: number;
  totalDuelsToPlay: number;
  showDuelUI: boolean;
}

interface Turn {
  duellistKey: DuellistKey;
  isStartOfTurn: boolean;
  hasNormalSummoned: boolean;
  numTributedMonsters: number;
}

// recreate enums since they can't be imported in .d.ts files
type DuellistKey = "p1" | "p2";
type RowKey =
  | "hand"
  | "monsterZones"
  | "spellTrapZones"
  | "deck"
  | "graveyard"
  | "fieldZone";

type ZoneCoords = [dKey: DuellistKey, rowKey: RowKey, colIdx: number];
type ZoneCoordsForDuellist = OmitFirst<ZoneCoords>;
type RowCoords = OmitLast<ZoneCoords>;

type DuellistStatus =
  | "HEALTHY"
  | "OUT_OF_LP"
  | "DECK_OUT"
  | "SURRENDER" // unused for now
  | "EXODIA"
  | "DESTINY_BOARD";

type PlayerType = "HUMAN" | "COMPUTER";
