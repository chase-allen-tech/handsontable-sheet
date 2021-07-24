import { CREATE_WORKSPACE, DELETE_WORKSPACE, EDIT_WORKSPACE, GET_WORKSPACES } from '../constants/actionTypes';

export const initialState = {
    data: [],
};

const workspace = (state = initialState, action) => {
    const { type, payload, } = action;

    switch (type) {
        case GET_WORKSPACES: {
            if (!payload || !Array.isArray(payload)) { return state; }

            let filtered = Array.from(new Set([...payload]));
            let sorted = filtered.sort((a,b) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0));
            return { 
                ...state, 
                data: sorted 
            };
        }
        case EDIT_WORKSPACE: {
            let filtered = [...state.data.filter(el => el.id !== payload.id), payload]
            let sorted = filtered.sort((a,b) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0));
            return { 
                ...state, 
                data: Array.from(new Set(sorted)) 
            };
        }
        case CREATE_WORKSPACE: {
            return { 
                ...state, 
                data: Array.from(new Set([...state.data, payload])) 
            };
        }
        case DELETE_WORKSPACE:
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