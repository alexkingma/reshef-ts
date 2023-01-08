import { useAppDispatch } from "../hooks";
import { cardReducers } from "./cardReducers";
import { actions as duelActions, CardActionKey } from "./duelSlice";
import { getZoneCoordsMap } from "./duelUtil";

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
