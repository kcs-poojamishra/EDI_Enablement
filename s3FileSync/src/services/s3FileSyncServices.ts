import * as AWS from '@aws-sdk/client-s3';
import s3SyncClient from 's3-sync-client';
import fs from 'fs';
import chokidar from 'chokidar';
import path from 'path';
import getFileName from '../utils/getFileName';
import { PROCESSED_DIR, PROCESSED_DIR_DOWN, DATA_DIR, DATA_DIR_DOWN, OUTBOX, INBOX, S3BUCKET_RECEIVE, S3BUCKET_SEND, CARRIER } from '../constants/dataDirectory.js';
import '../config/config.js';

// Function to initialize and create directories if they do not exist
export function initialize() {
    // Create all directories if they do not exist
    if (!fs.existsSync(PROCESSED_DIR)) {
        fs.mkdirSync(PROCESSED_DIR);
        console.log('Folder Created Successfully: ', PROCESSED_DIR);
    }
    if (!fs.existsSync(PROCESSED_DIR_DOWN)) {
        fs.mkdirSync(PROCESSED_DIR_DOWN);
        console.log('Folder Created Successfully: ', PROCESSED_DIR_DOWN);
    }
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR);
        console.log('Folder Created Successfully: ', DATA_DIR);
    }
    if (!fs.existsSync(DATA_DIR_DOWN)) {
        fs.mkdirSync(DATA_DIR_DOWN);
        console.log('Folder Created Successfully: ', DATA_DIR_DOWN);
    }
}

// Function to synchronize S3 bucket with local file system
// and vice versa. Inbound files are renamed using information
// obtained by parsing the files

export function s3FileSyncServices() {
    const AWS_REGION = process.env.AWS_REGION_NAME;
    const AWS_BUCKET = process.env.AWS_S3_BUCKET_NAME;
    const ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
    const SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
    const { TransferMonitor } = s3SyncClient;
    const { S3Client } = AWS;

    let s3Credential = {
        region: AWS_REGION,
        credentials:{
            accessKeyId: "",
            secretAccessKey : ""
        }
    }
    if ((ACCESS_KEY_ID && ACCESS_KEY_ID != "" && ACCESS_KEY_ID != "undefined") && (SECRET_ACCESS_KEY && SECRET_ACCESS_KEY != "" && SECRET_ACCESS_KEY != "undefined")) {
        s3Credential.credentials = { accessKeyId: ACCESS_KEY_ID, secretAccessKey: SECRET_ACCESS_KEY }
    }

    const s3Config = new S3Client(s3Credential);
    const syncClient = new s3SyncClient({ client: s3Config });
    const pollReceive = chokidar.watch(INBOX, { ignored: /^\./, awaitWriteFinish: true, persistent: true });
    const pollSend = chokidar.watch(DATA_DIR_DOWN, { ignored: /^\./, awaitWriteFinish: true, persistent: true });
    let count;

    //PollReceive polls the local Inbox folder for incoming messages/files and transfers them to the S3 bucket
    pollReceive
        .on('add', function (fileName) {
            const srcFileName = path.basename(fileName);
            const processedFileName = PROCESSED_DIR + '/' + srcFileName;

            // Here we have to process the files change the file name
            // Check if we have already processed this file
            fs.access(processedFileName, fs.F_OK, (err) => {
                if (err) {
                    const result = getFileName(fileName);
                    count = 1;
                    let foundFile = true;
                    let altFileName = DATA_DIR + '/' + result.data.OID + '-' + result.data.setId + '-' + result.data.shipmentId + '.edi';

                    while (foundFile) {
                        try {
                            fs.accessSync(altFileName, fs.F_OK);
                            // Increment counter and change fileName if file exists
                            altFileName = DATA_DIR + '/' + result.data.OID + '-' + result.data.setId + '-' + result.data.shipmentId + '-' + count + '.edi';
                            count = count + 1;
                        }
                        catch (error) {
                            foundFile = false;
                        }
                    }
                    const dstFileName = altFileName;
                    console.log('File', srcFileName, " Added");
                    fs.copyFile(fileName, dstFileName, (copyError) => {
                        if (copyError === null) {
                            // TODO: This is inefficient better to create a 0 byte file
                            fs.copyFile(fileName, processedFileName, (err) => {
                            })
                        }
                    });
                }
            })
        })
        .on('change', function (processedFileName) { console.log('File', processedFileName, 'has been changed'); })
        .on('unlink', function (processedFileName) { console.log('File', processedFileName, 'has been removed'); })
        .on('error', function (error) { console.error('Error happened', error); })

    //PollSend polls the S3 bucket for outbound messages/files and copies them to the Outbox
    pollSend
        .on('add', function (fileName) {
            const srcFileName = path.basename(fileName);
            const result = getFileName(fileName);
            const dstFileName = OUTBOX + '/' +
                result.data.OID + '/' + result.data.OID + '-' +
                result.data.setId + '-' + result.data.shipmentId + '.edi';
            const processedFileName = PROCESSED_DIR_DOWN + '/' + srcFileName;

            // Got a new file from S3 dispatch it to OpenAS2
            // Check if we have already processed this file
            fs.access(processedFileName, fs.F_OK, (err) => {
                if (err) {
                    console.log('File', srcFileName, " Added");
                    console.log('File', dstFileName, " Added To");
                    fs.copyFile(fileName, dstFileName, (err) => {
                        if (err === null) {
                            // TODO: This is inefficient better to create a 0 byte file
                            fs.copyFile(fileName, processedFileName, (err) => {
                            })
                        }
                    });
                }
            })
        })
        .on('change', function (processedFileName) { console.log('File', processedFileName, 'has been changed'); })
        .on('unlink', function (processedFileName) { console.log('File', processedFileName, 'has been removed'); })
        .on('error', function (error) { console.error('Error happened', error); })


    let startMonitor = async () => {
        const monitor = new TransferMonitor();
        monitor.on('progress', (progress) => {
            count = progress.count.current;
        });
        await syncClient.sync(DATA_DIR, `s3://${AWS_BUCKET}/${S3BUCKET_RECEIVE}/${CARRIER}`, { del: false, maxConcurrentTransfers: 2, monitor });
        await syncClient.sync(`s3://${AWS_BUCKET}/${S3BUCKET_SEND}/${CARRIER}`, DATA_DIR_DOWN, { del: false, maxConcurrentTransfers: 2, monitor });
    }



    // Synchronize folders every 15 seconds
    // TBD use AWS LAMBDA to make this more efficient
    setInterval(function () {
        startMonitor().then(_ => {
        });
    }, 15000);
}

