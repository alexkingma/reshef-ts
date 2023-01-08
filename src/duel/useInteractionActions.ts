import { useAppDispatch } from "../hooks";
import { actions as duelActions } from "./duelSlice";
import { interactionReducers } from "./interactionReducers";

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
