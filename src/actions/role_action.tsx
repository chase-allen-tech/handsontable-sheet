import axios from 'axios';
import { CREATE_ROLE, DELETE_ROLE, EDIT_ROLE, GET_ROLES, GET_ROLE_BY_ID, SET_LOADING } from '../constants/actionTypes';
import { BASE_URL, LOADING_ROLES } from "../constants/config";

export const getRolesAction = (token) => dispatch => {
    dispatch({ type: SET_LOADING, branch: LOADING_ROLES, flag: false });
    axios.get(BASE_URL + 'users-permissions/roles', {
        headers: { Authorization: 'Bearer ' + token }
    }).then(res => {
        // console.log('--get role--', res);
        dispatch({ type: GET_ROLES, payload: res.data.roles });
        dispatch({ type: SET_LOADING, branch: LOADING_ROLES, flag: true });
    }).catch(err => {
        // console.log('--get role err--', err);
        dispatch({ type: SET_LOADING, branch: LOADING_ROLES, flag: true });
    })
}

export const getRoleByIdAction = (role_id, token) => dispatch => {
    axios.get(BASE_URL + 'users-permissions/roles/' + role_id, {
        headers: { Authorization: 'Bearer ' + token }
    }).then(res => {
        dispatch({ type: GET_ROLE_BY_ID, payload: res.data });
    }).catch(err => {
        // console.log(err);
    })
}

export const roleCreateAction = (payload, token) => dispatch => {
    axios.post(BASE_URL + 'users-permissions/roles', payload, {
        headers: { Authorization: 'Bearer ' + token }
    }).then(res => {
        // console.log('--user create--', res);
        dispatch({ type: CREATE_ROLE, payload: res.data });
    }).catch(err => {
        // console.log('--user create err--', err);
    });
}

export const roleEditAction = (id, payload, token) => dispatch => {
    axios.put(BASE_URL + 'users-permissions/roles/' + id, payload, {
        headers: { Authorization: 'Bearer ' + token }
    }).then(res => {
        // console.log('--user edit--', res);
        dispatch({ type: EDIT_ROLE, payload: res.data });
    }).catch(err => {
        // console.log('--user edit err--', err);
    });
}

export const roleDeleteAction = (id, token) => dispatch => {
    axios.delete(BASE_URL + 'users-permissions/roles/' + id, {
        headers: { Authorization: 'Bearer ' + token }
    }).then(res => {
        // console.log('--user delete--', res);
        dispatch({ type: DELETE_ROLE, payload: res.data });
    }).catch(err => {
        // console.log('--user delete err--', err);
    });
}
