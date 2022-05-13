"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_logging_1 = require("abstract-logging");
const E = require("fp-ts/Either");
const ReaderEither_1 = require("fp-ts/ReaderEither");
const TE = require("fp-ts/TaskEither");
const __1 = require("..");
describe('validation', () => {
    const components = {
        validateInput: jest.fn().mockReturnValue(['something']),
        validateOutput: jest.fn().mockReturnValue(['something']),
        validateSecurity: jest.fn().mockReturnValue(['something']),
        route: jest.fn().mockReturnValue(E.right('hey')),
        forward: jest.fn().mockReturnValue(TE.right({
            statusCode: 200,
            headers: {},
            body: {},
        })),
        logger: { ...abstract_logging_1.default, child: jest.fn().mockReturnValue(abstract_logging_1.default) },
        mock: jest.fn().mockReturnValue((0, ReaderEither_1.asks)(() => 'hey')),
    };
    const prismInstance = (0, __1.factory)({ mock: { dynamic: false }, validateRequest: false, validateResponse: false, checkSecurity: true, errors: false, upstreamProxy: undefined }, components);
    describe.each([
        ['input', 'validateRequest', 'validateInput', 'validateOutput'],
        ['output', 'validateResponse', 'validateOutput', 'validateInput'],
    ])('%s', (_type, fieldType, fnName, reverseFnName) => {
        describe('when enabled', () => {
            beforeAll(() => {
                const obj = {
                    checkSecurity: true,
                    errors: true,
                    validateRequest: false,
                    validateResponse: false,
                    mock: {},
                    upstreamProxy: undefined,
                };
                obj[fieldType] = true;
                return prismInstance.request('', [], obj)();
            });
            afterEach(() => jest.clearAllMocks());
            afterAll(() => jest.restoreAllMocks());
            test('should call the relative validate function', () => expect(components[fnName]).toHaveBeenCalled());
            test('should not call the relative other function', () => expect(components[reverseFnName]).not.toHaveBeenCalled());
        });
        describe('when disabled', () => {
            beforeAll(() => prismInstance.request('', []));
            afterEach(() => jest.clearAllMocks());
            afterAll(() => jest.restoreAllMocks());
            test('should not call the relative validate function', () => expect(components[fnName]).not.toHaveBeenCalled());
            test('should not call the relative other function', () => expect(components[reverseFnName]).not.toHaveBeenCalled());
        });
    });
});
