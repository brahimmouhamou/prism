"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestLogger = void 0;
const pino = require("pino");
function createTestLogger() {
    const logger = pino({
        enabled: false,
    });
    logger.success = logger.info;
    return logger;
}
exports.createTestLogger = createTestLogger;
