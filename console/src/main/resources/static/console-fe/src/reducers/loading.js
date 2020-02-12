import { CHANGE_LOADING } from '../constants';

const initialState = {
  loading: true,
};

const changeLoading = loading => dispatch => {
  dispatch({
    type: CHANGE_LOADING,
    loading: loading === true,
  });
};

export default (state = initialState, action) => {
  switch (action.type) {
    case CHANGE_LOADING:
      return { ...state, ...action };
    default:
      return state;
  }
};

export { changeLoading };
