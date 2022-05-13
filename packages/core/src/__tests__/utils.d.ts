import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
export declare function assertNone<A>(e: O.Option<A>): asserts e is O.None;
export declare function assertSome<A>(e: O.Option<A>, onSome?: (a: A) => void): asserts e is O.Some<A>;
export declare function assertRight<L, A>(e: E.Either<L, A>, onRight?: (a: A) => void): asserts e is E.Right<A>;
export declare function assertLeft<L, A>(e: E.Either<L, A>, onLeft?: (a: L) => void): asserts e is E.Left<L>;
export declare function assertResolvesRight<L, A>(e: TE.TaskEither<L, A>, onRight?: (a: A) => void): Promise<void>;
export declare function assertResolvesLeft<L, A>(e: TE.TaskEither<L, A>, onLeft?: (a: L) => void): Promise<void>;
