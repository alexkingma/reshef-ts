import React from "react";
import { Provider } from "react-redux";
import "./App.scss";
import { DuelContainer } from "./duel/components/DuelContainer";
import useBot from "./scripts/useBot";
import { store } from "./store";

const App = () => {
  const botData = useBot();
  return (
    <Provider store={store}>
      <div className="root">
        <DuelContainer />
        {botData}
      </div>
    </Provider>
  );
};

export default App;
