import { UploadIcon } from '@heroicons/react/solid';
import Papa from 'papaparse';
import ReactFileReader from 'react-file-reader';
import { useDispatch } from 'react-redux';
import { createCellAction, deleteCellAction } from '../../actions/cell_action';
import { editTableAction } from '../../actions/table_action';
import { MSG_PROCESSING } from '../../constants/messages';
import { uuid4 } from "../../utility/uuid";
import toast_msg from '../common/toast';

const TableImportSec = (props) => {

    const {
        table,
        whole_cells,
        auth,
        setProgressBar,
    } = props;

    const dispatch = useDispatch();

    const handleFiles = async files => {

        const data = await new Response(files[0]).text();
        const rows = Papa.parse(data, { header: true }).data;

        let new_rows = rows.map(row => {
            delete row[''];
            return row;
        });

        let col_headers = Object.keys(new_rows[0]);
        let col_headers_json = col_headers.map(header => { return { _id: uuid4(), name: header, type: 'text' } });

        let table_data = [];
        for (let i = 0; i < rows.length; i++) {
            table_data.push(Object.keys(rows[i]).map(key => rows[i][key]));
        }

        let row_headers = rows.map(_ => uuid4());

        // console.log('[col_headers]', col_headers);
        // console.log('[col_headers_json]', col_headers_json)
        // console.log('[row_headers]', row_headers);
        // console.log('[table_data]', table_data);
        // console.log('[current table]', table);

        let current_cells = whole_cells.filter(cell => cell.ident.split('-')[0] == table.unique_id);

        onSave(table, current_cells, col_headers_json, row_headers, table_data);

    }

    const onSave = (current_table, current_cells, col_headers_json, row_headers, table_data) => {
        // if (!confirm("Are you going to save table data?")) return;
        console.log('-- save --');

        toast_msg(MSG_PROCESSING);

        // Update table info
        let table_payload = Object.assign({}, current_table);
        table_payload.headers = col_headers_json;
        table_payload.rows = row_headers;
        table_payload.updated_at = Date.now();
        table_payload.updated_by = auth.user.email;

        dispatch(editTableAction(current_table.id, table_payload, auth.jwt));

        // Get current cells with request body format
        let new_cells = [];
        for (let i = 0; i < row_headers.length; i++) {
            for (let j = 0; j < col_headers_json.length; j++) {
                let payload = {
                    ident: current_table.unique_id + '-' + row_headers[i] + '-' + col_headers_json[j]._id,
                    value: table_data[i][j] ? table_data[i][j].toString().substr(0, 200) : '',
                    relation: [],
                    uploads: [],
                    published_at: Date.now(),
                    created_by: auth.user.email,
                    updated_by: auth.user.email
                }
                new_cells.push(payload);
            }
        }

        new_cells.forEach(cell => {
            dispatch(createCellAction(cell, auth.jwt));
        });

        current_cells.forEach(cell => {
            dispatch(deleteCellAction(cell.id, auth.jwt));
        });

        console.log('[new cells]', new_cells);
        console.log('[del cells]', current_cells);


        // Init progress bar
        globalThis.rxRequest = 0;
        globalThis.totalRequest = new_cells.length + current_cells.length;
        console.log('[saving]', globalThis.totalRequest, globalThis.rxRequest);
        setProgressBar(true);
    }

    return (
        <ReactFileReader handleFiles={handleFiles} fileTypes={'.csv'}>
            {/* <button className="mr-2 inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-200">
                <UploadIcon className="block h-4 w-4" />&nbsp;
            </button> */}
            <button
                type="button" className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed mr-2"

            >
                <UploadIcon className="h-5 w-5 text-gray-500" />
            </button>
        </ReactFileReader>
    )

}

export default TableImportSec;