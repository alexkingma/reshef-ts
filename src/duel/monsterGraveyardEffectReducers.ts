import {
  clearGraveyard,
  destroyAtCoords,
  resurrectOwn,
  specialSummon,
} from "./cardEffectUtil";
import { destroyHighestAtk } from "./cardEffectWrapped";
import { GraveyardEffectMonster, Monster, RowKey } from "./common";
import { ReducerArg } from "./duelSlice";
import { getFirstOccupiedZoneIdx, getNumCardsInRow } from "./duelUtil";

type MonsterGraveyardEffectReducers = {
  [key in GraveyardEffectMonster]: (arg: ReducerArg) => void;
};

export const monsterGraveyardEffectReducers: MonsterGraveyardEffectReducers = {
  [Monster.TheWingedDragonOfRaPhoenixMode]: ({ originatorState }) => {
    specialSummon(originatorState, Monster.TheWingedDragonOfRaBattleMode);
    clearGraveyard(originatorState);
  },
  [Monster.Helpoemer]: ({ targetState }) => {
    // If this is in the own graveyard on the enemy's turn, and if
    // the foe has 3 or more cards in hand, the foe must discard one.
    const count = getNumCardsInRow(targetState.hand);
    if (count < 3) return;
    const handIdx = getFirstOccupiedZoneIdx(targetState.hand) as FieldCol;
    destroyAtCoords(targetState, [RowKey.Hand, handIdx]);
  },
  [Monster.Newdoria]: (arg) => {
    const { originatorState } = arg;
    destroyHighestAtk()(arg);
    clearGraveyard(originatorState);
  },
  [Monster.VampireLord]: ({ originatorState }) => {
    // in the own graveyard at the start of your turn == resurrected
    resurrectOwn(originatorState);
  },
  [Monster.DifferentDimensionDragon]: ({ originatorState }) => {
    // in the own graveyard at the start of your turn == resurrected
    resurrectOwn(originatorState);
  },
  [Monster.DarkFlareKnight]: ({ originatorState }) => {
    specialSummon(originatorState, Monster.MirageKnight);
    clearGraveyard(originatorState);
  },
};
