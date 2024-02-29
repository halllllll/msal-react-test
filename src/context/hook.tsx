import {
  type FC,
  ReactNode,
  createContext,
  useContext,
  useReducer,
  useMemo,
} from "react";

export const viewType = ["first", "pagenate", "download"] as const

// context state
export type MyAppCtx = {
  accessToken: string; // acquiresilentを使えば不要かも
  view: typeof viewType[number] | null
} | null;

// context dispatch
// biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
export type SetMyAppCtx = React.Dispatch<ctxAction>;

// createContextもここでやってる
const MyAppContext = createContext<MyAppCtx>(null);
const SetMyAppContext = createContext<SetMyAppCtx>(() => null);

// contxt action
type ctxAction =
  | {
      type: "SetAccessToken";
      payload: { accessToken: string };
    } | {
      type: "logout";
    } | {
      type: typeof viewType[number]
    } | {
      type: "null"
    }
  

// context reducer
const ctxReducer = (
  curData: NonNullable<MyAppCtx>,
  action: ctxAction
): NonNullable<MyAppCtx> => {
  switch (action.type) {
    case "SetAccessToken": {
      return { ...(curData || {}), accessToken: action.payload.accessToken };
    }
    case "logout": {
      return {...curData, accessToken:""}
    }
    case "first": {
      return {...curData, view: "first"}
    }
    case "pagenate": {
      return {...curData, view: "pagenate"}
    }
    case "download": {
      return {...curData, view: "download"}
    }
    case "null": {
      return {...curData, view: null}
    }
  }
};

export const MyAppProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const initial: NonNullable<MyAppCtx> = {
    accessToken: "",
    view: null,
  };
  const [MyAppState, MyAppDispatch] = useReducer(ctxReducer, initial);
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const  MyApp = useMemo(() => {
    return { MyAppState, MyAppDispatch };
  }, [MyAppState, MyAppDispatch]);
  return (
  <MyAppContext.Provider value={MyApp.MyAppState}>
      <SetMyAppContext.Provider value={MyApp.MyAppDispatch}>
        {children}
      </SetMyAppContext.Provider>
    </MyAppContext.Provider>
  );
};

export const useMyAppContext = (): {
  MyAppCtx: NonNullable<MyAppCtx>;
  // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
setMyAppCtx: React.Dispatch<ctxAction>;
} => {
  const MyAppCtx = useContext(MyAppContext);
  if (MyAppCtx === null) {
    throw new Error(
      "MyApp context must be used within a MyAppProvider"
    );
  }

  const setMyAppCtx = useContext(SetMyAppContext);
  return { MyAppCtx, setMyAppCtx };
};
