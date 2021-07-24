import {
  CREATE_USER,
  DELETE_USER,
  EDIT_USER,
  GET_USERS,

  GET_USER_BY_ID,

  REMOVE_USER,
  SET_LOADING,
  SET_USER,
} from '../constants/actionTypes';

import axios from 'axios';
import { BASE_URL, LOADING_USERS } from '../constants/config';
import toast_msg from '../components/common/toast';
import { MSG_CREATE_SUCCESS, MSG_DELETE_SUCCESS, MSG_EDIT_SUCCESS, MSG_ERROR } from '../constants/messages';

export const loginAction = (payload) => dispatch => {
  axios.post(BASE_URL + 'auth/local', payload).then(res => {
    dispatch({ type: SET_USER, payload: res.data, is_submit: true });
  }).catch(err => {
    toast_msg(MSG_ERROR);
    dispatch({ type: SET_USER, payload: {} });
  })
}

export const logoutAction = () => dispatch => {
  dispatch({ type: REMOVE_USER, payload: {}, is_submit: true });
}

export const setUserAction = payload => dispatch => {
  dispatch({ type: SET_USER, payload: payload, is_submit: false });
}

// ******************************* User Management *****************************
export const getUsersAction = (token) => dispatch => {
  dispatch({ type: SET_LOADING, branch: LOADING_USERS, flag: false });
  axios.get(BASE_URL + 'users', {
    headers: { Authorization: 'Bearer ' + token }
  }).then(res => {
    dispatch({ type: GET_USERS, payload: res.data});
    dispatch({ type: SET_LOADING, branch: LOADING_USERS, flag: true });
  }).catch(err => {
    toast_msg(MSG_ERROR);
    dispatch({ type: SET_LOADING, branch: LOADING_USERS, flag: true });
  })
}

export const getUserById = (role_id, token) => dispatch => {
  axios.get(BASE_URL + 'users/' + role_id, {
      headers: { Authorization: 'Bearer ' + token }
  }).then(res => {
      dispatch({ type: GET_USER_BY_ID, payload: res.data});
  }).catch(err => {
    toast_msg(MSG_ERROR);
  })
}

export const userCreateAction = (payload, token) => dispatch => {
  axios.post(BASE_URL + 'auth/local/register', payload, {
    headers: { Authorization: 'Bearer ' + token }
  }).then(res => {
    dispatch({ type: CREATE_USER, payload: res.data.user });
    toast_msg(MSG_CREATE_SUCCESS);
  }).catch(err => {
    toast_msg(MSG_ERROR);
  });
}

export const userEditAction = (id, payload, token) => dispatch => {
  axios.put(BASE_URL + 'users/' + id, payload, {
    headers: { Authorization: 'Bearer ' + token }
  }).then(res => {
    dispatch({ type: EDIT_USER, payload: res.data });
    toast_msg(MSG_EDIT_SUCCESS);
  }).catch(err => {
    toast_msg(MSG_ERROR);
  });
}

export const userDeleteAction = (id, token) => dispatch => {
  axios.delete(BASE_URL + 'users/' + id, {
    headers: { Authorization: 'Bearer ' + token }
  }).then(res => {
    dispatch({ type: DELETE_USER, payload: res.data });
    toast_msg(MSG_DELETE_SUCCESS);
  }).catch(err => {
    toast_msg(MSG_ERROR);
  });
}
