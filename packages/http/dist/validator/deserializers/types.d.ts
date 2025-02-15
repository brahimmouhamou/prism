import { JSONSchema } from '../../types';
export declare type deserializeFn<T> = (name: string, parameters: T, schema?: JSONSchema, explode?: boolean) => unknown;
