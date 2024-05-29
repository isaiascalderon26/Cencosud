import { PropsWithChildren, useReducer } from 'react';
import ErrorContext, { initialState } from './context';
import reducer from './reducer';

const ErrorProvider = ({ children }: PropsWithChildren<{}>) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <ErrorContext.Provider
      value={{
        state,
        dispatch,
      }}
    >
      {children}
    </ErrorContext.Provider>
  );
};

export default ErrorProvider;
