import React from "react";
import { Provider } from "react-redux";

import { Duel } from "./duel/components/Duel";
import { store } from "./store";

import "./App.css";

const App = () => {
  return (
    <Provider store={store}>
      <Duel />
    </Provider>
  );
};

export default App;
