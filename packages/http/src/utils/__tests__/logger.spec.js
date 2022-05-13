"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../logger");
const types_1 = require("@stoplight/types");
describe('violationLogger', () => {
    const logger = {
        error: jest.fn(),
        warn: jest.fn(),
        info: jest.fn(),
    };
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('violation is an error', () => {
        it('logs error', () => {
            (0, logger_1.violationLogger)(logger)({ severity: types_1.DiagnosticSeverity.Error, message: 'Test' });
            expect(logger.error).toHaveBeenCalledWith({ name: 'VALIDATOR' }, 'Violation: Test');
            expect(logger.warn).not.toHaveBeenCalled();
            expect(logger.info).not.toHaveBeenCalled();
        });
    });
    describe('violation is an warning', () => {
        it('logs warning', () => {
            (0, logger_1.violationLogger)(logger)({ severity: types_1.DiagnosticSeverity.Warning, message: 'Test' });
            expect(logger.error).not.toHaveBeenCalled();
            expect(logger.warn).toHaveBeenCalledWith({ name: 'VALIDATOR' }, 'Violation: Test');
            expect(logger.info).not.toHaveBeenCalled();
        });
    });
    describe('violation is an info', () => {
        it('logs info', () => {
            (0, logger_1.violationLogger)(logger)({ severity: types_1.DiagnosticSeverity.Information, message: 'Test' });
            expect(logger.error).not.toHaveBeenCalled();
            expect(logger.warn).not.toHaveBeenCalled();
            expect(logger.info).toHaveBeenCalledWith({ name: 'VALIDATOR' }, 'Violation: Test');
        });
    });
    describe('violation has path set', () => {
        it('logs error with path', () => {
            (0, logger_1.violationLogger)(logger)({ severity: types_1.DiagnosticSeverity.Error, message: 'Test', path: ['a', 'b'] });
            expect(logger.error).toHaveBeenCalledWith({ name: 'VALIDATOR' }, 'Violation: a.b Test');
            expect(logger.warn).not.toHaveBeenCalled();
            expect(logger.info).not.toHaveBeenCalled();
        });
    });
});
