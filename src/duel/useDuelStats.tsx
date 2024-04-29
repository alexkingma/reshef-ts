import { useAppSelector } from "@/hooks";
import duelStatsMap from "../assets/data/duelStats.json";
import { DuellistStatus } from "./common";
import { selectActiveField, selectDuel } from "./duelSlice";
import { getVictorKey } from "./util/duelUtil";
import { getOtherDuellistKey, isDuellable } from "./util/duellistUtil";

const sortByValue = <T extends Record<string, number>>(obj: T): T => {
  return Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .reduce((acc, [k, v]) => {
      return { ...acc, [k]: v };
    }, {} as T);
};

export const useDuelStats = () => {
  const state = useAppSelector(selectDuel);
  const activeField = useAppSelector(selectActiveField);
  const winnerKey = getVictorKey(state);
  const loserKey = getOtherDuellistKey(winnerKey);
  const winner = state[winnerKey];
  const loser = state[loserKey];

  const calculateStats = () => {
    (() => {
      duelStatsMap.winnerTurn[winnerKey]++;
      const { p1, p2 } = duelStatsMap.winnerTurn;
      duelStatsMap.winnerTurn.p1Percent =
        Math.round((p1 / (p1 + p2)) * 10000) / 100;
    })();

    const duelEndCause =
      winner.status === DuellistStatus.EXODIA ||
      winner.status === DuellistStatus.DESTINY_BOARD
        ? winner.status
        : loser.status;
    //@ts-expect-error
    duelStatsMap.duelEndCause[duelEndCause]++;

    const remCardsCount =
      //@ts-expect-error
      duelStatsMap.winnerCardsRemInDeck[winner.deck.length] || 0;
    //@ts-expect-error
    duelStatsMap.winnerCardsRemInDeck[winner.deck.length] = remCardsCount + 1;

    duelStatsMap.endingField[activeField]++;

    //@ts-expect-error
    const lpCount = duelStatsMap.winnerRemainingLP[winner.lp] || 0;
    //@ts-expect-error
    duelStatsMap.winnerRemainingLP[winner.lp] = lpCount + 1;

    winner.monsterZones.forEach((z) => {
      if (!z.isOccupied) return;
      //@ts-expect-error
      const count = duelStatsMap.winnerEndingMonsters[z.card.name] || 0;
      //@ts-expect-error
      duelStatsMap.winnerEndingMonsters[z.card.name] = count + 1;
    });

    // duelStatsMap.winnerEndingMonsters = sortByValue(
    //   duelStatsMap.winnerEndingMonsters
    // );

    winner.spellTrapZones.forEach((z) => {
      if (!z.isOccupied) return;
      //@ts-expect-error
      const count = duelStatsMap.winnerEndingSpellTraps[z.card.name] || 0;
      //@ts-expect-error
      duelStatsMap.winnerEndingSpellTraps[z.card.name] = count + 1;
    });

    // duelStatsMap.winnerEndingSpellTraps = sortByValue(
    //   duelStatsMap.winnerEndingSpellTraps
    // );

    return duelStatsMap;
  };

  const updateStatsMap = () => {
    if ([state.p1.name, state.p2.name].every((n) => !isDuellable(n))) {
      // only track stats for two unnamed cardQuantMaps duelling
      const newStats = calculateStats();
      console.log(newStats); // TODO: write to file
    }
  };

  return { updateStatsMap };
};
