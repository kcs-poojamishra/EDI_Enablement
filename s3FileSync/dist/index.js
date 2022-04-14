"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const s3FileSyncServices_1 = require("./src/services/s3FileSyncServices");
function index() {
    (0, s3FileSyncServices_1.s3FileSyncServices)();
}
(0, s3FileSyncServices_1.initialize)();
index();
//# sourceMappingURL=index.js.map