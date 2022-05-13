"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomPath = exports.pickSetOfHttpMethods = exports.pickOneHttpMethod = void 0;
const faker = require("faker/locale/en");
const fp_1 = require("lodash/fp");
const httpMethods = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];
function pickOneHttpMethod() {
    return faker.random.arrayElement(httpMethods);
}
exports.pickOneHttpMethod = pickOneHttpMethod;
function pickSetOfHttpMethods(count = 2) {
    return new Array(count).fill(1).map(() => pickOneHttpMethod());
}
exports.pickSetOfHttpMethods = pickSetOfHttpMethods;
const defaultRandomPathOptions = {
    pathFragments: 3,
    includeTemplates: true,
    leadingSlash: true,
    trailingSlash: false,
    includeSpaces: true,
    includeColon: false,
};
function randomPath(opts = defaultRandomPathOptions) {
    const options = (0, fp_1.defaults)(defaultRandomPathOptions, opts);
    if (options.includeColon && (options.trailingSlash || options.pathFragments < 2)) {
        options.includeColon = false;
    }
    const randomPathFragments = new Array(options.pathFragments).fill(0).map(() => {
        const words = faker.random.words(options.includeSpaces ? 3 : 1);
        return options.includeTemplates && faker.datatype.boolean() ? `{${words}}` : words;
    });
    const leadingSlash = options.leadingSlash ? '/' : '';
    const trailingSlash = options.trailingSlash ? '/' : '';
    const lastWord = randomPathFragments.pop();
    return options.includeColon
        ? `${leadingSlash}${randomPathFragments.join('/')}:${lastWord}`
        : `${leadingSlash}${randomPathFragments.join('/')}/${lastWord}${trailingSlash}`;
}
exports.randomPath = randomPath;
