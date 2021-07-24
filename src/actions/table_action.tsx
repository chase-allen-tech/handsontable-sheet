

import axios from 'axios';
import toast_msg from '../components/common/toast';
import { CREATE_TABLE, DELETE_TABLE, EDIT_TABLE, GET_TABLES, GET_TABLE_BY_ID, SET_LOADING } from '../constants/actionTypes';
import { BASE_URL, LOADING_TABLES } from '../constants/config';
import { MSG_CREATE_SUCCESS, MSG_DELETE_SUCCESS, MSG_EDIT_SUCCESS, MSG_ERROR } from '../constants/messages';

export const getTablesAction = (token) => dispatch => {
    dispatch({ type: SET_LOADING, branch: LOADING_TABLES, flag: false });
    axios.get(BASE_URL + 'tables', {
        headers: { Authorization: 'Bearer ' + token }
    }).then(res => {
        dispatch({ type: GET_TABLES, payload: res.data});
        dispatch({ type: SET_LOADING, branch: LOADING_TABLES, flag: true });
    }).catch(err => {
        toast_msg(MSG_ERROR);
        dispatch({ type: SET_LOADING, branch: LOADING_TABLES, flag: true });
    })
}

export const getTableByIdAction = (table_id, token) => dispatch => {
    axios.get(BASE_URL + 'tables/' + table_id, {
        headers: { Authorization: 'Bearer ' + token }
    }).then(res => {
        dispatch({ type: GET_TABLE_BY_ID, payload: res.data});
    }).catch(err => {
        toast_msg(MSG_ERROR);
    })
}

export const createTableAction = (payload, token) => dispatch => {
    axios.post(BASE_URL + 'tables', payload,{
        headers: { Authorization: 'Bearer ' + token }
    }).then(res => {
        dispatch({ type: CREATE_TABLE, payload: res.data });
        toast_msg(MSG_CREATE_SUCCESS);
    }).catch(err => {
        toast_msg(MSG_ERROR);
    });
}

export const editTableAction = (id, payload, token) => dispatch => {
    axios.put(BASE_URL + 'tables/' + id, payload, {
        headers: { Authorization: 'Bearer ' + token }
    }).then(res => {
        dispatch({ type: EDIT_TABLE, payload: res.data });
        toast_msg(MSG_EDIT_SUCCESS);
    }).catch(err => {
        toast_msg(MSG_ERROR);
    });
}

export const deleteTableAction = (id, token) => dispatch => {
    axios.delete(BASE_URL + 'tables/' + id, {
        headers: { Authorization: 'Bearer ' + token }
    }).then(res => {
        dispatch({ type: DELETE_TABLE, payload: res.data });
        toast_msg(MSG_DELETE_SUCCESS);
    }).catch(err => {
        toast_msg(MSG_ERROR);
    });
}

