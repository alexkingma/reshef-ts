import React from "react";
import { Provider } from "react-redux";

import { store } from "./store";
import { Duel } from "./duel/components/Duel";

import "./App.css";

const App = () => {
  return (
    <Provider store={store}>
      <Duel />
    </Provider>
  );
};

export default App;
