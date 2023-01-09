import { useAppDispatch } from "../hooks";
import { actions as duelActions, DuellistActionKey } from "./duelSlice";
import { duellistReducers } from "./reducers/duellistReducers";
import { getDuellistCoordsMap } from "./util/duelUtil";

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
