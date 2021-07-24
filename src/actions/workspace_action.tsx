

import axios from 'axios';
import toast_msg from '../components/common/toast';
import { CREATE_WORKSPACE, DELETE_WORKSPACE, EDIT_WORKSPACE, GET_WORKSPACES, SET_LOADING } from '../constants/actionTypes';
import { BASE_URL, LOADING_WORKSPACES } from '../constants/config';
import { MSG_CREATE_SUCCESS, MSG_DELETE_SUCCESS, MSG_EDIT_SUCCESS, MSG_ERROR } from '../constants/messages';

export const getWorkspacesAction = (token) => dispatch => {
    dispatch({ type: SET_LOADING, branch: LOADING_WORKSPACES, flag: false });
    axios.get(BASE_URL + 'workspaces', {
        headers: { Authorization: 'Bearer ' + token }
    }).then(res => {
        dispatch({ type: GET_WORKSPACES, payload: res.data});
        dispatch({ type: SET_LOADING, branch: LOADING_WORKSPACES, flag: true });
    }).catch(err => {
        toast_msg(MSG_ERROR);
        dispatch({ type: SET_LOADING, branch: LOADING_WORKSPACES, flag: true });
    })
}

export const createWorkspaceAction = (payload, token) => dispatch => {
    axios.post(BASE_URL + 'workspaces', payload,{
        headers: { Authorization: 'Bearer ' + token }
    }).then(res => {
        dispatch({ type: CREATE_WORKSPACE, payload: res.data });
        toast_msg(MSG_CREATE_SUCCESS);
    }).catch(err => {
        toast_msg(MSG_ERROR);
    });
}

export const editWorkspaceAction = (id, payload, token) => dispatch => {
    axios.put(BASE_URL + 'workspaces/' + id, payload, {
        headers: { Authorization: 'Bearer ' + token }
    }).then(res => {
        dispatch({ type: EDIT_WORKSPACE, payload: res.data });
        toast_msg(MSG_EDIT_SUCCESS);
    }).catch(err => {
        toast_msg(MSG_ERROR);
    });
}

export const deleteWorkspaceAction = (id, token) => dispatch => {
    axios.delete(BASE_URL + 'workspaces/' + id, {
        headers: { Authorization: 'Bearer ' + token }
    }).then(res => {
        dispatch({ type: DELETE_WORKSPACE, payload: res.data });
        toast_msg(MSG_DELETE_SUCCESS);
    }).catch(err => {
        toast_msg(MSG_ERROR);
    });
}

