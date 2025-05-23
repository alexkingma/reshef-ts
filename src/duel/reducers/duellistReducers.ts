import { BattlePosition, Orientation, RowKey } from "../enums/duel";
import { getMonsterIdxsByTributeable } from "../util/aiUtil";
import { checkAutoEffects } from "../util/autoEffectUtil";
import { getCard, getNumTributesRequired } from "../util/cardUtil";
import { draw } from "../util/deckUtil";
import { isStartOfEitherTurn } from "../util/duelUtil";
import {
  getActiveEffects,
  setOriginTarget,
  swapTurnRowCoords,
} from "../util/duellistUtil";
import { hasEmptyZone, updateMonsters } from "../util/rowUtil";
import {
  clearZone,
  destroyAtCoords,
  getOriginZone,
  getZone,
  specialSummon,
} from "../util/zoneUtil";
import { OriginPayloadAction } from "./zoneReducers";

export const duellistReducers = {
  endTurn: (state: Duel) => {
    // restore ownership of any temp-converted monsters
    const { dKey, otherDKey, ownMonsters } = state.activeTurn;
    const ownActiveEffects = getActiveEffects(state, dKey);
    const opponentActiveEffects = getActiveEffects(state, otherDKey);
    ownActiveEffects.convertedZones.forEach((zoneCoords) => {
      const { id, permPowerUpAtk, permPowerUpDef } = getZone(
        state,
        zoneCoords
      ) as OccupiedMonsterZone;
      specialSummon(state, otherDKey, id, {
        permPowerUpAtk,
        permPowerUpDef,
      });
      clearZone(state, zoneCoords);
    });
    ownActiveEffects.convertedZones = [];

    // decrement turns remaining for SoRL
    // Note that we check the originator/opponent's effect flag
    if (opponentActiveEffects.sorlTurnsRemaining > 0) {
      opponentActiveEffects.sorlTurnsRemaining--;
    }

    // unlock all monster zones
    updateMonsters(state, ownMonsters, (z) => {
      if (z.battlePosition === BattlePosition.Attack) {
        z.orientation = Orientation.FaceUp;
      }
      z.isLocked = false;
    });

    // reset all turn-based params
    swapTurnRowCoords(state.activeTurn);
    state.activeTurn.isStartOfTurn = true;
    state.activeTurn.hasNormalSummoned = false;
    state.activeTurn.numTributedMonsters = 0;
  },
  updateAutoEffects: (state: Duel) => {
    // Recompute duel state based on the latest set of auto effects.
    // This happens after any action that modifies the board state.
    if (isStartOfEitherTurn(state)) {
      draw(state, state.activeTurn.dKey);
      checkAutoEffects(state);
      state.activeTurn.isStartOfTurn = false;
    } else {
      checkAutoEffects(state);
    }
  },
  aiNormalSummon: (state: Duel, { payload }: OriginPayloadAction) => {
    // originCoords refers to the mon in hand to summon to the field.
    // Which tributes should be used need to be calced first,
    // and then saccing/summoning takes place all in one discrete step.
    // This cuts out unnecessary re-renders/setTimeouts in UI.
    setOriginTarget(state, payload);
    const { activeTurn } = state;
    const { dKey, ownMonsters, originCoords } = activeTurn;
    activeTurn.hasNormalSummoned = true;
    const originZone = getOriginZone(state) as OccupiedMonsterZone;
    const originCard = getCard(originZone.id) as MonsterCard;
    const numTributesRequired = getNumTributesRequired(originCard);

    // these idxs hold mons that are weaker than the intended summon
    const weakerIdxs = getMonsterIdxsByTributeable(
      state,
      dKey,
      originZone.effAtk
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
        activeTurn.numTributedMonsters++;
      });
    }

    if (!hasEmptyZone(state, ownMonsters)) {
      // no space to summon at, clear the weakest mon to make space
      clearZone(state, [dKey, RowKey.Monster, weakerIdxs[0]]);
    }

    // summon monster to field
    specialSummon(state, dKey, originZone.id, {
      orientation: originZone.orientation,
    });

    // remove summoned mon from hand
    clearZone(state, originCoords!);
  },
};
