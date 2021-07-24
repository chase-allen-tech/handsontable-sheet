import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteCellAction, getCellsAction } from "../../actions/cell_action";
import { deleteFileAction } from "../../actions/file_action";
import { getRolesAction } from "../../actions/role_action";
import { getTablesAction } from "../../actions/table_action";
import { getUsersAction } from "../../actions/user_action";
import { getWorkspacesAction } from "../../actions/workspace_action";
import { RootState } from "../../reducers";

const PreFetch = (props) => {

    const { defaultProps, Component } = props;
    
    const dispatch = useDispatch();

    const auth: any = useSelector((state: RootState) => state.auth);

    useEffect(() => {

        // for(let i = 0; i < 36; i ++) {
        //     dispatch(deleteFileAction(i, auth.jwt));
        // }

        dispatch(getWorkspacesAction(auth.jwt));
        dispatch(getTablesAction(auth.jwt));
        dispatch(getCellsAction(auth.jwt));

        dispatch(getUsersAction(auth.jwt));
        dispatch(getRolesAction(auth.jwt));
    }, [auth])

    return <>
        <Component {...defaultProps} />
    </>
}

export default PreFetch;