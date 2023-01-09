import { useAppDispatch } from "@/hooks";
import {
  actions as duelActions,
  CardActionKey,
  DuellistActionKey,
} from "./duelSlice";
import { cardReducers } from "./reducers/cardReducers";
import { duellistReducers } from "./reducers/duellistReducers";
import { interactionReducers } from "./reducers/interactionReducers";
import { getDuellistCoordsMap } from "./util/duellistUtil";
import { getZoneCoordsMap } from "./util/zoneUtil";

//  ----------------------------------------------------------------------- //

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

//  ----------------------------------------------------------------------- //

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

//  ----------------------------------------------------------------------- //

type InteractionActions = {
  [K in keyof typeof interactionReducers]: OmitFirstArg<
    typeof interactionReducers[K]
  >;
};

type InteractionActionKey = keyof typeof interactionReducers;

export const useInteractionActions = () => {
  const dispatch = useAppDispatch();

  const map = {} as InteractionActions;
  for (let key in duelActions) {
    map[key as InteractionActionKey] = (arg?: any) => {
      dispatch(duelActions[key as InteractionActionKey](arg));
    };
  }

  return map;
};

//  ----------------------------------------------------------------------- //
