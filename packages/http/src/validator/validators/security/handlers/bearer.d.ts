import { IHttpRequest } from '../../../../types';
export declare const bearer: (input: Pick<IHttpRequest, "url" | "headers">) => import("fp-ts/lib/Either").Either<import("@stoplight/prism-core").IPrismDiagnostic, boolean>;
export declare const oauth2: (input: Pick<IHttpRequest, "url" | "headers">) => import("fp-ts/lib/Either").Either<import("@stoplight/prism-core").IPrismDiagnostic, boolean>;
export declare const openIdConnect: (input: Pick<IHttpRequest, "url" | "headers">) => import("fp-ts/lib/Either").Either<import("@stoplight/prism-core").IPrismDiagnostic, boolean>;
