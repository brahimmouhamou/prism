"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertResolvesLeft = exports.assertResolvesRight = exports.assertLeft = exports.assertRight = exports.assertSome = exports.assertNone = void 0;
const O = require("fp-ts/Option");
const lodash_1 = require("lodash");
const function_1 = require("fp-ts/function");
const E = require("fp-ts/Either");
function assertNone(e) {
    (0, function_1.pipe)(e, O.fold(() => ({}), a => {
        throw new Error(`None expected, got a Some: ${a}`);
    }));
}
exports.assertNone = assertNone;
function assertSome(e, onSome = lodash_1.noop) {
    (0, function_1.pipe)(e, O.fold(() => {
        throw new Error('Some expected, got a None');
    }, onSome));
}
exports.assertSome = assertSome;
function assertRight(e, onRight = lodash_1.noop) {
    (0, function_1.pipe)(e, E.fold(l => {
        throw new Error(`Right expected, got a Left: ${l}`);
    }, onRight));
}
exports.assertRight = assertRight;
function assertLeft(e, onLeft = lodash_1.noop) {
    (0, function_1.pipe)(e, E.fold(onLeft, a => {
        throw new Error(`Left expected, got a Right: ${a}`);
    }));
}
exports.assertLeft = assertLeft;
async function assertResolvesRight(e, onRight = lodash_1.noop) {
    assertRight(await e(), onRight);
}
exports.assertResolvesRight = assertResolvesRight;
async function assertResolvesLeft(e, onLeft = lodash_1.noop) {
    assertLeft(await e(), onLeft);
}
exports.assertResolvesLeft = assertResolvesLeft;
