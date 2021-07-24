

import axios from 'axios';
import toast_msg from '../components/common/toast';
import { CREATE_FILE, DELETE_FILE, GET_FILES, GET_FILE_BY_ID } from '../constants/actionTypes';
import { BASE_URL } from '../constants/config';
import { MSG_CREATE_SUCCESS, MSG_DELETE_SUCCESS, MSG_ERROR } from '../constants/messages';

export const getFilesAction = (token) => dispatch => {
    axios.get(BASE_URL + 'upload/files', {
        headers: { Authorization: 'Bearer ' + token }
    }).then(res => {
        dispatch({ type: GET_FILES, payload: res.data});
    }).catch(err => {
        toast_msg(MSG_ERROR);
    })
}

export const getFileByIdAction = (file_id, token) => dispatch => {
    axios.get(BASE_URL + 'upload/files/' + file_id, {
        headers: { Authorization: 'Bearer ' + token }
    }).then(res => {
        dispatch({ type: GET_FILE_BY_ID, payload: res.data});
    }).catch(err => {
        toast_msg(MSG_ERROR);
    })
}

export const createFileAction = (payload, token) => dispatch => {
    axios.post(BASE_URL + 'upload', payload,{
        headers: { Authorization: 'Bearer ' + token }
    }).then(res => {
        console.log('--file-response--', res.data);
        dispatch({ type: CREATE_FILE, payload: res.data });
    }).catch(err => {
        console.log('--file-err--', err);
        toast_msg(MSG_ERROR);
    });
}

export const deleteFileAction = (id, token) => dispatch => {
    axios.delete(BASE_URL + 'upload/files/' + id, {
        headers: { Authorization: 'Bearer ' + token }
    }).then(res => {
        dispatch({ type: DELETE_FILE, payload: res.data });
    }).catch(err => {
        toast_msg(MSG_ERROR);
    });
}

