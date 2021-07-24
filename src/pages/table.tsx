import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/dist/client/router';
import { DocumentIcon, PlusIcon, ViewGridIcon } from '@heroicons/react/solid';
// import Pusher from 'pusher';
import { default as PusherClient } from 'pusher-js';
import { default as PusherServer } from 'pusher';
import axios from 'axios';

import 'handsontable/dist/handsontable.full.css'

import { RootState } from '../reducers';
import { editTableAction } from '../actions/table_action';
import { createCellAction, deleteCellAction, editCellAction } from '../actions/cell_action';
import { uuid4 } from '../utility/uuid';

const MyCustomTable = dynamic(() => import('../components/table/MyTable'), { ssr: false });
import TableExport from '../components/table/TableExport';
import TableImport from '../components/table/TableImport';
import NewColumnModal from '../components/table/NewColumnModal';
import SpinnerComponent from '../components/common/spinner';
import toast_msg from '../components/common/toast';

import { CONST_ROW, CONST_COL, CONST_ADD, CONST_DEL, DEBUG_MODE, COL_MODE_REL, PUSHER_KEY, PUSHER_CLUSTER, PUSHER_API_ID, PUSHER_SECRET, PUSHER_LOCAL_URL, COL_MODE_UPLOAD, COL_MODE_TEXT, COL_MODE_LONG, COL_MODE_ICON } from '../constants/config';
import { MSG_BIG_DATA_CHANGED, MSG_ERROR, MSG_FILE_UPLOAD_FAIL, MSG_FILL_BLANKS, MSG_PROCESSING, MSG_PROCESS_ERROR, MSG_PUSHER_EXCEED_ERROR } from '../constants/messages';
import { STRUCT_FILE, STRUCT_TABLE, STRUCT_TABLE_CELL, STRUCT_TABLE_HEADER } from '../constants/struct';
import { createFileAction } from '../actions/file_action';
import { fileReader, fileUploader, roughSizeOfObject } from '../utility/file_tools';
import { pusher_sender, redis_sender } from '../utility/pusher_sender';
import { adjustRowColAddButtons, constructCellUUID, getCellsWithRequestFormat, getEditCellsForPusher, getNewCellsForPusher, getTableContents } from '../utility/table_functions';

const TableShow = () => {

	const router = useRouter();
	const dispatch = useDispatch();

	// const current_table: any = useSelector((state: RootState) => state.table.current);
	const tables: any = useSelector((state: RootState) => state.table);
	const whole_cells: any = useSelector((state: RootState) => state.cell.data);
	const auth: any = useSelector((state: RootState) => state.auth);
	const loaded: any = useSelector((state: RootState) => state.loading.loaded);

	const [isTableLoading, setTableLoading] = useState(true);
	const [isCellLoading, setCellLoading] = useState(true);
	const [isTableRerender, setTableRerender] = useState(true);
	const [reloadRequired, setReloadRequired] = useState(false);

	const [current_table, setCurrentTable] = useState(STRUCT_TABLE);
	const [col_headers, setColHeaders] = useState([]);
	const [col_headers_json, setColHeadersJson] = useState([]);
	const [row_headers, setRowHeaders] = useState([]);
	const [table_data, setTableData] = useState([]);
	const [relation_list, setRelationList] = useState([]);
	const [hotInstance, setHotInstance] = useState(null);

	const [current_cell, setCurrentCell] = useState({ row: -1, col: -1 });
	const [table_size, setTableSize] = useState([0, 0]);

	// console.log(col_headers_json);
	// console.log('[table]', current_table);
	// console.log('--tables--', tables); 
	// console.log('[table_data]', table_data);
	// console.log('[row_headers]', row_headers);

	const stateRef: any = useRef();
	stateRef.current = table_data;

	const currentRows: any = useRef();
	currentRows.current = row_headers;

	const currentTableUUID: any = useRef();
	currentTableUUID.current = current_table.unique_id;

	const currentWholeCells: any = useRef();
	currentWholeCells.current = whole_cells;

	/************************************** PUSHER *************************************/
	const [pusher, setPusher] = useState(null);
	useEffect(() => {
		if (!pusher) {
			let pusherClient = new PusherClient(PUSHER_KEY, { cluster: PUSHER_CLUSTER });
			let channel = pusherClient.subscribe('table');
			channel.bind('table-event', res => {
				console.log('[pusher]', res);
				if (res.is_exceed) {
					toast_msg(MSG_BIG_DATA_CHANGED);
					setReloadRequired(true);
				} else if (res.table.unique_id == currentTableUUID.current) {
					setCurrentTable(res.table);
					initRowColHeadersOfTable(res.table)
					let cells = [...currentWholeCells.current, ...res.new_cells];
					res.edit_cells.forEach(cell => {
						let ind = cells.findIndex(c => c.ident == cell.ident);
						cells.splice(ind, 1, cell);
					});

					initTableDataFromCells(cells, res.table.headers, res.table.rows);
				}
			});
			setPusher(true);
		}
	});

	/**
	 * Get the current table area dimention for <+> button
	 */
	useEffect(() => {
		const tbl_container = document.getElementById('c-table-container');
		if (!tbl_container) return;
		let tw = tbl_container.offsetWidth;
		let th = tbl_container.offsetHeight;
		if (tw != table_size[0] || th != table_size[1]) {
			setTableSize([tw, th]);
		}
	});

	/**
	 * When browser needs to reload
	 */
	useEffect(() => {
		if (!DEBUG_MODE) {
			window.onbeforeunload = function () {
				onSave();
				return;
			}
		}
	});

	/**
	 * Init table data from the whole_cells
	 */
	useEffect(() => {
		if (Object.keys(whole_cells).length != 0 && row_headers.length > 0 && isCellLoading) {
			initTableDataFromCells(whole_cells, col_headers_json, row_headers);
		}
	}, [col_headers_json, row_headers, whole_cells]);

	/**
	 * Init current table and row/col headers of the current table, and find related tables and init relation list
	 */
	useEffect(() => {
		// Set current table
		let current = tables.data.find(tbl => tbl.id == router.query.table_id);
		if (!current) return;
		setCurrentTable(current);

		// Init headers from current_table data
		if (Object.keys(current).length != 0 && isTableLoading) {
			initRowColHeadersOfTable(current);
			setTableLoading(false);
		}

		// Set relational Data for table relation step.
		let other_tbls = tables.data.filter(table => table.id != current.id);
		other_tbls = other_tbls.map(table => { return { table_uuid: table.unique_id, table_name: table.name, rows: table.rows, headers: table.headers } });

		let arr = [];
		other_tbls.forEach(tbl => {
			let tmp = Object.assign({}, tbl);

			let first_cols = []
			for (let row_id of tmp.rows) {
				first_cols.push(whole_cells.find(cell => cell.ident == tmp.table_uuid + '-' + row_id + '-' + tmp.headers[0]._id));
			}
			tmp['rows'] = first_cols;
			tmp['cells'] = whole_cells.filter(cell => cell.ident.split('-')[0] == tmp.table_uuid);
			arr.push(tmp);
		});

		setRelationList(arr);
	}, [tables, whole_cells])

	const initTableDataFromCells = (cells, headers = [], rows = []) => {
		setTableData(getTableContents(cells, headers, rows));
		setCellLoading(false);
	}

	/**
	 * Init row, col headers array from the current table structure
	 * @param table current table
	 */
	const initRowColHeadersOfTable = (table) => {
		setColHeadersJson(table.headers)
		setColHeaders(table.headers.map(item => item.name));
		if (table.rows.length) {
			setRowHeaders(table.rows);
		} else { // Init first row if there is no row for the first time
			tableRowColModify(CONST_ROW, CONST_ADD, 0);
		}
	}

	/**
	 * Modify ROWS and COLS according to mode and range of items to modify
	 * @param direction CONST_ROW / CONST_COL
	 * @param mode 		CONST_ADD / CONST_DEL
	 * @param id 		start position
	 * @param range 	number of items to modify
	 */
	const tableRowColModify = (direction, mode, id, range = 1) => {
		let old_tbl = [...stateRef.current];
		let new_tbl = [];
		let old_cols = col_headers;
		let old_rows = [...currentRows.current];

		if (direction == CONST_ROW) {
			if (mode == CONST_ADD) {
				old_rows.splice(id, 0, uuid4())
				setRowHeaders(old_rows);

				new_tbl = old_tbl;
				if (old_rows.length != old_tbl.length) {
					new_tbl.push(col_headers.map(_ => ''));
				}

			} else {
				old_rows.splice(id, range)
				setRowHeaders(old_rows);
				new_tbl = old_tbl;
			}
		} else if (direction == CONST_COL) { // Column Modify
			if (mode == CONST_ADD) {
				if (old_cols.length > id || is_modal_edit) { // If create inside of cols or in edit mode
					removeTargetCol(col_headers_json[id]);
					old_cols.splice(id, range, modal_content);
					setColHeaders(old_cols);

					col_headers_json.splice(id, range, {
						name: modal_content,
						type: modal_category,
						_id: uuid4(),
						target_table_id: modal_target_table_id,
						target_col_name: modal_target_col_name,
						target_col_uuid: modal_category == COL_MODE_REL ? uuid4() : ""
					});

					if (is_modal_edit) {
						setTableRerender(true);
						setModalEdit(false);
					}

					return;
				} else { // If create new col with the right most
					old_cols.splice(id, 0, modal_content);
					setColHeaders(old_cols);
					for (let i = 0; i < old_tbl.length; i++) {
						let col: any = old_tbl[i];
						if (!col) continue;
						col.splice(id, 0, null);
						new_tbl.push(col);
					}
					let old_cols_json = col_headers_json;
					old_cols_json.splice(id, 0, {
						name: modal_content,
						type: modal_category,
						_id: uuid4(),
						target_table_id: modal_target_table_id,
						target_col_name: modal_target_col_name,
						target_col_uuid: modal_category == COL_MODE_REL ? uuid4() : ""
					});
				}
			} else {
				old_cols.splice(id, range)
				setColHeaders(old_cols);
				for (let i = 0; i < old_tbl.length; i++) {
					let col = old_tbl[i];
					col.splice(id, range)
					new_tbl.push(col);
				}
			}
		}
		setTableData(new_tbl);
	}

	// ******************************** Custom Event **************************************
	const onTest = () => {

		redis_sender({
			key: 'my-key'
		});

		// console.log('--table_data--');
		// console.table(table_data);
		// // console.log('[cols]', col_headers);
		// console.table('[col_headers_json]', col_headers_json);
		// console.log('[rows]', row_headers);
		// console.log('[whole_cells]', whole_cells);
		// console.log('--user--', auth);
		// console.log('[Position]', position_to_insert);
		// console.log('[modal_ref]', modal_target_table_id)
	}

	/**
	 * From the modal input, add new column in the current table
	 * @param id Position to add new column
	 */
	const onAddColumnClicked = (id) => {
		setModalShow(true)
		setPositionToInsert(id)
		setModalContent('');
		setModalCategory(COL_MODE_TEXT);
		setModalTargetTableId('');
		setModalTargetColName('');
	}

	/**
	 * Move ROW/COL add buttons to adjust to the table data
	 */
	const adjustRowColumnButtons = () => {
		adjustRowColAddButtons(table_size);
	}

	/**
	 * If relation column is added, add column and cells to the corresponding table
	 * @param row_idx working row id of the current table
	 * @param col_idx working col id of the current table
	 * @param prevCellIds previous values of the current cell
	 * @param nextCellIds modified values of the current cell
	 */
	const modifyTargetCells = (row_idx, col_idx, prevCellIds, nextCellIds) => {
		console.log(row_idx, col_idx, prevCellIds, nextCellIds);

		let c_table_id = current_table.unique_id;
		let c_row_id = row_headers[row_idx];
		let c_col = col_headers_json[col_idx];
		let c_col0 = col_headers_json[0]

		if (c_col.type != COL_MODE_REL) return;

		prevCellIds = Array.isArray(prevCellIds) ? prevCellIds : [];
		nextCellIds = Array.isArray(nextCellIds) ? nextCellIds : [];

		let t_new_cell_ids = nextCellIds.filter(nextId => prevCellIds.every(prevId => prevId !== nextId));
		let t_del_cell_ids = prevCellIds.filter(prevId => nextCellIds.every(nextId => nextId !== prevId));

		// Add item to relation to the target cell
		t_new_cell_ids.forEach(cell_id => {
			let t_cell = whole_cells.find(c => c.ident == constructCellUUID(c_col.target_table_id, cell_id.split('-')[1], c_col.target_col_uuid));
			if (t_cell == undefined) return;
			if (t_cell.relation.indexOf(constructCellUUID(c_table_id, c_row_id, c_col0._id)) < 0) {
				t_cell.relation.push(constructCellUUID(c_table_id, c_row_id, c_col0._id));
			}
			dispatch(editCellAction(t_cell.id, t_cell, auth.jwt));
		});

		// Remove item to relation to the target cell
		t_del_cell_ids.forEach(cell_id => {
			let t_cell = whole_cells.find(c => c.ident == constructCellUUID(c_col.target_table_id, cell_id.split('-')[1], c_col.target_col_uuid));

			if (t_cell == undefined) return;
			let relations = [];
			for (let i = 0; i < t_cell.relation.length; i++) {
				if (t_cell.relation[i] == constructCellUUID(c_table_id, c_row_id, c_col0._id)) continue;
				relations.push(t_cell.relation[i]);
			}
			t_cell.relation = relations;
			dispatch(editCellAction(t_cell.id, t_cell, auth.jwt));
		});
	}

	/**
	 * Based on the current RELATION header info, remove corresponding target table column and cells
	 * @param header Current header json
	 */
	const removeTargetCol = header => {
		if (!header || !header.hasOwnProperty('type') || header.type != COL_MODE_REL) return;

		let target_table = tables.data.find(table => table.unique_id == header.target_table_id);
		if (!target_table) return;

		// Update target table headers
		let headers = [];
		for (let h of target_table.headers) {
			if (header.target_col_uuid == h._id) continue;
			headers.push(h);
		}
		target_table.headers = headers;
		dispatch(editTableAction(target_table.id, target_table, auth.jwt));

		// Delete all the corresponding cells
		for (let row_id of target_table.rows) {
			let cell_uuid = constructCellUUID(header.target_table_id, row_id, header.target_col_uuid);
			let cell = whole_cells.find(c => c.ident == cell_uuid);
			if (!cell) continue;
			dispatch(deleteCellAction(cell.id, auth.jwt));
		}

	}

	const onSave = async () => {
		// if (!confirm("Are you going to save table data?")) return;
		console.log('-- save --');
		if (reloadRequired) return; // Should refresh without saving b/c there is big change in server

		toast_msg(MSG_PROCESSING);

		// Update table info
		let table_payload = Object.assign({}, current_table);
		table_payload.headers = col_headers_json;
		table_payload.rows = row_headers;
		table_payload.updated_at = Date.now();
		table_payload.updated_by = auth.user.email;

		dispatch(editTableAction(current_table.id, table_payload, auth.jwt));

		// Update target table info if any change in 'rel' header of the current table
		let rel_headers = col_headers_json.filter(header => header.type == COL_MODE_REL);
		rel_headers.forEach(header => {
			let target_table = tables.data.find(table => table.unique_id == header.target_table_id);

			if (target_table) { // If target table exists
				let target_column = target_table.headers.filter(h => h._id == header.target_col_uuid);
				if (target_column.length == 0) { // If target table has no rel column to this current_table
					target_column = STRUCT_TABLE_HEADER(header.target_col_uuid, header.target_col_name, header.type, header._id, header.name, current_table.unique_id)

					// Now edit the target table
					target_table.headers.push(target_column);
					dispatch(editTableAction(target_table.id, target_table, auth.jwt));

					// Create target table column's cells
					target_table.rows.forEach(row_id => {
						let cell = STRUCT_TABLE_CELL(constructCellUUID(target_table.unique_id, row_id, target_column._id), '', [], Date.now(), auth.user.email, auth.user.email)
						dispatch(createCellAction(cell, auth.jwt));
					});
				}
			}
		});

		// Get current cells with request body format
		let current_cells = getCellsWithRequestFormat(current_table, row_headers, col_headers_json, table_data, auth);

		// Find new cells and create new cells /////////////////////////////
		let new_cells = current_cells.filter(cell => whole_cells.every(e => e.ident !== cell.ident));
		let pusher_new_cells = getNewCellsForPusher(new_cells);

		// Perform server update for new_cells
		new_cells.forEach(async cell => {
			let tmp = Object.assign({}, cell);

			// If the uploads field type is not File type, it means it's from pusher,
			// which is already saved, so we ignore in that case.
			if (cell.uploads && cell.uploads.length && !(cell.uploads[0] instanceof File)) return;

			// If there is uploads fields edited, then upload them first
			let upload_ids = [];
			for (let file of tmp.uploads) {
				let formData = new FormData();
				formData.append('files', file, file.name);
				let res: any = await fileUploader(formData, auth.jwt);
				if (!res.success) {
					toast_msg(MSG_FILE_UPLOAD_FAIL);
				} else {
					if (res.result.hasOwnProperty('data') && Array.isArray(res.result.data) && res.result.data.length > 0 && res.result.data[0].hasOwnProperty('id')) {
						upload_ids.push(res.result.data[0].id);
					}
				}
			};
			tmp.uploads = upload_ids;
			dispatch(createCellAction(tmp, auth.jwt));
		});

		console.log('--new--', pusher_new_cells);

		// Find changed cells and edit /////////////////////////////////////////////////////
		let edit_cells = whole_cells.filter(cell => current_cells.some(e => e.ident === cell.ident && (e.value != cell.value || JSON.stringify(e.relation) != JSON.stringify(cell.relation) || JSON.stringify(e.uploads) != JSON.stringify(cell.uploads))));
		let pusher_edit_cells = getEditCellsForPusher(current_cells, edit_cells);

		// Server update for edit_cells
		edit_cells.forEach(async cell => {
			let edited_cell = current_cells.find(c => c.ident == cell.ident);
			let curr = Object.assign({}, cell);
			curr.value = edited_cell.value;
			curr.relation = edited_cell.relation;

			// If the uploads field type is not File type, it means it's from pusher,
			// which is already saved, so we ignore in that case.
			if (cell.uploads.length && !(cell.uploads[0] instanceof File)) return;

			// If there is uploads fields edited, then upload them first
			let upload_ids = [];
			for (let file of edited_cell.uploads) {
				let formData = new FormData();
				formData.append('files', file, file.name);
				let res: any = await fileUploader(formData, auth.jwt);
				if (!res.success) {
					toast_msg(MSG_FILE_UPLOAD_FAIL);
				} else {
					if (res.result.hasOwnProperty('data') && Array.isArray(res.result.data) && res.result.data.length > 0 && res.result.data[0].hasOwnProperty('id')) {
						upload_ids.push(res.result.data[0].id);
					}
				}
			};

			curr.uploads = upload_ids;
			dispatch(editCellAction(cell.id, curr, auth.jwt));
		});

		console.log('--edit--', edit_cells, pusher_edit_cells);

		// Find deleted cells and delete //////////////////////////////////
		let del_cells = whole_cells.filter(cell => cell.ident.split('-')[0] == current_table.unique_id).filter(cell => current_cells.every(e => e.ident !== cell.ident));
		del_cells.forEach(cell => {
			dispatch(deleteCellAction(cell.id, auth.jwt));
		});

		console.log('--del--', del_cells);

		// Pusher action to send broadcast
		let pusher_payload_size = roughSizeOfObject(table_payload) + roughSizeOfObject(pusher_new_cells) + roughSizeOfObject(pusher_edit_cells);
		if (pusher_payload_size > 9000) {
			toast_msg(MSG_PUSHER_EXCEED_ERROR);
			pusher_sender({
				is_exceed: true, table: table_payload,
			});
		} else {
			pusher_sender({
				is_exceed: false,
				table: table_payload,
				new_cells: pusher_new_cells,
				edit_cells: pusher_edit_cells
			});
			// axios.post(PUSHER_LOCAL_URL, {  }).then(res => { }).catch(err => { console.log(err) });
		}
	}

	// ******************************** Modal **************************************
	const [is_modal_show, setModalShow] = useState(false);
	const [is_modal_edit, setModalEdit] = useState(false);
	const [modal_content, setModalContent] = useState('');
	const [modal_category, setModalCategory] = useState('text');
	const [modal_target_table_id, setModalTargetTableId] = useState('');
	const [modal_target_col_name, setModalTargetColName] = useState('');
	const [position_to_insert, setPositionToInsert] = useState(null);

	const onModalSubmit = () => {
		if (modal_content == '' || (modal_category == COL_MODE_REL && (modal_target_table_id == '' || modal_target_col_name == ''))) {
			toast_msg(MSG_FILL_BLANKS);
			return;
		}
		if (position_to_insert == null)
			tableRowColModify(CONST_COL, CONST_ADD, col_headers.length);
		else {
			tableRowColModify(CONST_COL, CONST_ADD, position_to_insert);
			setPositionToInsert(null);
		}
		setModalShow(false);
	}

	const onModalCancel = () => {
		if (!is_modal_edit) {
			col_headers_json.splice(position_to_insert, 1);

			// Retrieve col headers
			let old_cols = col_headers;
			old_cols.splice(position_to_insert, 1);

			// Retrieve table data
			let new_table_data = [];
			for (let i = 0; i < table_data.length; i++) {
				let dd = table_data[i];
				dd.splice(position_to_insert, 1);
				new_table_data.push(dd);
			}
			setTableData(new_table_data);
			setColHeaders(old_cols);
		}
		setModalShow(false);
	}

	// ******************************** Render **************************************
	return (
		<>

			<NewColumnModal
				is_modal_edit={is_modal_edit}
				is_modal_show={is_modal_show}
				setModalShow={setModalShow}
				modal_content={modal_content}
				setModalContent={setModalContent}
				modal_category={modal_category}
				setModalCategory={setModalCategory}
				modal_target_table_id={modal_target_table_id}
				setModalTargetTableId={setModalTargetTableId}
				modal_target_col_name={modal_target_col_name}
				setModalTargetColName={setModalTargetColName}

				onModalSubmit={onModalSubmit}
				onModalCancel={onModalCancel}
				relation_list={relation_list}
			/>

			<div className="text-2xl text-center bg-table-title p-4 text-white font-bold flex">
				<div>
					<ViewGridIcon className="block h-9 w-9" />
				</div>
				<div className="flex-1">
					{current_table.id}  {current_table.name}
				</div>
			</div>


			<div className="flex py-1 bg-white">


				<TableExport
					hotInstance={hotInstance}
					whole_cells={whole_cells}
					col_headers_json={col_headers_json} />
				{/* <TableImport
					setColHeaders={setColHeaders}
					setColHeadersJson={setColHeadersJson}
					setRowHeaders={setRowHeaders}
					setTableData={setTableData}
				/> */}

				{
					DEBUG_MODE && <>
						<button onClick={onTest} type="submit" className="mx-2 inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-200">View Data</button>
						<button onClick={onSave} type="submit" className="mr-2 inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-200">
							<DocumentIcon className="block h-4 w-4" />
								Save
						</button>
					</>
				}

			</div>


			<div className="flex bg-table flex-1 min-h-0 relative">
				{
					(!isTableLoading && loaded) ? (
						<div className="c-table-container w-full" id="c-table-container">
							<button onClick={() => tableRowColModify(CONST_ROW, CONST_ADD, table_data.length)} type="submit" className="absolute h-6 m-auto justify-center inline-flex items-center border border-gray-300 text-xs font-medium text-gray-700 bg-white hover:bg-gray-200 z-10" id="add-row-btn">
								<PlusIcon className="block h-4 w-4" />
							</button>

							<button onClick={() => onAddColumnClicked(col_headers.length)} type="submit" className="absolute w-16 m-auto justify-center inline-flex items-center border border-gray-300 text-xs font-medium text-gray-700 bg-white hover:bg-gray-200 z-10" id="add-col-btn">
								<PlusIcon className="block h-4 w-4" />
							</button>

							<MyCustomTable
								is_modal_show={is_modal_show}
								isTableRerender={isTableRerender}
								setTableRerender={setTableRerender}

								data={table_data}
								colHeaders={col_headers}
								colHeadersJSON={col_headers_json}
								rowHeaders={true}
								row_headers={row_headers}
								relation_list={relation_list}
								whole_cells={whole_cells}
								table_size={table_size}

								setHotInstance={setHotInstance}
								setData={setTableData}
								setColHeaders={setColHeaders}
								setColHeadersJson={setColHeadersJson}
								setRowHeaders={setRowHeaders}
								setCurrentCell={setCurrentCell}

								onAddColumnClicked={onAddColumnClicked}
								modifyTargetCells={modifyTargetCells}
								setModalEdit={setModalEdit}

								removeTargetCol={removeTargetCol}
								tableRowColModify={tableRowColModify}

								onSave={onSave}

								adjustRowColumnButtons={adjustRowColumnButtons}
							/>
						</div>
					) : <SpinnerComponent />
				}
			</div>

			{/* ****************** Status Bar ****************************** */}
			<div className="fixed flex bg-white right-0 bottom-1 h-6 w-full border-t-2 border-gray-300">
				<div className="flex mr-4 ml-auto">
					<div className="mr-2">Coordinate:</div>
					<div className="w-20 bg-gray-100 text-center shadow-inner">( {current_cell.row != null ? current_cell.row : 'Null'} , {current_cell.col != null ? current_cell.col : 'NULL'} )</div>
				</div>
				<div className="flex mr-4">
					<div className="mr-2">Column Type:</div>
					<div className="w-20 bg-gray-100 text-center shadow-inner">
						{
							current_cell.row != null && current_cell.col != null && current_cell.col >= 0 ?
								col_headers_json[current_cell.col].type == COL_MODE_TEXT && 'TEXT' ||
								col_headers_json[current_cell.col].type == COL_MODE_LONG && 'LONG TEXT' ||
								col_headers_json[current_cell.col].type == COL_MODE_ICON && 'ICON' ||
								col_headers_json[current_cell.col].type == COL_MODE_REL && 'RELATION' ||
								col_headers_json[current_cell.col].type == COL_MODE_UPLOAD && 'UPLOAD'
								: 'NULL'
						}
					</div>
				</div>
				<div className="flex mr-4">
					<div className="mr-2">Value Type:</div>
					<div className="w-20 bg-gray-100 text-center shadow-inner">
						{
							current_cell.row >= 0 && current_cell.col >= 0 && current_cell.col >= 0 && current_cell.row >= 0 && table_data[current_cell.row][current_cell.col] ?
								Array.isArray(table_data[current_cell.row][current_cell.col]) && 'ARRAY' ||
								Object.prototype.toString.call(table_data[current_cell.row][current_cell.col]) == '[object String]' && 'STRING'
								: 'NULL'
						}
					</div>
				</div>
				<div className="flex mr-1">
					<div className="mr-2">Count:</div>
					<div className="w-20 bg-gray-100 text-center shadow-inner">
						{
							current_cell.row >= 0 && current_cell.col >= 0 && current_cell.row >= 0 && current_cell.col > 0 && table_data[current_cell.row][current_cell.col] ?
								table_data[current_cell.row][current_cell.col].length
								: 'NULL'
						}
					</div>
				</div>
			</div>
		</>
	)
}

export default TableShow;

