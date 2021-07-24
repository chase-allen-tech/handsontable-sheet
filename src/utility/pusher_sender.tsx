import axios from "axios";
import { PUSHER_LOCAL_URL, REDIS_LOCAL_URL } from "../constants/config";
import Pusher from 'pusher';

export const pusher_sender = payload => {
    axios.post(PUSHER_LOCAL_URL, payload)
        .then(res => { })
        .catch(err => { console.log(err) });
}

export const redis_sender = payload => {
    axios.post(REDIS_LOCAL_URL, payload)
        .then(res => { })
        .catch(err => { console.log(err) });
}