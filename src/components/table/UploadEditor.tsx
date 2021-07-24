
// export default class TableRelationEditor extends Handsontable.editors.BaseEditor

import Handsontable from "handsontable";
import { useState } from "react";
import ReactDOM from 'react-dom';
import dynamic from 'next/dynamic';
import CDropZone from "./CDropZone";



export default class TableUploadEditor extends Handsontable.editors.BaseEditor {

    input_text: any = {};
    table_ref: any = {};
    relation_list: any = [];

    curr_row: any = 0;
    curr_col: any = 0;

    constructor(hotInstance, row, col, prop, TD, cellProperties) {
        super(hotInstance, row, col, prop, TD, cellProperties);
        this.table_ref = hotInstance.rootElement;
    }

    init() {
        // super.init()
    }

    // When user selects a cell that use this editor
    prepare(row, col, prop, td, originalValue, cellProperties) {
        super.prepare(row, col, prop, td, originalValue, cellProperties);
        this.input_text = originalValue;
        this.curr_row = row;
        this.curr_col = col;

        this.relation_list = cellProperties.relation_list;
    }

    // When editor should be displayed
    open() {
        // ReactEditor
        // Create Modal
        let modal = document.getElementById('long-editor-modal') || document.createElement('div');
        modal.innerHTML = '';

        // let modal = document.createElement('div');
        modal.setAttribute('class', 'cell-modal z-20-imp text-center')
        modal.setAttribute('id', 'long-editor-modal');

        // Modal Content
        let modal_content = document.createElement('div');
        let modal_editor = document.createElement('div');
        modal_content.setAttribute('class', 'cell-modal-content rounded-2xl')

        // Close Button
        let span_close = document.createElement('span');
        span_close.setAttribute('class', 'cell-close');
        span_close.innerHTML = '&times;';

        // Submit Button
        let btn_submit = document.createElement('button');
        btn_submit.setAttribute('class', 'mt-1 mr-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500');
        btn_submit.innerHTML = 'Submit';

        // Clear Button
        let btn_clear = document.createElement('button');
        btn_clear.setAttribute('class', 'mt-1 mr-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500');
        btn_clear.innerHTML = 'Clear';

        // Append
        modal_content.appendChild(span_close);
        modal_content.appendChild(modal_editor);
        modal_content.appendChild(btn_submit);
        modal_content.appendChild(btn_clear);
        modal.appendChild(modal_content);
        modal.style.display = 'block';

        ReactDOM.render(<CDropZone />, modal_editor);

        // Modal Actions
        span_close.onclick = () => { modal.style.display = 'none'; }
        btn_submit.onclick = (e) => {

            let files = globalThis.upload_files;
            globalThis.upload_files = null;
            
            this.input_text = files.length > 0 ? files : '';
            this.hot.setDataAtCell(this.curr_row, this.curr_col, this.input_text);
            modal.style.display = 'none';
        }
        btn_clear.onclick = (e) => {
            this.input_text = '';
            this.hot.setDataAtCell(this.curr_row, this.curr_col, '');
            modal.style.display = 'none';
        }

        modal_editor.onclick = (e) => {
            console.log('--enter--');
        }

        modal.onclick = (e) => {
            if (e.target == modal) { modal.style.display = 'none'; }
        }
        this.table_ref.appendChild(modal);
    }
    focus() {
    }
    close() {
    }
    getValue() {
        return this.input_text;
    }
    setValue(value) {
        this.input_text = value;
    }
}

export function TableUploadRender(instance, td, row, col, prop, files, cellProperties) {
    // console.log(files, cellProperties);
    if(files && Array.isArray(files)) {
        let arr = []; 
        for(let file of files) {
            arr.push(file.name);
        }
        td.innerText = arr;
    } else {
        td.innerText = '';
    }
}
