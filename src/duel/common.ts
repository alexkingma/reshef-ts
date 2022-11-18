export enum BattlePosition {
  Attack = "ATTACK_POSITION",
  Defence = "DEFENCE_POSITION",
}

export enum Orientation {
  FaceDown = "FACE_DOWN",
  FaceUp = "FACE_UP",
}

export enum FieldRow {
  PlayerHand = 0,
  PlayerSpellTrap = 1,
  PlayerMonster = 2,
  OpponentMonster = 3,
  OpponentSpellTrap = 4,
  OpponentHand = 5,
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
