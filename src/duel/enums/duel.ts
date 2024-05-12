export enum PlayerType {
  Human = "HUMAN",
  CPU = "CPU",
}

export enum BattlePosition {
  Attack,
  Defence,
}

export enum Orientation {
  FaceDown,
  FaceUp,
}

export enum RowKey {
  Hand = "hand",
  SpellTrap = "spellTrapZones",
  Monster = "monsterZones",
  Deck = "deck",
  Graveyard = "graveyard",
  Field = "fieldZone",
}

// Duellist Key
export enum DKey {
  Player = 0,
  Opponent = 1,
}

export enum Field {
  Arena = "Arena",
  Yami = "Yami",
  Wasteland = "Wasteland",
  Mountain = "Mountain",
  Sogen = "Sogen",
  Umi = "Umi",
  Forest = "Forest",
}

export enum InteractionMode {
  Locked, // cursor movement not allowed (animation playing, dialogue cued, opponent's turn)
  FreeMovement, // default state during own turn
  ViewingOptions, // zone buttons/actions appear (attack, summon, discard)
  ChoosingOwnMonster, // select a monster to target/power-up with a spell
  ChoosingOwnMonsterZone, // zone to summon at (empty or otherwise)
  ChoosingOwnSpellTrapZone, // zone to set at (empty or otherwise)
  ChoosingOpponentMonster, // monster to attack (non-direct attacks)
}

// Duellist Status
export enum DStatus {
  HEALTHY,
  OUT_OF_LP,
  DECK_OUT,
  SURRENDER,
  EXODIA,
  DESTINY_BOARD,
}
