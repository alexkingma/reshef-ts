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

  // If an action requires two selections (origin and target), store the first here.
  // This is only used for UI purposes, to highlight the pending zone.
  // See originCoords and targetCoords on `Turn` for more actionable effect props.
  pendingCoords: ZoneCoords | null;

  // what style of movement/interactivity is the player currently permitted?
  mode: InteractionMode;
}

interface Duel {
  config: DuelConfig;
  duellists: [p1: Duellist, p2: Duellist];
  interaction: DuelInteraction;
  activeTurn: Turn;
}

interface DuelConfig {
  duelType: DuelType;
  p1Type: PlayerType;
  p2Type: PlayerType;
  p1Name: DuellableName;
  p2Name: DuellableName;
  cpuDelayMs: number;
  totalDuelsToPlay: number;
  showDuelUI: boolean;
}

interface Turn {
  // active/inactive duellists
  dKey: DuellistKey;
  otherDKey: DuellistKey;

  // the zones instigating/being targeted by an effect
  originCoords: ZoneCoords | null;
  targetCoords: ZoneCoords | null;

  // own rows
  ownMonsters: RowCoords;
  ownSpellTrap: RowCoords;
  ownHand: RowCoords;
  ownGraveyard: RowCoords;

  // opponent rows
  otherMonsters: RowCoords;
  otherSpellTrap: RowCoords;
  otherHand: RowCoords;
  otherGraveyard: RowCoords;

  // other/assorted turn props
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

type DuelType = "Exhibition" | "Simulation";
