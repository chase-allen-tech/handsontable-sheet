import axios from "axios";
import { BASE_URL } from "../constants/config";

export const fileUploader = (file, token) => {
    return new Promise((resolve, reject) => {
        axios.post(BASE_URL + 'upload', file, {
            headers: { Authorization: 'Bearer ' + token }
        }).then(res => {
            resolve({success: true, result: res});
        }).catch(err => {
            resolve({success: false});
        });
    });
}


export const fileReader = file => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onabort = () => console.log('file reading was aborted')
        reader.onerror = () => console.log('file reading has failed')
        reader.onload = () => {
            // Do whatever you want with the file contents
            const binaryStr = reader.result
            // console.log(binaryStr)
            resolve(binaryStr);
        }
        reader.readAsArrayBuffer(file)
    });
}

export const roughSizeOfObject = object => {

    var objectList = [];

    var recurse = function (value) {
        var bytes = 0;

        if (typeof value === 'boolean') {
            bytes = 4;
        }
        else if (typeof value === 'string') {
            bytes = value.length * 2;
        }
        else if (typeof value === 'number') {
            bytes = 8;
        }
        else if
            (
            typeof value === 'object'
            && objectList.indexOf(value) === -1
        ) {
            objectList[objectList.length] = value;

            for (let i in value) {
                bytes += 8; // an assumed existence overhead
                bytes += recurse(value[i])
            }
        }

        return bytes;
    }

    return recurse(object);
}