import React from "react";
import { Provider } from "react-redux";

import { Duel } from "./duel/components/Duel";
import { store } from "./store";

import "./App.scss";

const App = () => {
  return (
    <Provider store={store}>
      <div className="root">
        <Duel />
      </div>
    </Provider>
  );
};

export default App;
