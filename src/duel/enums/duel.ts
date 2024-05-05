export enum PlayerType {
  Human = "HUMAN",
  CPU = "CPU",
}

export enum BattlePosition {
  Attack = "ATTACK_POSITION",
  Defence = "DEFENCE_POSITION",
}

export enum Orientation {
  FaceDown = "FACE_DOWN",
  FaceUp = "FACE_UP",
}

export enum RowKey {
  Hand = "hand",
  SpellTrap = "spellTrapZones",
  Monster = "monsterZones",
  Deck = "deck",
  Graveyard = "graveyard",
  Field = "fieldZone",
}

export enum DuellistKey {
  Player = "p1",
  Opponent = "p2",
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
  Locked = "LOCKED", // cursor movement not allowed (animation playing, dialogue cued, opponent's turn)
  FreeMovement = "FREE_MOVEMENT", // default state during own turn
  ViewingOptions = "VIEWING_OPTIONS", // zone buttons/actions appear (attack, summon, discard)
  ChoosingOwnMonster = "CHOOSING_OWN_MONSTER", // select a monster to target/power-up with a spell
  ChoosingOwnMonsterZone = "CHOOSING_OWN_MONSTER_ZONE", // zone to summon at (empty or otherwise)
  ChoosingOwnSpellTrapZone = "CHOOSING_OWN_SPELL_TRAP_ZONE", // zone to set at (empty or otherwise)
  ChoosingOpponentMonster = "CHOOSING_OPPONENT_MONSTER", // monster to attack (non-direct attacks)
}

export enum DuellistStatus {
  HEALTHY = "HEALTHY",
  OUT_OF_LP = "OUT_OF_LP",
  DECK_OUT = "DECK_OUT",
  SURRENDER = "SURRENDER",
  EXODIA = "EXODIA",
  DESTINY_BOARD = "DESTINY_BOARD",
}
