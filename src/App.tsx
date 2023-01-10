import React from "react";
import { Provider } from "react-redux";
import "./App.scss";
import { Duel } from "./duel/components/Duel";
import { store } from "./store";

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
