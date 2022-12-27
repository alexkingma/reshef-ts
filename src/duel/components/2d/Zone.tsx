import classNames from "classnames";
import React, { ReactNode } from "react";
import "./Zone.css";

interface Props {
  children?: ReactNode;
  customClasses?: string;
}

export const Zone = ({ children, customClasses }: Props) => {
  return <div className={classNames("zone", customClasses)}>{children}</div>;
};
