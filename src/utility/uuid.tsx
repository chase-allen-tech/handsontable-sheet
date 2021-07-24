import crypto from 'crypto'

export const uuid4 = () => {
    return crypto.randomBytes(2).toString('hex');
}

export const uuid8 = () => {
    return crypto.randomBytes(4).toString('hex');
}