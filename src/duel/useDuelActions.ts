import { useAppDispatch } from "../hooks";
import { coreDuelReducers } from "./coreDuelReducers";
import { actions as duelActions, DuelActionKey } from "./duelSlice";

type DuelActions = {
  [K in keyof typeof coreDuelReducers]: OmitFirstArg<
    typeof coreDuelReducers[K]
  >;
};

const useDuelActions = (duellistKey: DuellistKey) => {
  const dispatch = useAppDispatch();

  const map = {} as DuelActions;
  for (let key in duelActions) {
    map[key as DuelActionKey] = (payload?: any) => {
      dispatch(
        duelActions[key as DuelActionKey]({
          // @ts-ignore
          duellistKey,
          // @ts-ignore
          payload,
        })
      );
    };
  }

  return map;
};

export default useDuelActions;
