import { v4 } from 'uuid';

function generateRoomCode() {
    let code = ''
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}


function generateUuid() {
    return v4();
}

export { generateRoomCode, generateUuid };