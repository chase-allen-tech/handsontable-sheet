import { COL_MODE_REL, COL_MODE_UPLOAD, CONST_COL, CONST_ROW } from "../constants/config";
import { STRUCT_FILE } from "../constants/struct";

/**
 * Get re-formated cells to the request body format of the current table cells
 * @param current_table current table structure
 * @param row_headers row_headers of the current table
 * @param col_headers_json col_headers of the current table
 * @param table_data current table cells data
 * @param auth authenticated user info
 */
export const getCellsWithRequestFormat = (current_table, row_headers, col_headers_json, table_data, auth) => {
    let current_cells = [];
    for (let i = 0; i < row_headers.length; i++) {
        for (let j = 0; j < col_headers_json.length; j++) {
            let payload = {};
            if (col_headers_json[j].type == COL_MODE_REL) {
                payload = {
                    ident: constructCellUUID(current_table.unique_id, row_headers[i], col_headers_json[j]._id),
                    value: '',
                    relation: table_data[i][j] ? table_data[i][j] : [],
                    uploads: [],
                    published_at: Date.now(),
                    created_by: auth.user.email,
                    updated_by: auth.user.email
                }
            } else if (col_headers_json[j].type == COL_MODE_UPLOAD) {
                payload = {
                    ident: constructCellUUID(current_table.unique_id, row_headers[i], col_headers_json[j]._id),
                    value: '',
                    relation: [],
                    uploads: table_data[i][j] ? table_data[i][j] : [],
                    published_at: Date.now(),
                    created_by: auth.user.email,
                    updated_by: auth.user.email
                }
            } else {
                payload = {
                    ident: constructCellUUID(current_table.unique_id, row_headers[i], col_headers_json[j]._id),
                    value: table_data[i][j] ? table_data[i][j].toString().substr(0, 200) : '',
                    relation: [],
                    uploads: [],
                    published_at: Date.now(),
                    created_by: auth.user.email,
                    updated_by: auth.user.email
                }
            }
            current_cells.push(payload);
        }
    }
    return current_cells;
}

/**
 * For new cells, construct pusher new_cell variable to be sent b/c of the file json format
 * @param new_cells new cells of the table
 */
export const getNewCellsForPusher = (new_cells) => {
    let pusher_new_cells = [];
    new_cells.forEach(cell => {
        let pusher_tmp = Object.assign({}, cell);
        // If the uploads field type is not File type, it means it's from pusher, which is already saved, so we ignore in that case.
        if (cell.uploads && cell.uploads.length && cell.uploads[0] instanceof File) {
            let pusher_upload_fields = [];
            for (let file of cell.uploads) {
                pusher_upload_fields.push(STRUCT_FILE(file)); // convert file to json for pusher new_cells
            };
            pusher_tmp.uploads = pusher_upload_fields;
        }
        pusher_new_cells.push(pusher_tmp); // Now init pusher_new_cells variable
    });
    return pusher_new_cells;
}

/**
 * For edit cells, construct pusher edit_cell variable to be sent b/c of the file json format
 * @param current_cells current table cells
 * @param edit_cells edited cells 
 */
export const getEditCellsForPusher = (current_cells, edit_cells) => {
    let pusher_edit_cells = [];
    edit_cells.forEach(cell => {
        let edited_cell = current_cells.find(c => c.ident == cell.ident);
        let pusher_tmp = Object.assign({}, cell);
        pusher_tmp.value = edited_cell.value;
        pusher_tmp.relation = edited_cell.relation;
        // If the uploads field type is not File type, it means it's from pusher, which is already saved, so we ignore in that case.
        if (edited_cell.uploads.length && edited_cell.uploads[0] instanceof File) {
            let pusher_upload_fields = [];
            for (let file of edited_cell.uploads) {
                pusher_upload_fields.push(STRUCT_FILE(file)); // convert file to json for pusher new_cells
            };
            pusher_tmp.uploads = pusher_upload_fields;
        } else {
            pusher_tmp.uploads = edited_cell.uploads;
        }
        pusher_edit_cells.push(pusher_tmp); // Now init pusher_edit_cells variable
    });
    return pusher_edit_cells;
}

/**
 * Construct UUID of cell from table_id, row_id and col_id
 * @param table_id 
 * @param row_id 
 * @param col_id 
 */
export const constructCellUUID = (table_id, row_id, col_id) => {
    return table_id + '-' + row_id + '-' + col_id;
}

/**
 * Adjust Col add and Row Add buttons according to the table size
 * @param table_size 
 */
export const adjustRowColAddButtons = (table_size) => {

    const row_btn = document.getElementById('add-row-btn');
    const col_btn = document.getElementById('add-col-btn');

    const ht_clone_top = document.getElementsByClassName('ht_clone_top')[0];
    const ht_clone_left = document.getElementsByClassName('ht_clone_left')[0];

    if (!ht_clone_top || !ht_clone_left) return;

    const top_wtHolder: any = ht_clone_top.getElementsByClassName('wtHolder')[0];
    const left_wtHolder: any = ht_clone_left.getElementsByClassName('wtHolder')[0];

    // console.log('--height--', top_wtHolder.style.height);

    const top_wtHider: any = top_wtHolder.getElementsByClassName('wtHider')[0];
    const left_wtHider: any = left_wtHolder.getElementsByClassName('wtHider')[0];

    const top_left_corner: any = document.getElementsByClassName('ht_clone_top_left_corner')[0];

    // Adjust button if the width is above the max table width
    let rw = top_wtHider.style.width;
    col_btn.style.width = '70px';
    col_btn.style.zIndex = '20';
    col_btn.style.height = (parseInt(top_left_corner.style.height) + 1).toString() + 'px';
    if (Number(rw.substring(0, rw.length - 2)) > table_size[0] - 70) {
        col_btn.style.left = (table_size[0] - 70).toString() + 'px';

        col_btn.style.top = (top_left_corner.getBoundingClientRect().top - 35) + 'px';
        col_btn.style.position = 'fixed';
    } else {
        col_btn.style.left = rw;
        col_btn.style.position = 'absolute';
        col_btn.style.top = top_left_corner.style.left;
    }


    // Adjust button if the height is above the max table height
    let rh = left_wtHider.style.height;
    row_btn.style.top = Number(rh.substring(0, rh.length - 2)) > table_size[1] - 30 ? (table_size[1] - 26).toString() + 'px' : rh;
    row_btn.style.width = (parseInt(top_left_corner.style.width) + 1).toString() + 'px';
    row_btn.style.left = top_left_corner.style.top;
}

/**
 * Get index of item with uuid in payload
 * @param flag CONST_ROW/CONST_COL
 * @param uuid 
 * @param payload rows/headers
 */
export const getIndexFromUUID = (flag, uuid, payload = []) => {
    if (flag == CONST_ROW) {
        return payload.findIndex(item => { return item === uuid });
    } else {
        return payload.findIndex((item, i) => { return item._id === uuid });
    }
}

/**
 * Get table content from table headers, rows and cells data
 * @param cells 
 * @param headers 
 * @param rows 
 */
export const getTableContents = (cells, headers = [], rows = []) => {
    let arr = Array.from({ length: rows.length }, () => Array.from({ length: headers.length }, () => null));
    if (!cells) return;
    cells.forEach(cell => {
        let ids = cell.ident.split('-');
        let row_id = getIndexFromUUID(CONST_ROW, ids[1], rows);
        let col_id = getIndexFromUUID(CONST_COL, ids[2], headers);
        if (row_id < 0 || col_id < 0) return;

        switch (headers[col_id].type) {
            case COL_MODE_REL:
                arr[row_id][col_id] = cell.relation;
                break;
            case COL_MODE_UPLOAD:
                arr[row_id][col_id] = cell.uploads;
                break;
            default:
                arr[row_id][col_id] = cell.value;
        }
        // arr[row_id][col_id] = cell.relation.length > 0 ? cell.relation : cell.value;
    });
    return arr;
    // setTableData(arr);
    // setCellLoading(false);
}