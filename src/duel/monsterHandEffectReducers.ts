import { HandEffectMonster, Monster } from "./common";
import { ReducerArg } from "./duelSlice";

type MonsterAutoEffectReducers = {
  [key in HandEffectMonster]: (arg: ReducerArg, monsterIdx: FieldCol) => void;
};

export const monsterHandEffectReducers: MonsterAutoEffectReducers = {
  [Monster.LavaGolem]: ({ originatorState, targetState }, monsterIdx) => {
    // TODO -- auto, start of turn
    // If this is in the own hand, it can be made to appear on
    // the enemy's field for two enemy monsters as tributes.
  },
};
