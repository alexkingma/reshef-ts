interface DuellistCoordsMap {
  dKey: DuellistKey;
  otherDKey: DuellistKey;

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
}

type ZoneCoordsMap = DuellistCoordsMap & {
  zoneCoords: ZoneCoords;
  colIdx: number;
};

type CoordsMap = ZoneCoordsMap | DuellistCoordsMap;
