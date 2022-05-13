"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../client");
const fixtures_1 = require("./fixtures");
const test_helpers_1 = require("./test-helpers");
describe('Checks if memory leaks', () => {
    function round(client) {
        return client.post('/todos?overwrite=yes', {
            name: 'some name',
            completed: false,
        }, { headers: { 'x-todos-publish': '2021-09-21T09:48:48.108Z' } });
    }
    it('when handling 5k of requests', () => {
        const logger = (0, test_helpers_1.createTestLogger)();
        const client = (0, client_1.createClientFromOperations)(fixtures_1.httpOperations, {
            validateRequest: true,
            validateResponse: true,
            checkSecurity: true,
            errors: true,
            mock: {
                dynamic: false,
            },
            upstreamProxy: undefined,
            logger,
        });
        round(client);
        const baseMemoryUsage = process.memoryUsage().heapUsed;
        for (let i = 0; i < 5000; i++) {
            round(client);
            if (i % 100 === 0) {
                global.gc();
            }
        }
        global.gc();
        expect(process.memoryUsage().heapUsed).toBeLessThanOrEqual(baseMemoryUsage * 1.03);
    });
});
