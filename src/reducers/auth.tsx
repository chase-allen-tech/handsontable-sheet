import { REMOVE_USER, SET_USER } from '../constants/actionTypes';
import jwt_decode from 'jwt-decode';
import toast_msg from '../components/common/toast';
import { MSG_LOGIN_FAILURE, MSG_LOGIN_SUCCESS, MSG_LOGOUT_SUCCESS } from '../constants/messages';

export const initialState = {
    jwt: '',
    user: {}
};

const contract = (state = initialState, action) => {
    const { type, payload, is_submit, } = action;
    switch (type) {
        case SET_USER: {
            try {
                let decoded: any = jwt_decode(payload.jwt)
                if (decoded.id == payload.user.id) { // Valid
                    if (payload.jwt != state.jwt && is_submit) { toast_msg(MSG_LOGIN_SUCCESS); }
                    return { jwt: payload.jwt, user: payload.user };
                } 
            } catch (err) {
            }
            toast_msg(MSG_LOGIN_FAILURE);
            return { jwt: '', user: {} }
        }
        case REMOVE_USER: {
            toast_msg(MSG_LOGOUT_SUCCESS);
            return { jwt: '', user: {} }
        }
        default: {
            return state;
        }
    }
};
export default contract;