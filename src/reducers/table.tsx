import { CREATE_TABLE, DELETE_TABLE, EDIT_TABLE, GET_TABLES, GET_TABLE_BY_ID } from '../constants/actionTypes';

export const initialState = {
    current: {},
    data: [],
};

const table = (state = initialState, action) => {
    const { type, payload, } = action;

    switch (type) {
        case GET_TABLES: {
            if (!payload || !Array.isArray(payload)) { return state; }
            let filtered = Array.from(new Set([...payload]));
            let sorted = filtered.sort((a, b) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0));
            return {
                ...state,
                data: sorted
            };
        }
        case GET_TABLE_BY_ID: {
            return {
                ...state,
                current: payload
            }
        }
        case EDIT_TABLE: {
            let filtered = [...state.data.filter(el => el.id !== payload.id), payload]
            let sorted = filtered.sort((a, b) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0));
            return {
                ...state,
                data: Array.from(new Set(sorted))
            };
        }
        case CREATE_TABLE: {
            return {
                ...state,
                data: Array.from(new Set([...state.data, payload]))
            };
        }
        case DELETE_TABLE:
            return {
                ...state,
                data: state.data.filter(el => el.id !== payload.id)
            }
        default: {
            return state;
        }
    }
};
export default table;