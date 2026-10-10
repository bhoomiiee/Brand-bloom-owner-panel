"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connection_js_1 = require("../src/database/connection.js");
const indexes_js_1 = require("../src/database/indexes.js");
async function run() {
    await (0, connection_js_1.connectDatabase)();
    await (0, indexes_js_1.ensureAllIndexes)();
    await (0, connection_js_1.disconnectDatabase)();
}
run();
//# sourceMappingURL=create-indexes.js.map