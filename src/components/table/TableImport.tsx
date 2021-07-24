import { UploadIcon } from '@heroicons/react/solid';
import Papa from 'papaparse';
import ReactFileReader from 'react-file-reader';
import { uuid4 } from "../../utility/uuid";

const TableImport = (props) => {

    const {
        setColHeaders,
        setColHeadersJson,
        setRowHeaders,
        setTableData,
    } = props;

    const handleFiles = async files => {
        setColHeaders([]);
        setColHeadersJson([]);
        setRowHeaders([]);
        setTableData([]);

        const data = await new Response(files[0]).text();
        const rows = Papa.parse(data, { header: true }).data;

        let new_rows = rows.map(row => {
            delete row[''];
            return row;
        });
        
        let col_headers = Object.keys(new_rows[0]);
        let col_headers_json = col_headers.map(header => { return {_id: uuid4(), name: header, type: 'text'}});

        let table_data = [];
        for(let i = 0; i < rows.length; i ++) {
            table_data.push(Object.keys(rows[i]).map(key => rows[i][key]));
        }

        let row_headers = rows.map(_ => uuid4());

        setColHeaders(col_headers);
        setColHeadersJson(col_headers_json);
        setRowHeaders(row_headers);
        setTableData(table_data);
    }

    return (
        <ReactFileReader handleFiles={handleFiles} fileTypes={'.csv'}>
            <button className="mr-2 inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-200">
                <UploadIcon className="block h-4 w-4" />&nbsp;
                Import
            </button>
        </ReactFileReader>
    )

}

export default TableImport;