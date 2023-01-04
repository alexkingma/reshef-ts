import classNames from "classnames";
import React, { ReactNode } from "react";
import "./Zone.css";

interface Props {
  children?: ReactNode;
}

export const Zone = ({ children }: Props) => {
  return <div className={classNames("zone")}>{children}</div>;
};
