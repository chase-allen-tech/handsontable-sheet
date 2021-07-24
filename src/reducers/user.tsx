import toast_msg from '../components/common/toast';
import { CREATE_USER, DELETE_USER, EDIT_USER, GET_USERS, GET_USER_BY_ID } from '../constants/actionTypes';
import { MSG_EDIT_SUCCESS } from '../constants/messages';

export const initialState = {
    current: {},
    data: [],
};

const user = (state = initialState, action) => {
    const { type, payload, } = action;

    switch (type) {
        case GET_USERS: {
            if (!payload || !Array.isArray(payload)) { return state; }
            let filtered = Array.from(new Set([...payload]));
            let sorted = filtered.sort((a, b) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0));
            return {
                ...state,
                data: sorted
            };
        }
        case GET_USER_BY_ID: {
            return {
                ...state,
                current: payload
            }
        }
        case EDIT_USER: {
            let filtered = [...state.data.filter(el => el.id !== payload.id), payload]
            let sorted = filtered.sort((a, b) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0));
            return {
                ...state,
                data: Array.from(new Set(sorted))
            };
        }
        case CREATE_USER: {
            return {
                ...state,
                data: Array.from(new Set([...state.data, payload]))
            };
        }
        case DELETE_USER:
            return {
                ...state,
                data: state.data.filter(el => el.id !== payload.id)
            }
        default: {
            return state;
        }
    }
};
export default user;