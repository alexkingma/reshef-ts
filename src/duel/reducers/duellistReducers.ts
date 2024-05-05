import { RowKey } from "../enums/duel";
import { getMonsterIdxsByTributeable } from "../util/aiUtil";
import { getNumTributesRequired } from "../util/cardUtil";
import { shuffle } from "../util/common";
import { endTurn } from "../util/duellistUtil";
import { hasEmptyZone } from "../util/rowUtil";
import {
  clearZone,
  destroyAtCoords,
  getZone,
  specialSummon,
} from "../util/zoneUtil";

export const duellistReducers = {
  shuffle: (state: Duel, { dKey }: DuellistCoordsMap) => {
    shuffle(state[dKey].deck);
  },
  endTurn,
  aiNormalSummon: (state: Duel, { dKey, ownMonsters }: DuellistCoordsMap) => {
    // originCoords refers to the mon in hand to summon to the field.
    // Which tributes should be used need to be calced first,
    // and then saccing/summoning takes place all in one discrete step.
    // This cuts out unnecessary re-renders/setTimeouts in UI.
    const { activeTurn, interaction } = state;
    activeTurn.hasNormalSummoned = true;
    const { originCoords } = interaction;
    const originZone = getZone(state, originCoords!) as OccupiedMonsterZone;
    const numTributesRequired = getNumTributesRequired(originZone.card);

    // these idxs hold mons that are weaker than the intended summon
    const weakerIdxs = getMonsterIdxsByTributeable(
      state,
      dKey,
      originZone.card.effAtk
    );

    if (
      !weakerIdxs.length &&
      (numTributesRequired || !hasEmptyZone(state, ownMonsters))
    ) {
      // All field monsters are stronger than the chosen hand monster,
      // preventing them from being tributed or overwritten by a tribute-less mon
      return;
    }

    if (numTributesRequired) {
      const idxsToTribute = weakerIdxs.slice(0, numTributesRequired);
      if (!idxsToTribute.length) {
        console.log(
          `No tributeable monsters found, but tributes are necessary!`
        );
        return;
      }

      // tribute as many monsters as is necessary to bring out the chosen mon
      idxsToTribute.forEach((i) => {
        destroyAtCoords(state, [...ownMonsters, i]);
        state.activeTurn.numTributedMonsters++;
      });
    }

    if (!hasEmptyZone(state, ownMonsters)) {
      // no space to summon at, clear the weakest mon to make space
      clearZone(state, [dKey, RowKey.Monster, weakerIdxs[0]]);
    }

    // summon monster to field
    specialSummon(state, dKey, originZone.card.id, {
      orientation: originZone.orientation,
    });

    // remove summoned mon from hand
    clearZone(state, originCoords!);
  },
};
