import { HttpMethod } from '@stoplight/types';
export declare function pickOneHttpMethod(): HttpMethod;
export declare function pickSetOfHttpMethods(count?: number): HttpMethod[];
declare type IRandomPathOptions = {
    pathFragments?: number;
    includeTemplates?: boolean;
    trailingSlash?: boolean;
    leadingSlash?: boolean;
    includeSpaces?: boolean;
    includeColon?: boolean;
};
export declare function randomPath(opts?: IRandomPathOptions): string;
export {};
