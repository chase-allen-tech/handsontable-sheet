import React, { useEffect, useRef, useState } from 'react';
import { HotTable } from '@handsontable/react';
import Handsontable from 'handsontable';
import { COL_MODE_ICON, COL_MODE_LONG, COL_MODE_REL, COL_MODE_TEXT, COL_MODE_UPLOAD, CONST_ADD, CONST_DEL, CONST_ROW, DEBUG_MODE, FA_ICON_NAMES, HANDSONTABLE_LICENSE_KEY } from '../../constants/config';
import TableRelationEditor, { RelationRenderer } from './TableRelationEditor';
import TableLongEditor, { TableLongRender } from './LongEditor';
import TableUploadEditor, { TableUploadRender } from './UploadEditor';
import toast_msg from '../common/toast';
import { MSG_PROCESS_ERROR } from '../../constants/messages';

const MyCustomTable = (props) => {

	const {
		data,
		setData,
		setModalEdit,

		colHeaders,
		rowHeaders,
		row_headers,
		whole_cells,
		relation_list,
		isTableRerender,
		table_size,

		setTableRerender,
		setColHeaders,
		setColHeadersJson,
		setRowHeaders,
		setCurrentCell,

		onAddColumnClicked,
		removeTargetCol,
		colHeadersJSON,
		onSave,
		tableRowColModify,

		setHotInstance,
		modifyTargetCells,
		adjustRowColumnButtons,
	} = props;

	const hotTableRef = useRef(null);
	const colHeadersJsonRef = useRef();
	colHeadersJsonRef.current = colHeadersJSON;

	useEffect(() => {
		if (isTableRerender && hotTableRef) {
			setTableRerender(false);
		}
	}, [isTableRerender]);

	useEffect(() => {
		if (hotTableRef && hotTableRef.current) {
			setHotInstance(hotTableRef.current.hotInstance.getPlugin('exportFile'));
		}
	}, [hotTableRef])

	const onBeforeChange = (changes, source) => {
		let d = data;
		d[changes[0][0]][changes[0][1]] = changes[0][3];

		modifyTargetCells(changes[0][0], changes[0][1], changes[0][2], changes[0][3]);
		setData(d);
	}

	const onAfterChange = () => {
		if (data.length > 0 && !globalThis.saveTimer) {
			globalThis.saveTimer = setTimeout(() => {

				// Uncomment the following in production
				if (!DEBUG_MODE) {
					onSave();
				}

				setTimeout(() => {
					globalThis.saveTimer = null;
				}, 5000);
				clearTimeout(globalThis.saveTimer);
			}, 1000);
		}
	}

	const [hotSettings, setHotSettings] = useState({ licenseKey: HANDSONTABLE_LICENSE_KEY });

	const swapArrayElements = (arr, range, targetIndex, is_col = true) => {
		if (!arr || arr.length <= 0) return;

		let result = [];

		if (Array.isArray(arr[0])) { // In case of 2 dimentional data
			if (is_col) { // In case of column
				for (let vec of arr) {
					let vec_tmp = [...vec];
					let moved = vec_tmp.splice(range[0], range.length);
					vec_tmp.splice(targetIndex, 0, ...moved);
					result.push(vec_tmp);
				}
			} else { // In case of row
				result = [...arr];
				let moved = result.splice(range[0], range.length);
				result.splice(targetIndex, 0, ...moved);
			}
		} else { // In case of 1 dimentional vector
			result = [...arr];
			let moved = result.splice(range[0], range.length);
			result.splice(targetIndex, 0, ...moved);
		}
		return result;
	}

	useEffect(() => {
		let newHotSettings = {
			licenseKey: HANDSONTABLE_LICENSE_KEY,
			// colHeaders: colHeaders,
			height: null,
			width: null,
			autoColumnSize: true,
			manualColumnResize: true,
			manualRowResize: true,
			manualColumnMove: true,
			manualRowMove: true,
			afterColumnMove: (movedRows, finalIndex, dropIndex, movePossible, orderChanged) => {
				setData(swapArrayElements(data, movedRows, finalIndex));
				setColHeaders(swapArrayElements(colHeaders, movedRows, finalIndex));
				setColHeadersJson(swapArrayElements(colHeadersJSON, movedRows, finalIndex));
				setTableRerender(true);

				// Select moved columns after move
				let range = movedRows.length > 0 ? movedRows.length - 1 : 0;
				setTimeout(() => {
					hotTableRef.current.hotInstance.selectColumns(finalIndex, finalIndex + range);
				}, 10);
			},
			afterRowMove: (movedRows, finalIndex, dropIndex, movePossible, orderChanged) => {
				setData(swapArrayElements(data, movedRows, finalIndex, false));
				setRowHeaders(swapArrayElements(row_headers, movedRows, finalIndex));
				setTableRerender(true);

				// Select moved rows after move
				let range = movedRows.length > 0 ? movedRows.length - 1 : 0;
				setTimeout(() => {
					hotTableRef.current.hotInstance.selectRows(finalIndex, finalIndex + range);
				}, 10);
			},
			afterGetColHeader: (col, TH) => {
				let colHeadersJSON: any = colHeadersJsonRef.current;
				let th_span = TH.getElementsByTagName('span')[0];
				if (colHeadersJSON[col]) {

					switch (colHeadersJSON[col].type) {
						case COL_MODE_TEXT:
							th_span.innerHTML = `<div style="display: flex; align-items: center;"><svg stroke="#BBB" enable-background="new 0 0 128 128" height="15px" id="Layer_1" version="1.1" viewBox="0 0 128 128" width="15px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M68.406,8l38.945,98.035c1.125,2.762,2.344,4.633,3.652,5.617c1.316,0.988,3.047,1.477,5.203,1.477H120V120  H71.27v-6.871h4.563c3.602,0,6.082-0.414,7.441-1.258c1.359-0.836,2.039-1.941,2.039-3.32c0-1.082-0.281-2.34-0.844-3.77  l-8.008-20.246H37.578l-3.695,9.234c-1.543,3.844-2.316,6.703-2.316,8.574c0,3.203,1.125,5.801,3.375,7.793  c2.254,1.992,5.324,2.992,9.219,2.992h3.305V120H8v-6.871h2.254c2.539,0,4.77-0.836,6.695-2.512c2.727-2.363,4.836-5.391,6.34-9.086  L60.523,8H68.406 M40.477,77.301h33.117L57.117,35.66L40.477,77.301 M68.406,0h-7.883c-3.277,0-6.223,1.996-7.434,5.043  L15.855,98.574c-1.008,2.48-2.375,4.461-4.145,5.996c-0.484,0.422-0.848,0.559-1.457,0.559H8c-4.418,0-8,3.582-8,8V120  c0,4.418,3.582,8,8,8h39.465c4.418,0,8-3.582,8-8v-6.871c0-4.418-3.582-8-8-8H44.16c-1.281,0-3-0.172-3.922-0.984  c-0.379-0.336-0.672-0.688-0.672-1.801c0.004-0.031,0.078-1.449,1.742-5.594l1.684-4.215h28.031l4.98,12.594  c-0.059,0-0.113,0-0.172,0H71.27c-4.418,0-8,3.582-8,8V120c0,4.418,3.582,8,8,8H120c4.418,0,8-3.582,8-8v-6.871c0-4.418-3.582-8-8-8  h-3.793c-0.168,0-0.305-0.008-0.414-0.016c-0.223-0.348-0.586-0.996-1.031-2.098L75.84,5.047C74.633,2,71.684,0,68.406,0L68.406,0z   M52.289,69.301l4.793-11.992l4.742,11.992H52.289L52.289,69.301z" fill="#607D8B"/></svg>&nbsp;${colHeaders[col]}</div>`;
							break;
						case COL_MODE_LONG:
							th_span.innerHTML = `<div style="display: flex; align-items: center;"><svg xmlns="http://www.w3.org/2000/svg"   viewBox="0 0 24 24" height="15px" weight="15px" fill="none" stroke="#BBB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-file-text"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>&nbsp;${colHeaders[col]}</div>`;
							break;
						case COL_MODE_ICON:
							th_span.innerHTML = `<div style="display: flex; align-items: center;"><svg width="15px" height="15px" viewBox="0 0 18 18" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="Icons" stroke="#BBB" stroke-width="1" fill="none" fill-rule="evenodd"><g id="Two-Tone" transform="translate(-613.000000, -2683.000000)"><g id="Image" transform="translate(100.000000, 2626.000000)"><g id="Two-Tone-/-Image-/-blur_linear" transform="translate(510.000000, 54.000000)"><g><polygon id="Path" points="0 0 24 0 24 24 0 24"></polygon><path d="M17,16.5 C16.72,16.5 16.5,16.28 16.5,16 C16.5,15.72 16.72,15.5 17,15.5 C17.28,15.5 17.5,15.72 17.5,16 C17.5,16.28 17.28,16.5 17,16.5 Z M9,13 C8.44771525,13 8,12.5522847 8,12 C8,11.4477153 8.44771525,11 9,11 C9.55228475,11 10,11.4477153 10,12 C10,12.5522847 9.55228475,13 9,13 Z M13,9 C12.4477153,9 12,8.55228475 12,8 C12,7.44771525 12.4477153,7 13,7 C13.5522847,7 14,7.44771525 14,8 C14,8.55228475 13.5522847,9 13,9 Z M13,17 C12.4477153,17 12,16.5522847 12,16 C12,15.4477153 12.4477153,15 13,15 C13.5522847,15 14,15.4477153 14,16 C14,16.5522847 13.5522847,17 13,17 Z M17,12.5 C16.72,12.5 16.5,12.28 16.5,12 C16.5,11.72 16.72,11.5 17,11.5 C17.28,11.5 17.5,11.72 17.5,12 C17.5,12.28 17.28,12.5 17,12.5 Z M13,13 C12.4477153,13 12,12.5522847 12,12 C12,11.4477153 12.4477153,11 13,11 C13.5522847,11 14,11.4477153 14,12 C14,12.5522847 13.5522847,13 13,13 Z M3,3 L21,3 L21,5 L3,5 L3,3 Z M5,9.5 C4.17157288,9.5 3.5,8.82842712 3.5,8 C3.5,7.17157288 4.17157288,6.5 5,6.5 C5.82842712,6.5 6.5,7.17157288 6.5,8 C6.5,8.82842712 5.82842712,9.5 5,9.5 Z M5,13.5 C4.17157288,13.5 3.5,12.8284271 3.5,12 C3.5,11.1715729 4.17157288,10.5 5,10.5 C5.82842712,10.5 6.5,11.1715729 6.5,12 C6.5,12.8284271 5.82842712,13.5 5,13.5 Z M5,17.5 C4.17157288,17.5 3.5,16.8284271 3.5,16 C3.5,15.1715729 4.17157288,14.5 5,14.5 C5.82842712,14.5 6.5,15.1715729 6.5,16 C6.5,16.8284271 5.82842712,17.5 5,17.5 Z M17,8.5 C16.72,8.5 16.5,8.28 16.5,8 C16.5,7.72 16.72,7.5 17,7.5 C17.28,7.5 17.5,7.72 17.5,8 C17.5,8.28 17.28,8.5 17,8.5 Z M9,17 C8.44771525,17 8,16.5522847 8,16 C8,15.4477153 8.44771525,15 9,15 C9.55228475,15 10,15.4477153 10,16 C10,16.5522847 9.55228475,17 9,17 Z M9,9 C8.44771525,9 8,8.55228475 8,8 C8,7.44771525 8.44771525,7 9,7 C9.55228475,7 10,7.44771525 10,8 C10,8.55228475 9.55228475,9 9,9 Z M3,19 L21,19 L21,21 L3,21 L3,19 Z" id="🔹-Primary-Color" fill="#1D1D1D"></path></g></g></g></g></g></svg>&nbsp;${colHeaders[col]}</div>`;
							break;
						case COL_MODE_REL:
							th_span.innerHTML = `<div style="display: flex; align-items: center;"><svg height="15px" width="15px" xmlns="http://www.w3.org/2000/svg"   viewBox="0 0 24 24" fill="none" stroke="#BBB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-link"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>&nbsp;${colHeaders[col]}</div>`;
							break;
						case COL_MODE_UPLOAD:
							th_span.innerHTML = `<div style="display: flex; align-items: center;"><svg fill="#BBB" height="15px" width="15px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 374.116 374.116" stroke="currentColor" style="enable-background:new 0 0 374.116 374.116;" xml:space="preserve"> <g><path d="M344.058,207.506c-16.568,0-30,13.432-30,30v76.609h-254v-76.609c0-16.568-13.432-30-30-30c-16.568,0-30,13.432-30,30 v106.609c0,16.568,13.432,30,30,30h314c16.568,0,30-13.432,30-30V237.506C374.058,220.938,360.626,207.506,344.058,207.506z"/><path d="M123.57,135.915l33.488-33.488v111.775c0,16.568,13.432,30,30,30c16.568,0,30-13.432,30-30V102.426l33.488,33.488 c5.857,5.858,13.535,8.787,21.213,8.787c7.678,0,15.355-2.929,21.213-8.787c11.716-11.716,11.716-30.71,0-42.426L208.271,8.788 c-11.715-11.717-30.711-11.717-42.426,0L81.144,93.489c-11.716,11.716-11.716,30.71,0,42.426 C92.859,147.631,111.855,147.631,123.57,135.915z"/> </g></svg>&nbsp;${colHeaders[col]}</div>`;
							break;
						default:
							th_span.innerHTML = `<div>${colHeaders[col]}</div>`;
					}
				} else if (colHeaders[col]) {
					return colHeaders[col];
				} else {
					return 'blank'
				}
			},
			colHeaders: col => {
				return colHeaders[col];
			},
			cells: function (row, col, prop) {
				var cellProperties = {};

				if (!colHeadersJSON || colHeadersJSON.length < col + 1 || !colHeadersJSON[col].hasOwnProperty('type')) return;

				switch (colHeadersJSON[col].type) {
					case COL_MODE_TEXT:
						cellProperties['editor'] = Handsontable.editors.TextEditor;
						break;
					case COL_MODE_LONG:
						cellProperties['editor'] = TableLongEditor;
						cellProperties['renderer'] = TableLongRender
						break;
					case COL_MODE_ICON:
						cellProperties['editor'] = Handsontable.editors.SelectEditor;
						cellProperties['selectOptions'] = FA_ICON_NAMES;
						break;
					case COL_MODE_REL:
						cellProperties['editor'] = TableRelationEditor;
						cellProperties['relation_list'] = relation_list.filter(item => item.table_uuid == colHeadersJSON[col].target_table_id);
						cellProperties['whole_cells'] = whole_cells;
						cellProperties['renderer'] = RelationRenderer;
						break;
					case COL_MODE_UPLOAD:
						cellProperties['editor'] = TableUploadEditor;
						cellProperties['renderer'] = TableUploadRender;
						break;
				}
				return cellProperties;
			},
			outsideClickDeselects: false,
			allowInsertRow: true,
			contextMenu: {
				items: {
					'row_above': {
						name: 'Insert row above this one (custom name)'
					},
					'row_below': {},
					'remove_row': {},
					'separator': Handsontable.plugins.ContextMenu.SEPARATOR,
					'clear_custom': {
						name: 'Clear all cells (custom)',
						callback: function () {
							this.clear();
						}
					},
					'copy': {},
					'cut': {},
				}
			},
			dropdownMenu: {
				items: [
					'col_left',
					'col_right',
					'remove_col',
					'clear_column',
					'make_read_only',
					'alignment',
					{
						key: 'modify_column',
						name: 'Modify Column',
						callback: (key, option) => {
							setTimeout(function () { setModalEdit(true); onAddColumnClicked(option[0].end.col); }, 10)
						}
					}
				]
			},
			afterOnCellMouseDown: (event, coords, TD) => {
				setCurrentCell(coords);
			},
			beforeCreateCol: (position, coords) => {
				colHeaders.splice(position, 0, 'new')
				colHeadersJSON.splice(position, 0, { name: 'new', type: 'text' })
				setTimeout(function () {
					setModalEdit(false);
					onAddColumnClicked(position);
				}, 10)
				onAfterChange();
			},
			beforeRemoveCol: (position, coords) => {
				colHeaders.splice(position, 1);
				var header = colHeadersJSON.splice(position, 1);

				setTimeout(function () {
					setModalEdit(false);
					removeTargetCol(header[0]);
					// onRemoveColHeaderJson(header[0]);
				}, 10)
				onAfterChange();
			},
			beforeCreateRow: (position, coords) => {
				setTimeout(() => { tableRowColModify(CONST_ROW, CONST_ADD, position) }, 10)
				onAfterChange();
			},
			beforeRemoveRow: (position, range) => {
				console.log(position, range);

				// Check to left at least 1 column in table
				if (row_headers.length == range) {
					toast_msg(MSG_PROCESS_ERROR);
					return false;
				}
				setTimeout(() => { tableRowColModify(CONST_ROW, CONST_DEL, position, range); }, 10)
				onAfterChange();
			},
			afterRender: () => {
				setTimeout(() => { adjustRowColumnButtons(); }, 10);
			}
		};
		setHotSettings(newHotSettings)
	}, [colHeaders, relation_list, isTableRerender])

	return <>
		<HotTable
			className="custom-handsontable"
			ref={hotTableRef}
			data={data}
			width={table_size[0]}
			height={table_size[1] - 30}
			rowHeaders={rowHeaders}
			beforeChange={onBeforeChange}
			afterChange={onAfterChange}
			settings={hotSettings}
		/>
	</>
};

// export default MyCustomTable;
const MyCustomTableMemo = React.memo(MyCustomTable);
export default MyCustomTableMemo;