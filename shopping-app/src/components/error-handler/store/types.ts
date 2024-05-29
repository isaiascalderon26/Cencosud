import { IContext } from '../../../stores/store';

export interface IError {
  title: string;
  message: string;
  action?: () => void;
  icon?: any;
}

export type IErrorState = {
  current?: IError;
};

export type IErrorActions = {
  type: 'setError';
  payload: IError | false;
};

export type IErrorContext = IContext<IErrorState, IErrorActions>;
