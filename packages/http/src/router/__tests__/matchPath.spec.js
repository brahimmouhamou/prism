"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const matchPath_1 = require("../matchPath");
const faker = require("faker");
const types_1 = require("../types");
const utils_1 = require("./utils");
const utils_2 = require("@stoplight/prism-core/src/__tests__/utils");
describe('matchPath()', () => {
    test('root path should match another root path', () => {
        const path = '/';
        (0, utils_2.assertRight)((0, matchPath_1.matchPath)(path, path), e => expect(e).toEqual(types_1.MatchType.CONCRETE));
    });
    test('any concrete path with spaces should match an equal concrete path', () => {
        const path = (0, utils_1.randomPath)({
            pathFragments: faker.datatype.number({ min: 2, max: 6 }),
            includeTemplates: false,
            includeSpaces: true,
        });
        (0, utils_2.assertRight)((0, matchPath_1.matchPath)(path, path), e => expect(e).toEqual(types_1.MatchType.CONCRETE));
    });
    test('any concrete path should match an equal concrete path', () => {
        const path = (0, utils_1.randomPath)({
            pathFragments: faker.datatype.number({ min: 1, max: 6 }),
            includeTemplates: false,
        });
        (0, utils_2.assertRight)((0, matchPath_1.matchPath)(path, path), e => expect(e).toEqual(types_1.MatchType.CONCRETE));
    });
    test('any concrete path with colon should match an equal concrete path', () => {
        const path = (0, utils_1.randomPath)({
            pathFragments: faker.datatype.number({ min: 2, max: 6 }),
            includeTemplates: false,
            includeColon: true,
        });
        (0, utils_2.assertRight)((0, matchPath_1.matchPath)(path, path), e => expect(e).toEqual(types_1.MatchType.CONCRETE));
    });
    test('none request path should match path with less fragments', () => {
        const trailingSlash = faker.datatype.boolean();
        const requestPath = (0, utils_1.randomPath)({
            pathFragments: faker.datatype.number({ min: 4, max: 6 }),
            includeTemplates: false,
            trailingSlash,
        });
        const operationPath = (0, utils_1.randomPath)({
            pathFragments: faker.datatype.number({ min: 1, max: 3 }),
            trailingSlash,
        });
        (0, utils_2.assertRight)((0, matchPath_1.matchPath)(requestPath, operationPath), e => expect(e).toEqual(types_1.MatchType.NOMATCH));
    });
    test('none request path with colons should match path with less fragments', () => {
        const requestPath = (0, utils_1.randomPath)({
            pathFragments: faker.datatype.number({ min: 5, max: 7 }),
            includeTemplates: false,
            includeColon: true,
        });
        const operationPath = requestPath.split(':').shift() + '';
        (0, utils_2.assertRight)((0, matchPath_1.matchPath)(requestPath, operationPath), e => expect(e).toEqual(types_1.MatchType.NOMATCH));
    });
    test('none request path with a colon should not match equivalent slash path', () => {
        const requestPath = (0, utils_1.randomPath)({
            pathFragments: faker.datatype.number({ min: 5, max: 7 }),
            includeTemplates: false,
            includeColon: true,
        });
        const operationPath = requestPath.replace(':', '/');
        (0, utils_2.assertRight)((0, matchPath_1.matchPath)(requestPath, operationPath), e => expect(e).toEqual(types_1.MatchType.NOMATCH));
    });
    test('none request path should match concrete path with more fragments', () => {
        const requestPath = (0, utils_1.randomPath)({
            pathFragments: faker.datatype.number({ min: 4, max: 6 }),
            includeTemplates: false,
        });
        const operationPath = (0, utils_1.randomPath)({
            pathFragments: faker.datatype.number({ min: 1, max: 3 }),
            includeTemplates: false,
        });
        (0, utils_2.assertRight)((0, matchPath_1.matchPath)(requestPath, operationPath), e => expect(e).toEqual(types_1.MatchType.NOMATCH));
    });
    test('none request path with colons should match path with more fragments', () => {
        const requestPath = (0, utils_1.randomPath)({
            pathFragments: faker.datatype.number({ min: 5, max: 7 }),
            includeTemplates: false,
            includeColon: true,
        });
        const newPath = requestPath.split(':').shift();
        const lastWord = requestPath.split(':').pop();
        const operationPath = [newPath, '/', lastWord, ':', faker.random.word()].join('');
        (0, utils_2.assertRight)((0, matchPath_1.matchPath)(requestPath, operationPath), e => expect(e).toEqual(types_1.MatchType.NOMATCH));
    });
    test('request path should match a templated path and resolve variables', () => {
        (0, utils_2.assertRight)((0, matchPath_1.matchPath)('/a', '/{a}'), e => expect(e).toEqual(types_1.MatchType.TEMPLATED));
        (0, utils_2.assertRight)((0, matchPath_1.matchPath)('/a:b', '/{a}:b'), e => expect(e).toEqual(types_1.MatchType.TEMPLATED));
        (0, utils_2.assertRight)((0, matchPath_1.matchPath)('/a/b', '/{a}/{b}'), e => expect(e).toEqual(types_1.MatchType.TEMPLATED));
        (0, utils_2.assertRight)((0, matchPath_1.matchPath)('/a/b:c', '/{a}/{b}:{c}'), e => expect(e).toEqual(types_1.MatchType.TEMPLATED));
        (0, utils_2.assertRight)((0, matchPath_1.matchPath)('/a/b', '/a/{b}'), e => expect(e).toEqual(types_1.MatchType.TEMPLATED));
        (0, utils_2.assertRight)((0, matchPath_1.matchPath)('/a/b:c', '/a/b:{c}'), e => expect(e).toEqual(types_1.MatchType.TEMPLATED));
        (0, utils_2.assertRight)((0, matchPath_1.matchPath)('/test.json', '/test.{format}'), e => expect(e).toEqual(types_1.MatchType.TEMPLATED));
    });
    test('request path should match a template path and resolve undefined variables', () => {
        (0, utils_2.assertRight)((0, matchPath_1.matchPath)('/', '/{a}'), e => expect(e).toEqual(types_1.MatchType.TEMPLATED));
        (0, utils_2.assertRight)((0, matchPath_1.matchPath)('/:', '/{a}:{b}'), e => expect(e).toEqual(types_1.MatchType.TEMPLATED));
        (0, utils_2.assertRight)((0, matchPath_1.matchPath)('//', '/{a}/'), e => expect(e).toEqual(types_1.MatchType.TEMPLATED));
        (0, utils_2.assertRight)((0, matchPath_1.matchPath)('//b', '/{a}/{b}'), e => expect(e).toEqual(types_1.MatchType.TEMPLATED));
        (0, utils_2.assertRight)((0, matchPath_1.matchPath)('//b:c', '/{a}/{b}:{c}'), e => expect(e).toEqual(types_1.MatchType.TEMPLATED));
        (0, utils_2.assertRight)((0, matchPath_1.matchPath)('/a/', '/{a}/{b}'), e => expect(e).toEqual(types_1.MatchType.TEMPLATED));
        (0, utils_2.assertRight)((0, matchPath_1.matchPath)('//', '/{a}/{b}'), e => expect(e).toEqual(types_1.MatchType.TEMPLATED));
    });
    test('none path should match templated operation with more path fragments (dynamic)', () => {
        const requestPath = (0, utils_1.randomPath)({
            pathFragments: faker.datatype.number({ min: 1, max: 3 }),
            includeTemplates: false,
            trailingSlash: false,
        });
        const operationPath = (0, utils_1.randomPath)({
            pathFragments: faker.datatype.number({ min: 4, max: 6 }),
            includeTemplates: true,
            trailingSlash: false,
        });
        (0, utils_2.assertRight)((0, matchPath_1.matchPath)(requestPath, operationPath), e => expect(e).toEqual(types_1.MatchType.NOMATCH));
    });
    test('none path should match templated operation with more path fragments', () => {
        const requestPath = '/a/b/c';
        const operationPath = '/{d}/{e}/{f}/{g}';
        (0, utils_2.assertRight)((0, matchPath_1.matchPath)(requestPath, operationPath), e => expect(e).toEqual(types_1.MatchType.NOMATCH));
    });
    test('it does not match if separators are not equal', () => {
        (0, utils_2.assertRight)((0, matchPath_1.matchPath)('/a:b/c', '/a/b:c'), e => expect(e).toEqual(types_1.MatchType.NOMATCH));
    });
    test('it accepts columns as part of templated params', () => {
        (0, utils_2.assertRight)((0, matchPath_1.matchPath)('/a:b/c', '/{something}/c'), e => expect(e).toEqual(types_1.MatchType.TEMPLATED));
    });
    test('it properly processes fragments containing both concrete and templated parts', () => {
        (0, utils_2.assertRight)((0, matchPath_1.matchPath)('/a', '/a.{json}'), e => expect(e).toEqual(types_1.MatchType.NOMATCH));
        (0, utils_2.assertRight)((0, matchPath_1.matchPath)('/test.json', '/test.{format}'), e => expect(e).toEqual(types_1.MatchType.TEMPLATED));
        (0, utils_2.assertRight)((0, matchPath_1.matchPath)('/test.', '/test.{format}'), e => expect(e).toEqual(types_1.MatchType.TEMPLATED));
        (0, utils_2.assertRight)((0, matchPath_1.matchPath)('/nope.json', '/test.{format}'), e => expect(e).toEqual(types_1.MatchType.NOMATCH));
        (0, utils_2.assertRight)((0, matchPath_1.matchPath)('/before/test.json.sub/after', '/{prefix}/test.{format}.{extension}/{suffix}'), e => expect(e).toEqual(types_1.MatchType.TEMPLATED));
    });
    test.each([
        '%3A',
        '%2F',
    ])('parameters can contain encoded "special characters" (%s)', (encoded) => {
        const requestPath = `/bef${encoded}17/test.smthg${encoded}32.sub${encoded}47/aft${encoded}96`;
        (0, utils_2.assertRight)((0, matchPath_1.matchPath)(requestPath, `/{prefix}/test.{format}.{extension}/{suffix}`), e => expect(e).toEqual(types_1.MatchType.TEMPLATED));
        (0, utils_2.assertRight)((0, matchPath_1.matchPath)(requestPath, '/{prefix}/test.{global}/{suffix}'), e => expect(e).toEqual(types_1.MatchType.TEMPLATED));
    });
});
