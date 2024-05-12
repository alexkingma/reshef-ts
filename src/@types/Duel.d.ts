type EmptyZone = { id: 0 };
type OccupiedZone = {
  id: Exclude<number, 0>; // resolves as just "number", unfortunately
  orientation: Orientation;
};
type Zone = EmptyZone | OccupiedZone;

type OccupiedMonsterZone = OccupiedZone & {
  battlePosition: BattlePosition;
  isLocked: boolean;

  // lingers indefinitely
  permPowerUpAtk: number;
  permPowerUpDef: number;

  // reset and re-applied after every action
  tempPowerUpAtk: number;
  tempPowerUpDef: number;

  // effective final stats, recomputed after every action
  effAtk: number;
  effDef: number;
};

type MonsterZone = EmptyZone | OccupiedMonsterZone;
type SpellTrapZone = EmptyZone | OccupiedSpellTrapZone;
type OccupiedSpellTrapZone = OccupiedZone;
type HandZone = Zone;
type DeckZone = OccupiedZone;
type GraveyardZone = Zone;
type FieldZone = Zone;

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
    convertedZones: ZoneCoords[];
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
  duellists: [p1: Duellist, p2: Duellist];
  activeTurn: Turn;
  interaction: DuelInteraction;
}

interface DuelConfig {
  p1Type: PlayerType;
  p2Type: PlayerType;
  p1Name: DuellableName; // TODO: need a way to also enable random cards/decks?
  p2Name: DuellableName;
  cpuDelayMs: number;
  totalDuelsToPlay: number;
  showDuelUI: boolean;
}

interface Turn {
  dKey: number;
  isStartOfTurn: boolean;
  hasNormalSummoned: boolean;
  numTributedMonsters: number;
}

// recreate enums since they can't be imported in .d.ts files
type RowKey =
  | "hand"
  | "monsterZones"
  | "spellTrapZones"
  | "deck"
  | "graveyard"
  | "fieldZone";

type ZoneCoords = [dKey: number, rowKey: RowKey, colIdx: number];
type ZoneCoordsForDuellist = OmitFirst<ZoneCoords>;
type RowCoords = OmitLast<ZoneCoords>;

type DuellistStatus = number;

type PlayerType = "HUMAN" | "CPU";
