import path from 'path';
export const __dirname = path.resolve();
export const PROCESSED_DIR = path.join(__dirname, 'data/processedReceive');
export const PROCESSED_DIR_DOWN = path.join(__dirname, 'data/processedSend');
export const DATA_DIR = path.join(__dirname, 'data/Receive');
export const DATA_DIR_DOWN = path.join(__dirname, 'data/Send');
export const OUTBOX = path.join(__dirname, 'data/Outbox');
export const INBOX = path.join(__dirname, 'data/Inbox');
export const S3BUCKET_RECEIVE = 'Receive';
export const S3BUCKET_SEND = 'Send'; //before: Flock/Send
export const CARRIER='FLOK';