import classNames from "classnames";
import React, { ReactNode } from "react";
import "./Zone.scss";

interface Props {
  children?: ReactNode;
  customClasses?: string;
}

export const Zone = ({ customClasses, children }: Props) => {
  return <div className={classNames("zone", customClasses)}>{children}</div>;
};
