import { getCard } from "../../common/card";
import { getHighestAtkZoneIdx, getOccupiedMonsterZone } from "../duelUtil";

describe("getHighestAtkZoneIdx", () => {
  const empty: EmptyZone = {
    isOccupied: false,
  };
  const weak = {
    ...getOccupiedMonsterZone(getCard("Kuriboh") as MonsterCard),
  };
  const strong = {
    ...getOccupiedMonsterZone(getCard("Dark Magician") as MonsterCard),
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
