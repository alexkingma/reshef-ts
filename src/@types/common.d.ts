type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

type OmitFirstArg<F> = F extends (x: any, ...args: infer P) => infer R
  ? (...args: P) => R
  : never;

type OmitFirstTwoArgs<F> = F extends (
  x: any,
  y: any,
  ...args: infer P
) => infer R
  ? (...args: P) => R
  : never;

type OmitFirstArgInFunctionMap<T> = {
  [K in keyof T]: OmitFirstArg<T[K]>;
};

type PrependArgs<F, A> = F extends (...args: infer P) => infer R
  ? (...args: [...A, ...P]) => R
  : never;

type PrependArgInFunctionMap<T, A> = {
  [K in keyof T]: PrependArgs<T[K], A>;
};

type OmitFirst<T extends any[]> = T extends [any, ...infer R] ? R : never;
type OmitLast<T extends any[]> = T extends [...infer R, any] ? R : never;

type ExtractNonFirstArgs<F> = F extends (first: any, ...args: infer P) => any
  ? P
  : never;

type ExtractSecondArg<F> = F extends (first: any, second: infer P) => any
  ? P
  : never;
