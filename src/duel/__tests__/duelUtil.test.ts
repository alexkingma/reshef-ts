import { getCardData } from "../../common/deck";
import { BattlePosition, Orientation } from "../common";
import { getHighestAtkZoneIdx } from "../duelUtil";

describe("getHighestAtkZoneIdx", () => {
  const empty: EmptyZone = {
    isOccupied: false,
  };
  const weak = {
    card: getCardData("Kuriboh") as MonsterCard,
    battlePosition: BattlePosition.Attack,
    hasAttacked: false,
    isOccupied: true,
    orientation: Orientation.FaceUp,
    powerUpLevel: 0,
  };
  const strong = {
    card: getCardData("Dark Magician") as MonsterCard,
    battlePosition: BattlePosition.Attack,
    hasAttacked: false,
    isOccupied: true,
    orientation: Orientation.FaceUp,
    powerUpLevel: 0,
  };

  test("weak vs strong", () => {
    expect(getHighestAtkZoneIdx([strong, weak])).toEqual(0);
    expect(getHighestAtkZoneIdx([weak, strong])).toEqual(1);
  });
  test("only one monster", () => {
    expect(getHighestAtkZoneIdx([empty, empty, weak])).toEqual(2);
    expect(getHighestAtkZoneIdx([empty, strong, empty])).toEqual(1);
  });
  test("no monsters", () => {
    expect(getHighestAtkZoneIdx([empty, empty, empty, empty, empty])).toEqual(
      -1
    );
  });
});
