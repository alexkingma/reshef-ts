import duelStatsMap from "@/assets/data/duelStats.json";
import { useAppSelector } from "@/hooks";
import { selectActiveField, selectDuel } from "./duelSlice";
import { DKey, DStatus } from "./enums/duel";
import { getCard } from "./util/cardUtil";
import { getVictorKey } from "./util/duelUtil";
import { getOtherDuellistKey, isDuellable } from "./util/duellistUtil";
import { isOccupied } from "./util/zoneUtil";

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
  const winner = state.duellists[winnerKey];
  const loser = state.duellists[loserKey];

  const calculateStats = () => {
    (() => {
      duelStatsMap.winnerTurn[winnerKey]++;
      const { "0": p1, "1": p2 } = duelStatsMap.winnerTurn;
      duelStatsMap.winnerTurn.p1Percent =
        Math.round((p1 / (p1 + p2)) * 10000) / 100;
    })();

    const duelEndCause =
      winner.status === DStatus.EXODIA ||
      winner.status === DStatus.DESTINY_BOARD
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
      if (!isOccupied(z)) return;
      const card = getCard(z.id);
      //@ts-expect-error
      const count = duelStatsMap.winnerEndingMonsters[card.name] || 0;
      //@ts-expect-error
      duelStatsMap.winnerEndingMonsters[card.name] = count + 1;
    });

    // duelStatsMap.winnerEndingMonsters = sortByValue(
    //   duelStatsMap.winnerEndingMonsters
    // );

    winner.spellTrapZones.forEach((z) => {
      if (!isOccupied(z)) return;
      const card = getCard(z.id);
      //@ts-expect-error
      const count = duelStatsMap.winnerEndingSpellTraps[card.name] || 0;
      //@ts-expect-error
      duelStatsMap.winnerEndingSpellTraps[card.name] = count + 1;
    });

    // duelStatsMap.winnerEndingSpellTraps = sortByValue(
    //   duelStatsMap.winnerEndingSpellTraps
    // );

    return duelStatsMap;
  };

  const updateStatsMap = () => {
    if (
      !isDuellable(state.duellists[DKey.Player].name) &&
      !isDuellable(state.duellists[DKey.Opponent].name)
    ) {
      // only track stats for two unnamed cardQuantMaps duelling
      const newStats = calculateStats();
      console.log(newStats); // TODO: write to file
    }
  };

  return { updateStatsMap };
};
