import { useRef, useState } from "react";
import { renderToString } from 'react-dom/server';

import FroalaEditorComponent from 'react-froala-wysiwyg';
import FroalaEditorView from 'react-froala-wysiwyg/FroalaEditorView';

import Froalaeditor from 'froala-editor';

Froalaeditor.RegisterCommand('showChanges', { more_btn: false });
Froalaeditor.RegisterCommand('applyAll', { more_btn: false });
Froalaeditor.RegisterCommand('removeAll', { more_btn: false });
Froalaeditor.RegisterCommand('applyLast', { more_btn: false });
Froalaeditor.RegisterCommand('removeLast', { more_btn: false });

import 'froala-editor/js/froala_editor.pkgd.min.js';
import 'froala-editor/css/froala_style.min.css';
import 'froala-editor/css/froala_editor.pkgd.min.css';
import 'froala-editor/js/plugins.pkgd.min.js';

import Markdown from 'markdown-to-jsx';
import { FROALA_LICENSE_KEY } from "../../constants/config";

const WEditor = ({ row, originalModel }) => {
    const [model, setModel] = useState(originalModel);
    const [is_markdown, setIsMarkdown] = useState(false);

    const stateRef: any = useRef();
    stateRef.current = model;

    const onBtnClick = (cmd) => {
        if (cmd[0].dataset.cmd == 'markdown') {
            setIsMarkdown(!is_markdown);
        }
    }

    return (
        <>
            <div id={"long-text-" + row} className='hidden'>
                {
                    is_markdown 
                    ? renderToString(<Markdown options={{ wrapper: 'div', forceWrapper: true }}>{model || ''}</Markdown>)
                    : model
                }
            </div>
            <h1 className="mt-6 text-xl mb-2">Long Text Editor</h1>
            <FroalaEditorComponent model={model} onModelChange={setModel}
                config={{
                    key: FROALA_LICENSE_KEY,
                    toolbarButtons: ['bold', 'italic', 'underline', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'indent', 'outdent', 'markdown', 'undo', 'redo'],
                    tag: "textarea",
                    events: {
                        initialized: function () { },
                        'commands.mousedown': onBtnClick
                    }
                }}
            />
        </>
    )
}

export default WEditor