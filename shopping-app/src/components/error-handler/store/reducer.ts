import { IErrorActions, IErrorState } from './types';

const reducer = (state: IErrorState, action: IErrorActions): IErrorState => {
  switch (action.type) {
    case 'setError':
      return {
        ...state,
        current: action.payload === false ? undefined : action.payload,
      };
    default:
      return state;
  }
};

export default reducer;
