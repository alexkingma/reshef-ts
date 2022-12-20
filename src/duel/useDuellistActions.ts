import { useAppDispatch } from "../hooks";
import { duellistReducers } from "./duellistReducers";
import { actions as duelActions, DuellistActionKey } from "./duelSlice";
import { getDuellistCoordsMap } from "./duelUtil";

type DuellistActions = {
  [K in keyof typeof duellistReducers]: () => void;
};

export const useDuellistActions = (dKey: DuellistKey) => {
  const dispatch = useAppDispatch();

  const map = {} as DuellistActions;
  for (let key in duelActions) {
    map[key as DuellistActionKey] = () => {
      dispatch(
        duelActions[key as DuellistActionKey](getDuellistCoordsMap(dKey))
      );
    };
  }

  return map;
};
