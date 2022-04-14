"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3FileSyncServices = exports.initialize = void 0;
const AWS = __importStar(require("@aws-sdk/client-s3"));
const s3_sync_client_1 = __importDefault(require("s3-sync-client"));
const fs_1 = __importDefault(require("fs"));
const chokidar_1 = __importDefault(require("chokidar"));
const path_1 = __importDefault(require("path"));
const getFileName_1 = __importDefault(require("../utils/getFileName"));
const dataDirectory_js_1 = require("../constants/dataDirectory.js");
require("../config/config.js");
// Function to initialize and create directories if they do not exist
function initialize() {
    // Create all directories if they do not exist
    if (!fs_1.default.existsSync(dataDirectory_js_1.PROCESSED_DIR)) {
        fs_1.default.mkdirSync(dataDirectory_js_1.PROCESSED_DIR);
        console.log('Folder Created Successfully: ', dataDirectory_js_1.PROCESSED_DIR);
    }
    if (!fs_1.default.existsSync(dataDirectory_js_1.PROCESSED_DIR_DOWN)) {
        fs_1.default.mkdirSync(dataDirectory_js_1.PROCESSED_DIR_DOWN);
        console.log('Folder Created Successfully: ', dataDirectory_js_1.PROCESSED_DIR_DOWN);
    }
    if (!fs_1.default.existsSync(dataDirectory_js_1.DATA_DIR)) {
        fs_1.default.mkdirSync(dataDirectory_js_1.DATA_DIR);
        console.log('Folder Created Successfully: ', dataDirectory_js_1.DATA_DIR);
    }
    if (!fs_1.default.existsSync(dataDirectory_js_1.DATA_DIR_DOWN)) {
        fs_1.default.mkdirSync(dataDirectory_js_1.DATA_DIR_DOWN);
        console.log('Folder Created Successfully: ', dataDirectory_js_1.DATA_DIR_DOWN);
    }
}
exports.initialize = initialize;
// Function to synchronize S3 bucket with local file system
// and vice versa. Inbound files are renamed using information
// obtained by parsing the files
function s3FileSyncServices() {
    const AWS_REGION = process.env.AWS_REGION_NAME;
    const AWS_BUCKET = process.env.AWS_S3_BUCKET_NAME;
    const ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
    const SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
    const { TransferMonitor } = s3_sync_client_1.default;
    const { S3Client } = AWS;
    let s3Credential = {
        region: AWS_REGION,
    };
    if ((ACCESS_KEY_ID && ACCESS_KEY_ID != "" && ACCESS_KEY_ID != "undefined") && (SECRET_ACCESS_KEY && SECRET_ACCESS_KEY != "" && SECRET_ACCESS_KEY != "undefined")) {
        s3Credential.credentials = { accessKeyId: ACCESS_KEY_ID, secretAccessKey: SECRET_ACCESS_KEY };
    }
    const s3Config = new S3Client(s3Credential);
    const syncClient = new s3_sync_client_1.default({ client: s3Config });
    const pollReceive = chokidar_1.default.watch(dataDirectory_js_1.INBOX, { ignored: /^\./, awaitWriteFinish: true, persistent: true });
    const pollSend = chokidar_1.default.watch(dataDirectory_js_1.DATA_DIR_DOWN, { ignored: /^\./, awaitWriteFinish: true, persistent: true });
    let count;
    //PollReceive polls the local Inbox folder for incoming messages/files and transfers them to the S3 bucket
    pollReceive
        .on('add', function (fileName) {
        const srcFileName = path_1.default.basename(fileName);
        const processedFileName = dataDirectory_js_1.PROCESSED_DIR + '/' + srcFileName;
        // Here we have to process the files change the file name
        // Check if we have already processed this file
        fs_1.default.access(processedFileName, fs_1.default.F_OK, (err) => {
            if (err) {
                const result = (0, getFileName_1.default)(fileName);
                count = 1;
                let foundFile = true;
                let altFileName = dataDirectory_js_1.DATA_DIR + '/' + result.data.OID + '-' + result.data.setId + '-' + result.data.shipmentId + '.edi';
                while (foundFile) {
                    try {
                        fs_1.default.accessSync(altFileName, fs_1.default.F_OK);
                        // Increment counter and change fileName if file exists
                        altFileName = dataDirectory_js_1.DATA_DIR + '/' + result.data.OID + '-' + result.data.setId + '-' + result.data.shipmentId + '-' + count + '.edi';
                        count = count + 1;
                    }
                    catch (error) {
                        foundFile = false;
                    }
                }
                const dstFileName = altFileName;
                console.log('File', srcFileName, " Added");
                fs_1.default.copyFile(fileName, dstFileName, (copyError) => {
                    if (copyError === null) {
                        // TODO: This is inefficient better to create a 0 byte file
                        fs_1.default.copyFile(fileName, processedFileName, (err) => {
                        });
                    }
                });
            }
        });
    })
        .on('change', function (processedFileName) { console.log('File', processedFileName, 'has been changed'); })
        .on('unlink', function (processedFileName) { console.log('File', processedFileName, 'has been removed'); })
        .on('error', function (error) { console.error('Error happened', error); });
    //PollSend polls the S3 bucket for outbound messages/files and copies them to the Outbox
    pollSend
        .on('add', function (fileName) {
        const srcFileName = path_1.default.basename(fileName);
        const result = (0, getFileName_1.default)(fileName);
        const dstFileName = dataDirectory_js_1.OUTBOX + '/' +
            result.data.OID + '/' + result.data.OID + '-' +
            result.data.setId + '-' + result.data.shipmentId + '.edi';
        const processedFileName = dataDirectory_js_1.PROCESSED_DIR_DOWN + '/' + srcFileName;
        // Got a new file from S3 dispatch it to OpenAS2
        // Check if we have already processed this file
        fs_1.default.access(processedFileName, fs_1.default.F_OK, (err) => {
            if (err) {
                console.log('File', srcFileName, " Added");
                console.log('File', dstFileName, " Added To");
                fs_1.default.copyFile(fileName, dstFileName, (err) => {
                    if (err === null) {
                        // TODO: This is inefficient better to create a 0 byte file
                        fs_1.default.copyFile(fileName, processedFileName, (err) => {
                        });
                    }
                });
            }
        });
    })
        .on('change', function (processedFileName) { console.log('File', processedFileName, 'has been changed'); })
        .on('unlink', function (processedFileName) { console.log('File', processedFileName, 'has been removed'); })
        .on('error', function (error) { console.error('Error happened', error); });
    let startMonitor = () => __awaiter(this, void 0, void 0, function* () {
        const monitor = new TransferMonitor();
        monitor.on('progress', (progress) => {
            count = progress.count.current;
        });
        yield syncClient.sync(dataDirectory_js_1.DATA_DIR, `s3://${AWS_BUCKET}/${dataDirectory_js_1.S3BUCKET_RECEIVE}/${dataDirectory_js_1.CARRIER}`, { del: false, maxConcurrentTransfers: 2, monitor });
        yield syncClient.sync(`s3://${AWS_BUCKET}/${dataDirectory_js_1.S3BUCKET_SEND}/${dataDirectory_js_1.CARRIER}`, dataDirectory_js_1.DATA_DIR_DOWN, { del: false, maxConcurrentTransfers: 2, monitor });
    });
    // Synchronize folders every 15 seconds
    // TBD use AWS LAMBDA to make this more efficient
    setInterval(function () {
        startMonitor().then(_ => {
        });
    }, 15000);
}
exports.s3FileSyncServices = s3FileSyncServices;
//# sourceMappingURL=s3FileSyncServices.js.map