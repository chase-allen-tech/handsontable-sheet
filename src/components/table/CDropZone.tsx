import { useCallback, useMemo, useState } from "react";
import Dropzone, { useDropzone } from 'react-dropzone';

const baseStyle = {
    flex: 1,
    display: 'flex',
    // flexDirection: 'column',
    margin: '2rem 2rem 0 2rem',
    alignItems: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: 2,
    borderColor: '#eeeeee',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    color: '#bdbdbd',
    outline: 'none',
    transition: 'border .24s ease-in-out'
};

const activeStyle = {
    borderColor: '#2196f3'
};

const acceptStyle = {
    borderColor: '#00e676'
};

const rejectStyle = {
    borderColor: '#ff1744'
};

const CDropZone = props => {

    const [files, setFiles] = useState([]);

    const onDrop = useCallback((acceptedFiles) => {
        // acceptedFiles.forEach((file) => {
        //     const reader = new FileReader()

        //     reader.onabort = () => console.log('file reading was aborted')
        //     reader.onerror = () => console.log('file reading has failed')
        //     reader.onload = () => {
        //         // Do whatever you want with the file contents
        //         const binaryStr = reader.result
        //         console.log(binaryStr)
        //     }
        //     reader.readAsArrayBuffer(file)
        // });

        setFiles(acceptedFiles);
        globalThis.upload_files = acceptedFiles;

        console.log(acceptedFiles);

    }, [])

    const {
        getRootProps,
        getInputProps,
        isDragActive,
        isDragAccept,
        isDragReject
    } = useDropzone({ onDrop, noClick: false, noKeyboard: false });

    const style = useMemo(() => ({
        ...baseStyle,
        ...(isDragActive ? activeStyle : {}),
        ...(isDragAccept ? acceptStyle : {}),
        ...(isDragReject ? rejectStyle : {})
    }), [
        isDragActive,
        isDragReject,
        isDragAccept
    ]);

    return (
        <div className="container">
            {/* <input type="file" value={files} id="upload-files" readOnly /> */}
            <div {...getRootProps({ style })}>
                <input {...getInputProps()} />
                <p>Drag 'n' drop some files here, or click to select files</p>
            </div>
            <aside>
                <h4>Files</h4>
                {
                    files && files.map(file => 
                        <li key={file.path}>
                            {file.path} - {file.size} bytes
                        </li>)
                }
            </aside>
        </div>
    );
}


export default CDropZone;