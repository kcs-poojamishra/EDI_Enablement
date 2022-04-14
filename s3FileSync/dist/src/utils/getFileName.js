"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_x12_1 = require("node-x12");
const fs_1 = __importDefault(require("fs"));
function getFileName(ediFile) {
    const textType = {
        "setId": "ST01"
    };
    const edi204 = {
        "setId": "ST01",
        "OID": "B202",
        "shipmentId": "B204"
    };
    const edi990 = {
        "setId": "ST01",
        "OID": "B101",
        "shipmentId": "B102"
    };
    const edi214 = {
        "setId": "ST01",
        "OID": "B1003",
        "shipmentId": "B1002"
    };
    let result = {
        status: '200',
        'data': {}
    };
    try {
        const data = fs_1.default.readFileSync(ediFile, 'utf-8');
        const parser = new node_x12_1.X12Parser(true);
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
exports.default = getFileName;
//# sourceMappingURL=getFileName.js.map