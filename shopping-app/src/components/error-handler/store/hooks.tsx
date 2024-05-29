import { useContext } from 'react';
import ErrorContext from './context';
import { IError } from './types';

export const useErrorContext = () => {
  const ctx = useContext(ErrorContext);
  return ctx;
};

export const useError = () => {
  const { dispatch } = useErrorContext();

  return [
    (error: IError) => {
      dispatch({
        type: 'setError',
        payload: error,
      });
    },
    () => {
      dispatch({
        type: 'setError',
        payload: false,
      });
    },
  ];
};
