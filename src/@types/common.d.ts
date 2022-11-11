type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

type OmitFirstArg<F> = F extends (x: any, ...args: infer P) => infer R
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
