import { CREATE_CELL, DELETE_CELL, EDIT_CELL, GET_CELLS, GET_CELL_BY_ID, } from '../constants/actionTypes';

export const initialState = {
    current: {},
    data: [],
};

const workspace = (state = initialState, action) => {
    const { type, payload, } = action;

    switch (type) {
        case GET_CELLS: {
            return { 
                ...state, 
                data: Array.from(new Set([...payload])) 
            };
        }
        case GET_CELL_BY_ID: {
            return {
                ...state,
                current: payload
            }
        }
        case EDIT_CELL: {
            return { 
                ...state, 
                data: [...state.data.filter(el => el.id !== payload.id), payload]
            };
        }
        case CREATE_CELL: {
            return { 
                ...state, 
                data: Array.from(new Set([...state.data, payload])) 
            };
        }
        case DELETE_CELL:
            return {
                ...state,
                data: state.data.filter(el => el.id !== payload.id)
            }
        default: {
            return state;
        }
    }
};
export default workspace;