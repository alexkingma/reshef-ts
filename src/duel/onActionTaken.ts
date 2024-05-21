import {
  PayloadActionCreator,
  createListenerMiddleware,
  isAnyOf,
} from "@reduxjs/toolkit";
import { actions } from "./duelSlice";

const willTriggerUpdate: PayloadActionCreator<any, any>[] = [
  actions.initDuel,
  actions.randomiseDuellists,

  actions.normalSummon,
  actions.setSpellTrap,
  actions.attackMonster,
  actions.setDefencePos,
  actions.setAttackPos,
  actions.tribute,
  actions.discard,
  actions.activateDirectSpell,
  actions.flipMonster,

  actions.endTurn,
  actions.aiNormalSummon,
];

const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  matcher: isAnyOf(...willTriggerUpdate),
  effect: (_, listenerApi) => {
    // any action that modifies board state has
    // the side effect of recomputing passive/auto effects
    listenerApi.dispatch(actions.updateAutoEffects());
  },
});

export default listenerMiddleware;
