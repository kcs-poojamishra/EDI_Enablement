"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CARRIER = exports.S3BUCKET_SEND = exports.S3BUCKET_RECEIVE = exports.INBOX = exports.OUTBOX = exports.DATA_DIR_DOWN = exports.DATA_DIR = exports.PROCESSED_DIR_DOWN = exports.PROCESSED_DIR = exports.__dirname = void 0;
const path_1 = __importDefault(require("path"));
exports.__dirname = path_1.default.resolve();
exports.PROCESSED_DIR = path_1.default.join(exports.__dirname, 'data/processedReceive');
exports.PROCESSED_DIR_DOWN = path_1.default.join(exports.__dirname, 'data/processedSend');
exports.DATA_DIR = path_1.default.join(exports.__dirname, 'data/Receive');
exports.DATA_DIR_DOWN = path_1.default.join(exports.__dirname, 'data/Send');
exports.OUTBOX = path_1.default.join(exports.__dirname, 'data/Outbox');
exports.INBOX = path_1.default.join(exports.__dirname, 'data/Inbox');
exports.S3BUCKET_RECEIVE = 'Receive';
exports.S3BUCKET_SEND = 'Send'; //before: Flock/Send
exports.CARRIER = 'FLOK';
//# sourceMappingURL=dataDirectory.js.map