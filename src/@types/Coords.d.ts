interface DuellistCoordsMap {
  dKey: DuellistKey;
  otherDKey: DuellistKey;

  // own rows
  ownMonsters: RowCoords;
  ownSpellTrap: RowCoords;
  ownHand: RowCoords;

  // opponent rows
  otherMonsters: RowCoords;
  otherSpellTrap: RowCoords;
  otherHand: RowCoords;
}

type ZoneCoordsMap = DuellistCoordsMap & {
  zoneCoords: ZoneCoords;
  colIdx: FieldCol;
};

type CoordsMap = ZoneCoordsMap | DuellistCoordsMap;
