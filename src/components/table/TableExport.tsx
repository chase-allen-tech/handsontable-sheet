import { DownloadIcon } from "@heroicons/react/solid";
import { COL_MODE_REL, COL_MODE_UPLOAD } from "../../constants/config";

const TableExport = (props) => {

    const {
        hotInstance,
        whole_cells,
        col_headers_json,
    } = props;

    // console.log('--whole_cells--', whole_cells);

    const onExport = () => {
        if (hotInstance) {
            let sourceData = [...hotInstance.hot.getSourceData()];

            console.log('--source--', whole_cells, sourceData);

            // Convert relative data to string
            for (let i = 0; i < sourceData.length; i++) {
                let row = sourceData[i]
                for (let j = 0; j < row.length; j++) {
                    let cell = row[j];
                    if(!Array.isArray(cell)) continue;
                    if (col_headers_json[j].type == COL_MODE_REL) {
                        let arr_str = '';
                        for (let c of cell) {
                            let cell = whole_cells.find(ce => ce.ident == c);
                            if (cell) {
                                arr_str += (cell.value || 'NULL') + ',';
                            }
                        }
                        arr_str = arr_str.slice(0, -1);
                        hotInstance.hot.setDataAtCell(i, j, arr_str);
                    } else if (col_headers_json[j].type == COL_MODE_UPLOAD) {
                        let arr_str = '';
                        for (let c of cell) {
                            arr_str += (c.name || 'NULL') + ',';
                        }
                        arr_str = arr_str.slice(0, -1);
                        hotInstance.hot.setDataAtCell(i, j, arr_str);
                    }
                }
            }

            // Output excel file
            hotInstance.downloadFile('csv', {
                bom: false,
                columnDelimiter: ',',
                columnHeaders: true,
                exportHiddenRows: true,
                fileExtension: 'csv',
                filename: 'Handsontable-CSV-file_[YYYY]-[MM]-[DD]',
                mimeType: 'text/csv',
                rowDelimiter: '\r\n',
                rowHeaders: true
            });

            // Retrieve original relation array in table
            for (let i = 0; i < sourceData.length; i++) {
                let row = sourceData[i];
                for (let j = 0; j < row.length; j++) {
                    let cell = row[j];
                    if (Array.isArray(cell)) {
                        hotInstance.hot.setDataAtCell(i, j, cell);
                    }
                }
            }
        }

    }

    return (
        <>
            <button onClick={onExport} type="submit" className="mr-2 inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-200">
                <DownloadIcon className="block h-4 w-4" />&nbsp;
                Export
            </button>
        </>
    )
}

export default TableExport;