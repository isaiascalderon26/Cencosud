import React, { Dispatch } from 'react';

export interface IContext<S, A> {
  state: S;
  dispatch: Dispatch<A>;
}
