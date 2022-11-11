import { getCardData } from "../../common/deck";
import { attackMonster } from "../combatUtil";
import { BattlePosition, Orientation } from "../common";

let weakDark: OccupiedMonsterZone;
let strongDark: OccupiedMonsterZone;
let weakDreams: OccupiedMonsterZone;
let strongDreams: OccupiedMonsterZone;
let weakLight: OccupiedMonsterZone;
let strongLight: OccupiedMonsterZone;

const createZone = (cardName: CardName): OccupiedMonsterZone => ({
  card: getCardData(cardName) as MonsterCard,
  battlePosition: BattlePosition.Attack,
  hasAttacked: false,
  isOccupied: true,
  orientation: Orientation.FaceUp,
  powerUpLevel: 0,
});

beforeEach(() => {
  weakDark = createZone("Kuriboh");
  strongDark = createZone("Dark Magician");
  weakDreams = createZone("The Bewitching Phantom Thief");
  strongDreams = createZone("Mirage Knight");
  weakLight = createZone("Key Mace");
  strongLight = createZone("Blue-Eyes White Dragon");
});

describe("neutral alignment", () => {
  describe("attackMonster", () => {
    test("high atk vs low atk, attack pos", () => {
      const {
        attackerDestroyed,
        targetDestroyed,
        attackerLpLoss,
        targetLpLoss,
      } = attackMonster(strongDark, weakDark);
      expect(attackerDestroyed).toEqual(false);
      expect(targetDestroyed).toEqual(true);
      expect(attackerLpLoss).toEqual(0);
      expect(targetLpLoss).toEqual(2200);
    });

    test("low atk vs high atk, attack pos", () => {
      const {
        attackerDestroyed,
        targetDestroyed,
        attackerLpLoss,
        targetLpLoss,
      } = attackMonster(weakDark, strongDark);
      expect(attackerDestroyed).toEqual(true);
      expect(targetDestroyed).toEqual(false);
      expect(attackerLpLoss).toEqual(2200);
      expect(targetLpLoss).toEqual(0);
    });

    test("high atk vs low atk, def pos", () => {
      weakDark.battlePosition = BattlePosition.Defence;
      const {
        attackerDestroyed,
        targetDestroyed,
        attackerLpLoss,
        targetLpLoss,
      } = attackMonster(strongDark, weakDark);
      expect(attackerDestroyed).toEqual(false);
      expect(targetDestroyed).toEqual(true);
      expect(attackerLpLoss).toEqual(0);
      expect(targetLpLoss).toEqual(0);
    });

    test("low atk vs high atk, def pos", () => {
      strongDark.battlePosition = BattlePosition.Defence;
      const {
        attackerDestroyed,
        targetDestroyed,
        attackerLpLoss,
        targetLpLoss,
      } = attackMonster(weakDark, strongDark);
      expect(attackerDestroyed).toEqual(false);
      expect(targetDestroyed).toEqual(false);
      expect(attackerLpLoss).toEqual(2200);
      expect(targetLpLoss).toEqual(0);
    });
  });

  describe("strong alignment", () => {
    test("high atk vs low atk, attack pos", () => {
      const {
        attackerDestroyed,
        targetDestroyed,
        attackerLpLoss,
        targetLpLoss,
      } = attackMonster(strongDreams, weakDark);
      expect(attackerDestroyed).toEqual(false);
      expect(targetDestroyed).toEqual(true);
      expect(attackerLpLoss).toEqual(0);
      expect(targetLpLoss).toEqual(2500);
    });

    test("low atk vs high atk, attack pos", () => {
      const {
        attackerDestroyed,
        targetDestroyed,
        attackerLpLoss,
        targetLpLoss,
      } = attackMonster(weakDreams, strongDark);
      expect(attackerDestroyed).toEqual(false);
      expect(targetDestroyed).toEqual(true);
      expect(attackerLpLoss).toEqual(0);
      expect(targetLpLoss).toEqual(0);
    });

    test("high atk vs low atk, def pos", () => {
      weakDark.battlePosition = BattlePosition.Defence;
      const {
        attackerDestroyed,
        targetDestroyed,
        attackerLpLoss,
        targetLpLoss,
      } = attackMonster(strongDreams, weakDark);
      expect(attackerDestroyed).toEqual(false);
      expect(targetDestroyed).toEqual(true);
      expect(attackerLpLoss).toEqual(0);
      expect(targetLpLoss).toEqual(0);
    });

    test("low atk vs high atk, def pos", () => {
      strongDark.battlePosition = BattlePosition.Defence;
      const {
        attackerDestroyed,
        targetDestroyed,
        attackerLpLoss,
        targetLpLoss,
      } = attackMonster(weakDreams, strongDark);
      expect(attackerDestroyed).toEqual(false);
      expect(targetDestroyed).toEqual(true);
      expect(attackerLpLoss).toEqual(0);
      expect(targetLpLoss).toEqual(0);
    });
  });

  describe("weak alignment", () => {
    test("high atk vs low atk, attack pos", () => {
      const {
        attackerDestroyed,
        targetDestroyed,
        attackerLpLoss,
        targetLpLoss,
      } = attackMonster(strongLight, weakDark);
      expect(attackerDestroyed).toEqual(true);
      expect(targetDestroyed).toEqual(false);
      expect(attackerLpLoss).toEqual(0);
      expect(targetLpLoss).toEqual(0);
    });

    test("low atk vs high atk, attack pos", () => {
      const {
        attackerDestroyed,
        targetDestroyed,
        attackerLpLoss,
        targetLpLoss,
      } = attackMonster(weakLight, strongDark);
      expect(attackerDestroyed).toEqual(true);
      expect(targetDestroyed).toEqual(false);
      expect(attackerLpLoss).toEqual(2100);
      expect(targetLpLoss).toEqual(0);
    });

    test("high atk vs low atk, def pos", () => {
      weakDark.battlePosition = BattlePosition.Defence;
      const {
        attackerDestroyed,
        targetDestroyed,
        attackerLpLoss,
        targetLpLoss,
      } = attackMonster(strongLight, weakDark);
      expect(attackerDestroyed).toEqual(true);
      expect(targetDestroyed).toEqual(false);
      expect(attackerLpLoss).toEqual(0);
      expect(targetLpLoss).toEqual(0);
    });

    test("low atk vs high atk, def pos", () => {
      strongDark.battlePosition = BattlePosition.Defence;
      const {
        attackerDestroyed,
        targetDestroyed,
        attackerLpLoss,
        targetLpLoss,
      } = attackMonster(weakLight, strongDark);
      expect(attackerDestroyed).toEqual(true);
      expect(targetDestroyed).toEqual(false);
      expect(attackerLpLoss).toEqual(2100);
      expect(targetLpLoss).toEqual(0);
    });
  });
});
