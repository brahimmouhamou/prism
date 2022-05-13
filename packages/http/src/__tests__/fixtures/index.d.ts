import { IPrismInput } from '@stoplight/prism-core';
import { IHttpOperation } from '@stoplight/types';
import { IHttpRequest, IHttpResponse } from '../../types';
export declare const httpOperations: IHttpOperation[];
export declare const httpOperationsByRef: {
    deprecated: IHttpOperation;
};
export declare const httpInputs: IHttpRequest[];
export declare const httpInputsByRef: {
    updateTodo: IHttpRequest;
};
export declare const httpRequests: Array<IPrismInput<IHttpRequest>>;
export declare const httpOutputs: IHttpResponse[];
