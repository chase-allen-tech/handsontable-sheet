import 'handsontable/dist/handsontable.full.css'
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { PlusSmIcon, DatabaseIcon, PencilAltIcon, DocumentRemoveIcon, ViewGridIcon, EyeIcon, UploadIcon } from '@heroicons/react/solid'

import { createTableAction, editTableAction, deleteTableAction } from '../actions/table_action';
import { createWorkspaceAction, deleteWorkspaceAction, editWorkspaceAction } from '../actions/workspace_action';
import WorkSpaceModal from '../components/workspace/WorkSpaceModal';
import { RootState } from '../reducers';
import { uuid8 } from '../utility/uuid';
import Sidebar from '../components/layout/Sidebar';
import { deleteCellAction } from '../actions/cell_action';
import { MODAL_EDIT, MODAL_NEW, SUPERADMIN_ID } from '../constants/config';
import { STRUCT_WS, STRUCT_TABLE } from '../constants/struct';
import TableModal from '../components/workspace/TableModal';
import SpinnerComponent from '../components/common/spinner';
import TableImportSec from '../components/table/TableImportSec';
import ProgressBar from '../components/common/progressbar';

const WorkSpace = props => {

  const dispatch = useDispatch();

  const workspaces: any = useSelector((state: RootState) => state.workspace);
  const tables: any = useSelector((state: RootState) => state.table);
  const cells: any = useSelector((state: RootState) => state.cell.data);
  const users: any = useSelector((state: RootState) => state.user);
  const auth: any = useSelector((state: RootState) => state.auth);
  const loaded: any = useSelector((state: RootState) => state.loading.loaded);

  // console.log('--cells--', cells.length);

  const [is_modal_new_mode, setNewModalMode] = useState(MODAL_NEW);

  const [is_ws_modal_show, setIsWSModalShow] = useState(false);
  const [is_table_modal_show, setIsTableModalShow] = useState(false);
  const [ws_modal_content, setWSModalContent] = useState(STRUCT_WS);
  const [table_modal_content, setTableModalContent] = useState(STRUCT_TABLE);
  const [availUsers, setAvailUsers] = useState([]); // Avail users to be assigned to the tables except for SA
  const [user_tables, setUserTables] = useState([]); // Tables accessable by the current auth
  const [showProgressBar, setProgressBar] = useState(false);

  // Table filter - Set superadmin flag to each table data
  useEffect(() => {
    if (tables && tables.data.length != 0 && auth) {
      if (auth.user.role.id == SUPERADMIN_ID) { // In case of SA
        let tmp = [...tables.data];
        for (let i = 0; i < tmp.length; i++) {
          tmp[i]['crud_flag'] = true;
        }
        setUserTables(tmp);
      } else {
        let tmp = tables.data.filter(table => table.assignees.some(assignee => assignee.id == auth.user.id) || table.author.id == auth.user.id);
        for (let i = 0; i < tmp.length; i++) {
          if (auth.user.id == tmp[i].author.id) { // If current user is the author of this table
            tmp[i]['crud_flag'] = true;
          } else {                               // If current suer is not the author of this table
            tmp[i]['crud_flag'] = false;
          }
        }
        setUserTables(tmp);
      }
    }
  }, [tables]);

  // Remove SA from users
  useEffect(() => {
    if (users && users.data.length > 0) {
      setAvailUsers(users.data.filter(user => user.superadmin != true));
    }
  }, [users]);

  //***************************** WorkSpace Actions *****************************
  const onWorkspaceAddClicked = (e) => {
    setIsWSModalShow(true)
    setNewModalMode(MODAL_NEW);
    setWSModalContent(STRUCT_WS);
  }

  const onWorkspaceEditClicked = (workspace) => {
    setIsWSModalShow(true);
    setNewModalMode(MODAL_EDIT);
    setWSModalContent(Object.assign({}, workspace));
  }

  const onWorkspaceDeleteClicked = (ws) => {
    if (!confirm('Are you going to delete this workspace?')) return;

    let ws_tables = ws.tables;
    for (let table of ws_tables) {
      let table_cells = cells.filter(cell => cell.ident.substr(0, 8) == table.unique_id);
      table_cells.forEach(cell => {
        dispatch(deleteCellAction(cell.id, auth.jwt));
      });
      dispatch(deleteTableAction(table.id, auth.jwt));
    }
    dispatch(deleteWorkspaceAction(ws.id, auth.jwt));
  }

  const onWSModalSubmit = (payload) => {
    if (is_modal_new_mode == MODAL_NEW) { // Show mode
      payload.published_at = payload.created_at = Date.now();
      payload.updated_by = auth.user.id;
      delete payload.id;
      dispatch(createWorkspaceAction(payload, auth.jwt));
    } else { // Edit mode
      payload.published_at = Date.now();
      payload.updated_by = auth.user.id;

      dispatch(editWorkspaceAction(payload.id, payload, auth.jwt));
    }
    setIsWSModalShow(false);
    setWSModalContent(STRUCT_WS);
  }

  //***************************** Table Actions *****************************
  const onTableAddClicked = (workspace) => {
    setIsTableModalShow(true)
    setNewModalMode(MODAL_NEW);

    setWSModalContent(Object.assign({}, workspace));
    setTableModalContent(STRUCT_TABLE);
  }

  const onTableEditClicked = (workspace, table) => {
    setIsTableModalShow(true);
    setNewModalMode(MODAL_EDIT);

    setWSModalContent(Object.assign({}, workspace))
    setTableModalContent(Object.assign({}, table));
  }

  const onTableDeleteClicked = (table) => {
    if (!confirm('Are you going to delete this workspace?')) return;

    let table_cells = cells.filter(cell => cell.ident.substr(0, 8) == table.unique_id);
    table_cells.forEach(cell => {
      dispatch(deleteCellAction(cell.id, auth.jwt));
    });
    dispatch(deleteTableAction(table.id, auth.jwt));
  }

  const onTableModalSubmit = (payload) => {

    payload.workspace = ws_modal_content.id;

    if (is_modal_new_mode == MODAL_NEW) { // Show mode
      payload.unique_id = uuid8();
      payload.author = auth.user.id;
      payload.assignees = payload.assignees.map(a => a.value);
      payload.published_at = Date.now();
      payload.created_by = payload.updated_by = auth.user.id;

      dispatch(createTableAction(payload, auth.jwt));
    } else { // Edit mode
      payload.assignees = payload.assignees.map(a => a.value);
      payload.published_at = Date.now();
      payload.updated_by = auth.user.id;

      dispatch(editTableAction(payload.id, payload, auth.jwt));
    }

    setIsTableModalShow(false);
    setWSModalContent(STRUCT_WS);
    setTableModalContent(STRUCT_TABLE);
  }


  return (
    <>
      <div className="h-screen flex overflow-hidden bg-white relative">
        <ProgressBar is_show={showProgressBar} setProgressBar={setProgressBar} />

        <Sidebar />
        <div className="flex flex-col w-0 flex-1 overflow-hidden relative">
          {
            !loaded ? <SpinnerComponent />
              :
              <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none c-bg-table">
                <div className="py-6">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-20">
                      <h1 className="text-2xl font-semibold text-gray-900">Work Space</h1>
                      <button onClick={onWorkspaceAddClicked}
                        className="mt-8 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <PlusSmIcon className="-ml-1.5 mr-1 h-5 w-5 text-white" aria-hidden="true" />
                        <span>Add Workspace</span>
                      </button>

                      <WorkSpaceModal
                        is_modal_show={is_ws_modal_show}
                        setModalShow={setIsWSModalShow}
                        modal_content={ws_modal_content}
                        setModalContent={setWSModalContent}
                        onModalSubmit={onWSModalSubmit}
                      />

                      <TableModal
                        is_modal_show={is_table_modal_show}
                        setModalShow={setIsTableModalShow}
                        modal_content={table_modal_content}
                        availUsers={availUsers}
                        setModalContent={setTableModalContent}
                        onModalSubmit={onTableModalSubmit}
                      />

                      <div className="flow-root mt-4">
                        <ul className="mb-8">
                          {workspaces && workspaces.data &&
                            workspaces.data.map((workspace_data, index) => (
                              <li key={index}>
                                <div className="relative">
                                  <div className="relative flex space-x-3">
                                    <div className="min-w-0 flex-1 flex justify-between space-x-4 items-center  px-4 py-1 rounded-2xl mb-4">
                                      <div>
                                        <div className="text-sm text-gray-500">
                                          <div className="flex">
                                            <div className="mr-4 flex-shrink-0 self-center">
                                              <DatabaseIcon className="h-16 w-16 text-gray-400 bg-transparent" />
                                            </div>
                                            <div className="self-center">
                                              <h4 className="text-lg font-bold text-gray-400">{workspace_data.id} - {workspace_data.name}</h4>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                        <button onClick={() => onWorkspaceEditClicked(workspace_data)} className=" inline-flex items-center px-2.5 py-1.5 mr-2 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed" disabled={auth.user.role.id != SUPERADMIN_ID}>
                                          <PencilAltIcon className="h-5 w-5 text-white" />
                                        </button>
                                        <button onClick={() => onWorkspaceDeleteClicked(workspace_data)} className=" inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed" disabled={auth.user.role.id != SUPERADMIN_ID}>
                                          <DocumentRemoveIcon className="h-5 w-5 text-white" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <div className="relative">
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                      <div className="w-full border-t border-gray-300" />
                                    </div>
                                    <div className="relative flex justify-center">
                                      <button
                                        type="button"
                                        onClick={() => onTableAddClicked(workspace_data)}
                                        className="inline-flex items-center shadow-sm px-4 py-1.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                      >
                                        <PlusSmIcon className="-ml-1.5 mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
                                        <span>Add Table</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* ************* Table ******************** */}
                                <div className="flow-root ml-12">
                                  <ul className="mb-8">
                                    {user_tables &&
                                      user_tables.filter(item => item.workspace && item.workspace.id == workspace_data.id).map((tbl_data, index) => (
                                        <li key={index}>
                                          <div className="relative">
                                            <div className="relative flex space-x-3">
                                              <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4 items-center">
                                                <div className="mt-6 flex">
                                                  <div className="mr-4 flex-shrink-0">
                                                    <ViewGridIcon className="h-12 w-12 bg-white text-gray-300" />
                                                  </div>
                                                  <div>
                                                    <h4 className="text-lg font-bold">{tbl_data.id} - {tbl_data.name}</h4>
                                                    <p>Author: {tbl_data.author.username}</p>
                                                    {/* <p className="mt-1">
                                                    {tbl_data.published_at} - {tbl_data.updated_at}
                                                  </p> */}
                                                  </div>
                                                </div>

                                                <div className="flex text-right text-sm whitespace-nowrap text-gray-500">

                                                  <Link href={'/table/?table_id=' + tbl_data.id}>
                                                    <span className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-2 cursor-pointer">
                                                      <EyeIcon className="h-5 w-5 text-gray-500" />
                                                    </span>
                                                  </Link>

                                                  <TableImportSec 
                                                    table={tbl_data}
                                                    whole_cells={cells}
                                                    auth={auth} 
                                                    setProgressBar={setProgressBar}
                                                  />

                                                  <button
                                                    type="button" onClick={() => onTableEditClicked(workspace_data, tbl_data)}
                                                    className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed mr-2"
                                                    disabled={!tbl_data.crud_flag}
                                                  >
                                                    <PencilAltIcon className="h-5 w-5 text-gray-500" />
                                                  </button>
                                                  <button
                                                    type="button" onClick={() => onTableDeleteClicked(tbl_data)}
                                                    className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    disabled={!tbl_data.crud_flag}
                                                  >
                                                    <DocumentRemoveIcon className="h-5 w-5 text-gray-500" />
                                                  </button>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </li>
                                      ))}
                                  </ul>
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

export default WorkSpace;
