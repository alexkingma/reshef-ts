import React from "react";

interface Props {
  lp: DuellistDuelState["lp"];
  addLP: (lp: number) => void;
  subtractLP: (lp: number) => void;
}

export const DuellistLP = ({ lp, addLP, subtractLP }: Props) => {
  return (
    <>
      LP: {lp}&nbsp;
      <button onClick={() => addLP(1500)}>+1500</button>
      <button onClick={() => subtractLP(200)}>-200</button>
    </>
  );
};
