import React from 'react';
import ErrorHandlerModal from './modal';
import { useErrorContext } from './store/hooks';
import ErrorIcon from '../../assets/media/error-icon.svg';

function Handler() {
  const { dispatch, state } = useErrorContext();

  return state.current ? (
    <ErrorHandlerModal
      title={state.current.title}
      message={state.current.message}
      icon={state.current.icon ?? ErrorIcon}
      onBack={() => {
        if( state.current?.action !== undefined){
          state.current?.action();
        }
        dispatch({
          type: 'setError',
          payload: false,
        });
      }}
    ></ErrorHandlerModal>
  ) : (
    <></>
  );
}

export default Handler;
