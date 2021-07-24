import { CREATE_ROLE, DELETE_ROLE, EDIT_ROLE, GET_ROLES, GET_ROLE_BY_ID } from '../constants/actionTypes';

export const initialState = {
    current: {},
    data: [],
};

const role = (state = initialState, action) => {
    const { type, payload, } = action;

    switch (type) {
        case GET_ROLES: {
            if (!payload || !Array.isArray(payload)) { return state; }
            let filtered = Array.from(new Set([...payload]));
            let sorted = filtered.sort((a, b) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0));
            return {
                ...state,
                data: sorted
            };
        }
        case GET_ROLE_BY_ID: {
            return {
                ...state,
                current: payload
            }
        }
        case EDIT_ROLE: {
            let filtered = [...state.data.filter(el => el.id !== payload.id), payload]
            let sorted = filtered.sort((a, b) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0));
            return {
                ...state,
                data: Array.from(new Set(sorted))
            };
        }
        case CREATE_ROLE: {
            return {
                ...state,
                data: Array.from(new Set([...state.data, payload]))
            };
        }
        case DELETE_ROLE:
            return {
                ...state,
                data: state.data.filter(el => el.id !== payload.id)
            }
        default: {
            return state;
        }
    }
};
export default role;