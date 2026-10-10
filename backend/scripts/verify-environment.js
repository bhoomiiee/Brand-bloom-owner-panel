"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_js_1 = require("../src/config/env.js");
console.info('Environment verification check:');
console.info(`- NODE_ENV: ${env_js_1.env.NODE_ENV}`);
console.info(`- PORT: ${env_js_1.env.PORT}`);
console.info(`- MONGODB_URI: ${env_js_1.env.MONGODB_URI}`);
console.info('All environment variables loaded successfully.');
//# sourceMappingURL=verify-environment.js.map