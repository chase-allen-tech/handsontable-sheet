

import axios from 'axios';
import { CREATE_CELL, DELETE_CELL, EDIT_CELL, GET_CELLS, GET_CELL_BY_ID, SET_LOADING } from '../constants/actionTypes';
import { BASE_URL, LOADING_CELLS } from '../constants/config';

const globalRxIncrease = () => {
    if(globalThis.rxRequest == undefined) return;
    globalThis.rxRequest += 1;
}

export const getCellsAction = (token) => dispatch => {
    dispatch({ type: SET_LOADING, branch: LOADING_CELLS, flag: false });
    axios.get(BASE_URL + 'cells', {
        headers: { Authorization: 'Bearer ' + token },
        params: {
            _limit: 100000,
            _sort: 'ident'
        }
    }).then(res => {
        dispatch({ type: GET_CELLS, payload: res.data});
        dispatch({ type: SET_LOADING, branch: LOADING_CELLS, flag: true });
    }).catch(err => {
        console.log(err);
        dispatch({ type: SET_LOADING, branch: LOADING_CELLS, flag: true });
    })
}

export const getCellByIdAction = (cell_id, token) => dispatch => {
    axios.get(BASE_URL + 'cells/' + cell_id, {
        headers: { Authorization: 'Bearer ' + token }
    }).then(res => {
        dispatch({ type: GET_CELL_BY_ID, payload: res.data});
    }).catch(err => {
        console.log(err);
    })
}

export const createCellAction = (payload, token) => dispatch => {
    axios.post(BASE_URL + 'cells', payload,{
        headers: { Authorization: 'Bearer ' + token }
    }).then(res => {
        dispatch({ type: CREATE_CELL, payload: res.data });
        globalRxIncrease();
    }).catch(err => {
        console.log('err', payload);
        globalRxIncrease();
    });
}

export const editCellAction = (id, payload, token) => dispatch => {
    axios.put(BASE_URL + 'cells/' + id, payload, {
        headers: { Authorization: 'Bearer ' + token }
    }).then(res => {
        dispatch({ type: EDIT_CELL, payload: res.data });
    }).catch(err => {
        console.log(err);
    });
}

export const deleteCellAction = (id, token) => dispatch => {
    axios.delete(BASE_URL + 'cells/' + id, {
        headers: { Authorization: 'Bearer ' + token }
    }).then(res => {
        dispatch({ type: DELETE_CELL, payload: res.data });

        globalRxIncrease();
    }).catch(err => {
        console.log(err);
        globalRxIncrease();
    });
}

