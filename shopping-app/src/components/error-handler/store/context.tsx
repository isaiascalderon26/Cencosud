import {
  createContext,
  PropsWithChildren,
  useContext,
  useReducer,
} from 'react';
import reducer from './reducer';
import { IError, IErrorActions, IErrorContext, IErrorState } from './types';

export const initialState: IErrorState = {};

export const initialContext: IErrorContext = {
  state: initialState,
  dispatch: (s) => s,
};

const ErrorContext = createContext<IErrorContext>(initialContext);

export default ErrorContext;
