"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@stoplight/types");
const headers_1 = require("../headers");
const validateAgainstSchemaModule = require("../utils");
const utils_1 = require("@stoplight/prism-core/src/__tests__/utils");
const O = require("fp-ts/Option");
const faker = require("faker/locale/en");
describe('validate()', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(validateAgainstSchemaModule, 'validateAgainstSchema');
    });
    describe('spec is present', () => {
        describe('header is not present', () => {
            describe('spec defines it as required', () => {
                it('returns validation error', () => {
                    (0, utils_1.assertLeft)((0, headers_1.validate)({}, [{ id: faker.random.word(), name: 'aHeader', style: types_1.HttpParamStyles.Simple, required: true }]), error => expect(error).toContainEqual({
                        code: 'required',
                        message: "must have required property 'aheader'",
                        path: ['header'],
                        severity: 0,
                    }));
                });
            });
        });
        describe('header is present', () => {
            describe('schema is present', () => {
                describe('deserializer is available', () => {
                    describe('header is valid', () => {
                        it('validates positively against schema', () => {
                            (0, utils_1.assertRight)((0, headers_1.validate)({ 'x-test-header': 'abc' }, [
                                {
                                    id: faker.random.word(),
                                    name: 'x-test-header',
                                    style: types_1.HttpParamStyles.Simple,
                                    schema: { type: 'string' },
                                },
                            ]));
                            expect(validateAgainstSchemaModule.validateAgainstSchema).toReturnWith(O.none);
                        });
                    });
                });
            });
            describe('schema was not provided', () => {
                it('omits schema validation', () => {
                    (0, utils_1.assertRight)((0, headers_1.validate)({ 'x-test-header': 'abc' }, [
                        {
                            id: faker.random.word(),
                            name: 'x-test-header',
                            style: types_1.HttpParamStyles.Simple,
                        },
                    ]));
                    expect(validateAgainstSchemaModule.validateAgainstSchema).toReturnWith(O.none);
                });
            });
            describe('deprecated flag is set', () => {
                it('returns deprecation warning', () => {
                    (0, utils_1.assertLeft)((0, headers_1.validate)({ 'x-test-header': 'abc' }, [
                        {
                            id: faker.random.word(),
                            name: 'x-test-header',
                            deprecated: true,
                            style: types_1.HttpParamStyles.Simple,
                        },
                    ]), error => expect(error).toContainEqual(expect.objectContaining({ severity: types_1.DiagnosticSeverity.Warning })));
                });
            });
        });
    });
});
