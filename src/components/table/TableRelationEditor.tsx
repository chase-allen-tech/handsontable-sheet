import Handsontable from "handsontable";


export default class TableRelationEditor extends Handsontable.editors.BaseEditor {

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
        // Create Modal
        let modal = document.createElement('div');
        modal.setAttribute('class', 'cell-modal z-20-imp text-center')
        modal.innerHTML = '';

        // Modal Content
        let modal_content = document.createElement('div');
        modal_content.setAttribute('class', 'cell-modal-content rounded-2xl')

        // Close Button
        let span_close = document.createElement('span');
        span_close.setAttribute('class', 'cell-close');
        span_close.innerHTML = '&times;';

        // Choose options container
        let choose_field_dom = document.createElement('div');
        let options_dom1 = '';
        if(this.relation_list.length > 0) {
            options_dom1 = `<div class="mt-4"><b>${this.relation_list[0].table_name}</b></div>`;
            let rows = this.relation_list[0].rows;
            let curr_arr = this.input_text != '' ? this.input_text.split(',') : [];
            for (let j = 0; j < rows.length; j++) {
                options_dom1 += `
                    <div>
                        <input type="checkbox"  data-ident=${rows[j].ident} id=${rows[j].ident} ${curr_arr.indexOf(rows[j].ident) >= 0 ? 'checked': ''} />
                        <label for=${rows[j].ident}>${rows[j].value ? rows[j].value : 'NULL'}</label>
                    </div>`;
            }
        }
        
        choose_field_dom.innerHTML = options_dom1;

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
        modal_content.appendChild(choose_field_dom);
        modal_content.appendChild(btn_submit);
        modal_content.appendChild(btn_clear);
        modal.appendChild(modal_content);
        modal.style.display = 'block';

        // Modal Actions
        span_close.onclick = () => { modal.style.display = 'none'; }
        btn_submit.onclick = (e) => {
            let arr = [];
            let inputs = choose_field_dom.getElementsByTagName('input');
            for(let i = 0; i < inputs.length; i ++) {
                let item = inputs[i];
                if(item.checked) {
                    arr.push(item.dataset.ident);
                }
            }
            this.input_text = arr.length > 0 ? arr : '';

            this.hot.setDataAtCell(this.curr_row, this.curr_col, this.input_text);
            modal.style.display = 'none';
        }
        btn_clear.onclick = (e) => {
            this.input_text = '';
            this.hot.setDataAtCell(this.curr_row, this.curr_col, '');
            modal.style.display = 'none';
        }

        modal.onclick = (e) => { if (e.target == modal) { modal.style.display = 'none'; } }
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

export function RelationRenderer(instance, td, row, col, prop, value, cellProperties) {
    let documentFragment = document.createDocumentFragment();

    // console.log(cellProperties.relation_list);

    let current = cellProperties.relation_list[0];
    let whole_cells = cellProperties.whole_cells; 

    if(value && !Array.isArray(value)) value = value.split(',');
    if (Array.isArray(value)) { 
        for (let i = 0; i < value.length; i++) {
            let block = document.createElement('div');
            block.setAttribute('class', 'rel-block')
            let content = document.createElement('span');
            content.setAttribute('class', 'dropdown-item');
            let hover = document.createElement('div');
            hover.setAttribute('class', 'rel-dropdown-content');

            if(!current) return;
            let row = current.rows.filter(row => row && row.hasOwnProperty('ident') && row.ident == value[i])[0];
            
            if (!row) continue;
            content.innerHTML = row.value || 'NULL';
            block.appendChild(content);

            let table_headers = ''; //current.headers.map(header => `<th>${header.name}</th>`);
            let table_body = '';
            for (let header of current.headers) {
                table_headers += `<td class="visible-show cbg-gray-200">${header.name}</td>`;

                let cell_val = whole_cells.filter(cell => cell.ident == current.table_uuid + '-' + row.ident.split('-')[1] + '-' + header._id)[0];
                let val = '';
                if(cell_val) {
                    if ( cell_val.hasOwnProperty('relation') && cell_val.relation.length > 0) {
                        for (let rel of cell_val.relation) {
                            let rel_cell = whole_cells.filter(c => c.ident == rel)[0];
                            if(rel_cell == undefined) continue;
                            val += rel_cell.value + ' ';
                        }
                    } else {
                        val = cell_val.value;
                    }
                }

                table_body += `<td>${val}</td>`;
            }

            let hover_content = document.createElement('div');
            hover_content.innerHTML = `
                <table><caption class="whitespace-nowrap"><b>${current.table_name}</b></caption>
                    <thead>
                        <tr>
                            ${table_headers}
                        </tr>
                    </thead>
                    <tbody>
                        ${table_body}
                    </tbody>
                </table>
            `;
            hover.appendChild(hover_content);
            block.appendChild(hover);

            Handsontable.dom.empty(td);
            if (value) {
                documentFragment.appendChild(block);
            }
        }
        td.appendChild(documentFragment);
    } else {
        td.innerHTML = '';
    }
}

