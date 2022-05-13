"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parseResponse_1 = require("../parseResponse");
const utils_1 = require("@stoplight/prism-core/src/__tests__/utils");
const node_fetch_1 = require("node-fetch");
describe('parseResponseBody()', () => {
    describe('body is json', () => {
        describe('body is parseable', () => {
            it('returns parsed body', () => {
                const response = {
                    headers: new node_fetch_1.Headers({ 'content-type': 'application/json' }),
                    json: jest.fn().mockResolvedValue({ test: 'test' }),
                    text: jest.fn(),
                };
                expect(response.text).not.toHaveBeenCalled();
                return (0, utils_1.assertResolvesRight)((0, parseResponse_1.parseResponseBody)(response), body => expect(body).toEqual({ test: 'test' }));
            });
        });
        describe('body is not parseable', () => {
            it('returns error', () => {
                const response = {
                    headers: new node_fetch_1.Headers({ 'content-type': 'application/json' }),
                    json: jest.fn().mockRejectedValue(new Error('Big Bada Boom')),
                    text: jest.fn(),
                };
                expect(response.text).not.toHaveBeenCalled();
                return (0, utils_1.assertResolvesLeft)((0, parseResponse_1.parseResponseBody)(response), error => expect(error.message).toEqual('Big Bada Boom'));
            });
        });
    });
    describe('body is not json', () => {
        describe('body is readable', () => {
            it('returns body text', () => {
                const response = {
                    headers: new node_fetch_1.Headers({ 'content-type': 'text/html' }),
                    json: jest.fn(),
                    text: jest.fn().mockResolvedValue('<html>Test</html>'),
                };
                expect(response.json).not.toHaveBeenCalled();
                return (0, utils_1.assertResolvesRight)((0, parseResponse_1.parseResponseBody)(response), body => expect(body).toEqual('<html>Test</html>'));
            });
        });
        describe('body is not readable', () => {
            it('returns error', () => {
                const response = {
                    headers: new node_fetch_1.Headers(),
                    json: jest.fn(),
                    text: jest.fn().mockRejectedValue(new Error('Big Bada Boom')),
                };
                expect(response.json).not.toHaveBeenCalled();
                return (0, utils_1.assertResolvesLeft)((0, parseResponse_1.parseResponseBody)(response), error => expect(error.message).toEqual('Big Bada Boom'));
            });
        });
    });
    describe('content-type header not set', () => {
        it('returns body text', () => {
            const response = {
                headers: new node_fetch_1.Headers(),
                json: jest.fn(),
                text: jest.fn().mockResolvedValue('Plavalaguna'),
            };
            expect(response.json).not.toHaveBeenCalled();
            return (0, utils_1.assertResolvesRight)((0, parseResponse_1.parseResponseBody)(response), body => expect(body).toEqual('Plavalaguna'));
        });
    });
});
describe('parseResponseHeaders()', () => {
    it('parses raw headers correctly', () => expect((0, parseResponse_1.parseResponseHeaders)({ h1: ['a b'], h2: ['c'], h3: ['a', 'b'] })).toEqual({
        h1: 'a b',
        h2: 'c',
        h3: 'a,b',
    }));
});
describe('parseResponse()', () => {
    describe('response is correct', () => {
        it('returns parsed response', () => (0, utils_1.assertResolvesRight)((0, parseResponse_1.parseResponse)({
            status: 200,
            headers: new node_fetch_1.Headers({ 'content-type': 'application/json', test: 'test' }),
            json: jest.fn().mockResolvedValue({ test: 'test' }),
            text: jest.fn(),
        }), response => {
            expect(response).toEqual({
                statusCode: 200,
                headers: { 'content-type': 'application/json', test: 'test' },
                body: { test: 'test' },
            });
        }));
    });
    describe('response is invalid', () => {
        it('returns error', () => (0, utils_1.assertResolvesLeft)((0, parseResponse_1.parseResponse)({
            status: 200,
            headers: new node_fetch_1.Headers(),
            json: jest.fn(),
            text: jest.fn().mockRejectedValue(new Error('Big Bada Boom')),
        }), error => {
            expect(error.message).toEqual('Big Bada Boom');
        }));
    });
});
