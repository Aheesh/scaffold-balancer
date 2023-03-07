import { BasePool } from './pools/';
import { Token, TokenAmount } from './';
import { SwapKind } from '../types';
export declare class Path {
    readonly pools: BasePool[];
    readonly tokens: Token[];
    constructor(tokens: Token[], pools: BasePool[]);
}
export declare class PathWithAmount extends Path {
    readonly swapAmount: TokenAmount;
    readonly swapKind: SwapKind;
    readonly outputAmount: TokenAmount;
    readonly inputAmount: TokenAmount;
    private readonly mutateBalances;
    private readonly printPath;
    constructor(tokens: Token[], pools: BasePool[], swapAmount: TokenAmount, mutateBalances?: boolean);
    print(): void;
}
