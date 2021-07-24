import { combineReducers } from 'redux';
import auth, { initialState as authState } from './auth';
import workspace, { initialState as workspaceState } from './workspace';
import table, { initialState as tableState } from './table';
import cell, { initialState as cellState } from './cell';
import user, { initialState as userState } from './user';
import role, { initialState as roleState } from './role';
import loading, { initialState as loadingState} from './loading';

export const initialState = {
  auth: authState, 
  workspace: workspaceState, 
  table: tableState, 
  cell: cellState,
  user: userState,
  role: roleState,
  loading: loadingState,
};

const rootReducer = combineReducers({
  auth, workspace, table, cell, user, role, loading
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>
