import { useRouter } from 'next/dist/client/router';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { setUserAction } from '../../actions/user_action';
import Login from '../../pages';
import { RootState } from "../../reducers";
import SpinnerComponent from './spinner';

export const AuthProtectRoute = ({ children }) => {
    const auth = useSelector((state: RootState) => state.auth);
    const router = useRouter();
    const dispatch = useDispatch();

    const [isLoading, setLoading] = useState(true);
    const [isSetUser, setUser] = useState(true);

    useEffect(() => {
        if (isSetUser) {
            let token = localStorage.getItem('authToken');
            let auth = JSON.parse(localStorage.getItem('authUser'));
            if (token && auth) {
                dispatch(setUserAction({ jwt: token, user: auth }));
            }
            setUser(false);
        }
    }, [isSetUser]);

    useEffect(() => {
        if (auth.jwt) {
            localStorage.setItem('authToken', auth.jwt);
            localStorage.setItem('authUser', JSON.stringify(auth.user));
        }
    }, [auth]);

    useEffect(() => {
        if(!isSetUser) {
            if (!auth.jwt) {
                router.push('/');
            } 
            setLoading(false);
        }
    }, [auth, router.pathname, isSetUser]);

    const getComponent = () => {
        if(isLoading) {
            return <SpinnerComponent />;
        } else 
        if(!auth.jwt) {
            return <Login />;
        } else {
            return children;
        }
    }

    return (
        getComponent()
    )

}
