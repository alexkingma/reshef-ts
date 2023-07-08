import React from "react";
import { Provider } from "react-redux";
import "./App.scss";
import { DuelContainer } from "./duel/components/DuelContainer";
import { store } from "./store";

const App = () => {
  return (
    <Provider store={store}>
      <div className="root">
        <DuelContainer />
      </div>
    </Provider>
  );
};

export default App;
