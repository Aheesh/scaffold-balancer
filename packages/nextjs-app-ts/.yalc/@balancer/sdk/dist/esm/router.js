import { SwapKind } from './types';
import { WAD } from './utils/math';
import { PathWithAmount } from './entities';
import { PathGraph } from './pathGraph/pathGraph';
export class Router {
    constructor() {
        this.pathGraph = new PathGraph();
    }
    getCandidatePaths(tokenIn, tokenOut, swapKind, pools, graphTraversalConfig) {
        console.time('build graph');
        this.pathGraph.buildGraph({ pools });
        console.timeEnd('build graph');
        console.time('get candidate paths');
        const candidatePaths = this.pathGraph.getCandidatePaths({
            tokenIn,
            tokenOut,
            graphTraversalConfig,
        });
        console.timeEnd('get candidate paths');
        return candidatePaths;
    }
    getBestPaths(paths, swapKind, swapAmount) {
        if (paths.length === 0) {
            throw new Error('No potential swap paths provided');
        }
        const quotePaths = [];
        // Check if PathWithAmount is valid (each hop pool swap limit)
        paths.forEach(path => {
            try {
                quotePaths.push(new PathWithAmount(path.tokens, path.pools, swapAmount));
            }
            catch {
                // console.debug(path.tokens.map(token => token.symbol).join(' -> '));
                // console.debug(path.pools.map(pool => pool.id).join(' -> '));
                return;
            }
        });
        if (quotePaths.length === 0)
            throw new Error('No valid paths provided');
        let valueArr;
        if (swapKind === SwapKind.GivenIn) {
            (valueArr = quotePaths.map(item => {
                return {
                    item,
                    value: Number(item.outputAmount.amount),
                };
            })),
                valueArr.sort((a, b) => b.value - a.value);
        }
        else {
            (valueArr = quotePaths.map(item => {
                return {
                    item,
                    value: Number(item.inputAmount.amount),
                };
            })),
                valueArr.sort((a, b) => a.value - b.value);
        }
        const orderedQuotePaths = valueArr.map(item => item.item);
        // If there is only one path, return it
        if (orderedQuotePaths.length === 1) {
            return orderedQuotePaths;
        }
        // Split swapAmount in half, making sure not to lose dust
        const swapAmount50up = swapAmount.mulDownFixed(WAD / 2n);
        const swapAmount50down = swapAmount.sub(swapAmount50up);
        const path50up = new PathWithAmount(orderedQuotePaths[0].tokens, orderedQuotePaths[0].pools, swapAmount50up);
        const path50down = new PathWithAmount(orderedQuotePaths[1].tokens, orderedQuotePaths[1].pools, swapAmount50down);
        if (swapKind === SwapKind.GivenIn) {
            if (orderedQuotePaths[0].outputAmount.amount >
                path50up.outputAmount.amount + path50down.outputAmount.amount) {
                return orderedQuotePaths.slice(0, 1);
            }
            else {
                return [path50up, path50down];
            }
        }
        else {
            if (orderedQuotePaths[0].inputAmount.amount <
                path50up.inputAmount.amount + path50down.inputAmount.amount) {
                return orderedQuotePaths.slice(0, 1);
            }
            else {
                return [path50up, path50down];
            }
        }
    }
}
//# sourceMappingURL=router.js.map