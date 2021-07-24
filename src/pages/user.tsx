import 'handsontable/dist/handsontable.full.css'
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PencilAltIcon, UserAddIcon, UserCircleIcon, UserRemoveIcon } from '@heroicons/react/solid';

import { RootState } from '../reducers';
import Sidebar from '../components/layout/Sidebar';
import { userCreateAction, userDeleteAction, userEditAction } from '../actions/user_action';
import UserModal from '../components/user/UserModal';
import { CONST_TRUE, MODAL_EDIT, MODAL_NEW } from '../constants/config';
import { STRUCT_USER } from '../constants/struct';
import SpinnerComponent from '../components/common/spinner';

const UsersComponent = props => {

  const dispatch = useDispatch();

  const [is_modal_show, setModalShow] = useState(false);                // Flag to show modal
  const [is_modal_new_mode, setNewModalMode] = useState(MODAL_NEW);     // Flag whether show/edit mode
  const [modal_content, setModalContent] = useState(STRUCT_USER);       // modal input text

  const auth: any = useSelector((state: RootState) => state.auth);
  const users: any = useSelector((state: RootState) => state.user);
  const roles: any = useSelector((state: RootState) => state.role);
  const tables: any = useSelector((state: RootState) => state.table);
  const loaded: any = useSelector((state: RootState) => state.loading.loaded);

  //******************************** User Actions ********************************
  const onUserAddClicked = () => {
    setModalShow(true);
    setNewModalMode(MODAL_NEW);
    setModalContent(STRUCT_USER);
  }

  const onUserEditClicked = (item) => {
    setModalShow(true);
    setNewModalMode(MODAL_EDIT);
    setModalContent(Object.assign({}, item));
  }

  const onUserDeleteClicked = (item) => {
    if (!confirm('Are you going to delete this user?')) return;
    dispatch(userDeleteAction(item.id, auth.jwt));
  }

  //********************************  Modal Submit ********************************
  const onModalSubmit = (payload) => {
    payload.updated_at = Date.now();
    payload.tables = payload.tables.map(t => t.value);
    payload.superadmin = payload.superadmin == CONST_TRUE;
    payload.blocked = payload.blocked == CONST_TRUE;
    payload.confirmed = payload.confirmed == CONST_TRUE;

    if (is_modal_new_mode == MODAL_NEW) {         // New Mode 
      payload.created_at = Date.now();
      delete payload.id;
      dispatch(userCreateAction(modal_content, auth.jwt));
    } else {                                      // Edit mode
      dispatch(userEditAction(payload.id, Object.assign({}, payload), auth.jwt));
    }

    setModalContent(STRUCT_USER);
    setModalShow(false);
  }

  return (
    <>
      <div className="h-screen flex overflow-hidden bg-white">
        <Sidebar />
        <div className="flex flex-col w-0 flex-1 overflow-hidden relative">
          {
            !loaded ? <SpinnerComponent />
              :
              <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none c-bg-table">
                <div className="py-6">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-20">
                      <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
                      <button onClick={onUserAddClicked}
                        className="mt-8 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <UserAddIcon className="-ml-1.5 mr-1 h-5 w-5 text-white" aria-hidden="true" />
                        <span>Add User</span>
                      </button>

                      <UserModal
                        is_modal_show={is_modal_show}
                        setModalShow={setModalShow}
                        modal_content={modal_content}
                        setModalContent={setModalContent}

                        roles={roles}
                        tables={tables}
                        onModalSubmit={onModalSubmit}
                      />

                      <div className="flow-root mt-4">
                        <ul className="mb-8">
                          {users && users.data &&
                            users.data.map((user_data, index) => (
                              <li key={index}>
                                <div className="relative">
                                  <div className="relative flex space-x-3">
                                    <div className="min-w-0 flex-1 flex justify-between space-x-4 items-center bg-gray-100 p-4 rounded-2xl mb-4">
                                      <div>
                                        <div className="text-sm text-gray-500">
                                          <div className="flex">
                                            <div className="mr-4 flex-shrink-0 self-center">
                                              <UserCircleIcon className="h-16 w-16 text-gray-300 bg-transparent" />
                                            </div>
                                            <div>
                                              <h4 className="text-lg font-bold">{user_data.id}. {user_data.username}</h4>
                                              <div className="mt-1">
                                                <span className="mr-1">
                                                  <span className="font-semibold">EMAIL: </span>
                                                  <span>{user_data.email}</span>
                                                </span>
                                                <span>
                                                  <span className="font-semibold">ROLE: </span>
                                                  <span>{user_data.role.name}</span>
                                                </span>
                                              </div>
                                              <div className="mt-1">
                                                {
                                                  user_data.tables && user_data.tables.map(table =>
                                                    <span className="bg-red-200 rounded-lg mr-1 mb-1 leading-6 py-0.5 px-1.5 w-28 float-left overflow-ellipsis overflow-hidden whitespace-nowrap" key={table.id}>
                                                      <span>{table.id}</span>.
                                                  <span>{table.name}</span>
                                                      {/* <span>{table.unique_id}</span> */}
                                                    </span>
                                                  )
                                                }
                                              </div>
                                              {/* <p className="mt-1">
                                            {user_data.created_at} / {user_data.updated_at}
                                          </p> */}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      {
                                        user_data.email != 'testuser@testuser.com' &&
                                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                          <button onClick={() => onUserEditClicked(user_data)} className=" inline-flex items-center px-2.5 py-1.5 mr-2 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                            <PencilAltIcon className="h-5 w-5 text-white" />
                                          </button>
                                          <button onClick={() => onUserDeleteClicked(user_data)} className=" inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                            <UserRemoveIcon className="h-5 w-5 text-white" />
                                          </button>
                                        </div>
                                      }
                                    </div>
                                  </div>
                                </div>
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </main>
          }

        </div>
      </div>
    </>
  )
}

export default UsersComponent;
