import { useRouter } from 'next/dist/client/router';
import { useSelector } from "react-redux";
import { SUPERADMIN_ID } from '../../constants/config';
import { RootState } from "../../reducers";
import DefaultErrorPage from 'next/error';

const RoleProtectRoute = ({ children }) => {
    const auth = useSelector((state: RootState) => state.auth);
    const router = useRouter();

    // Super admin routes
    const sa_routes = [
        '/user',
    ];

    const getComponent = () => {
        if(auth && auth.user.hasOwnProperty('role') && auth.user.role.id != SUPERADMIN_ID && sa_routes.find(route => route == router.pathname)) {
            return <DefaultErrorPage statusCode={404} />;
        } else {
            return children;
        }
    }

    return (
        getComponent()
    )

}

export default RoleProtectRoute;
