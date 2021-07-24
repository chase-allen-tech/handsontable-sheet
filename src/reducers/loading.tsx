import { CREATE_CELL, DELETE_CELL, EDIT_CELL, GET_CELLS, GET_CELL_BY_ID, SET_LOADING, } from '../constants/actionTypes';
import { LOADING_CELLS, LOADING_ROLES, LOADING_TABLES, LOADING_USERS, LOADING_WORKSPACES } from '../constants/config';

export const initialState = {
    loaded: false,
    data: [false, false, false, false, false],
};

const TOTAL = 5;

const Loading = (state = initialState, action) => {
    const { type, branch, flag } = action;

    if (type == SET_LOADING) {
        let tmp = [...state.data];
        tmp.splice(branch, 1, flag);
        return {
            loaded: tmp.reduce((a, b) => Number(a) + Number(b), 0) == TOTAL,
            data: tmp
        }
    } else {
        return state;
    }
};
export default Loading;