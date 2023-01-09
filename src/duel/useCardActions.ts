import { useAppDispatch } from "../hooks";
import { actions as duelActions, CardActionKey } from "./duelSlice";
import { cardReducers } from "./reducers/cardReducers";
import { getZoneCoordsMap } from "./util/duelUtil";

type CardActions = {
  [K in keyof typeof cardReducers]: () => void;
};

export const useCardActions = (zoneCoords: ZoneCoords) => {
  const dispatch = useAppDispatch();

  const map = {} as CardActions;
  for (let key in duelActions) {
    map[key as CardActionKey] = () => {
      dispatch(duelActions[key as CardActionKey](getZoneCoordsMap(zoneCoords)));
    };
  }

  return map;
};
