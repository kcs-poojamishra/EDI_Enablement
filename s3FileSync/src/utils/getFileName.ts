import { X12Parser } from 'node-x12';
import fs from 'fs';

export default function getFileName(ediFile) {
    const textType = {
        "setId": "ST01"
    }
    const edi204 = {
        "setId": "ST01",
        "OID": "B202",
        "shipmentId": "B204"
    }
    const edi990 = {
        "setId": "ST01",
        "OID": "B101",
        "shipmentId": "B102"
    }
    const edi214 = {
        "setId": "ST01",
        "OID": "B1003",
        "shipmentId": "B1002"
    }
    let result = {
        status: '200',
        'data': {
            shipmentId:'',
            setId:'',
            OID:''
        }
    };
    try {
        const data = fs.readFileSync(ediFile, 'utf-8');
        const parser = new X12Parser(true);
        const interchange = parser.parse(data);
        interchange.functionalGroups.forEach(fg => {
            fg.transactions.forEach(tx => {
                let obj = tx.toObject(textType);
                if (obj) {
                    switch (obj.setId) {
                        case '204':
                            obj = tx.toObject(edi204);
                            break;
                        case '990':
                            obj = tx.toObject(edi990);
                            break;
                        case '214':
                            obj = tx.toObject(edi214);
                            break;
                    }
                }
                result.data = obj;
            });
        });
    }
    catch (error) {
        console.log(error.message);
    }
    return result;
}
