import { PoolType, SwapKind } from '../../../types';
import { Token, TokenAmount } from '../../';
import { MathSol, WAD, getPoolAddress, unsafeFastParseEther } from '../../../utils';
import { _calcOutGivenIn, _calcInGivenOut } from './math';
class WeightedPoolToken extends TokenAmount {
    constructor(token, amount, weight, index) {
        super(token, amount);
        this.weight = BigInt(weight);
        this.index = index;
    }
    increase(amount) {
        this.amount = this.amount + amount;
        this.scale18 = this.amount * this.scalar;
        return this;
    }
    decrease(amount) {
        this.amount = this.amount - amount;
        this.scale18 = this.amount * this.scalar;
        return this;
    }
}
export class WeightedPool {
    static fromRawPool(chainId, pool) {
        const poolTokens = [];
        for (const t of pool.tokens) {
            if (!t.weight) {
                throw new Error('Weighted pool token does not have a weight');
            }
            const token = new Token(chainId, t.address, t.decimals, t.symbol, t.name);
            const tokenAmount = TokenAmount.fromHumanAmount(token, t.balance);
            poolTokens.push(new WeightedPoolToken(token, tokenAmount.amount, unsafeFastParseEther(t.weight), t.index));
        }
        return new WeightedPool(pool.id, pool.poolTypeVersion, unsafeFastParseEther(pool.swapFee), poolTokens);
    }
    constructor(id, poolTypeVersion, swapFee, tokens) {
        this.poolType = PoolType.Weighted;
        this.MAX_IN_RATIO = 300000000000000000n; // 0.3
        this.MAX_OUT_RATIO = 300000000000000000n; // 0.3
        this.chainId = tokens[0].token.chainId;
        this.id = id;
        this.poolTypeVersion = poolTypeVersion;
        this.address = getPoolAddress(id);
        this.swapFee = swapFee;
        this.tokens = tokens;
        this.tokenMap = new Map(tokens.map(token => [token.token.address, token]));
    }
    getNormalizedLiquidity(tokenIn, tokenOut) {
        const { tIn, tOut } = this.getRequiredTokenPair(tokenIn, tokenOut);
        return (tIn.amount * tOut.weight) / (tIn.weight + tOut.weight);
    }
    getLimitAmountSwap(tokenIn, tokenOut, swapKind) {
        const { tIn, tOut } = this.getRequiredTokenPair(tokenIn, tokenOut);
        if (swapKind === SwapKind.GivenIn) {
            return (tIn.amount * this.MAX_IN_RATIO) / WAD;
        }
        else {
            return (tOut.amount * this.MAX_OUT_RATIO) / WAD;
        }
    }
    swapGivenIn(tokenIn, tokenOut, swapAmount, mutateBalances) {
        const { tIn, tOut } = this.getRequiredTokenPair(tokenIn, tokenOut);
        if (swapAmount.amount > this.getLimitAmountSwap(tokenIn, tokenOut, SwapKind.GivenIn)) {
            throw new Error('Swap amount exceeds the pool limit');
        }
        const amountWithFee = this.subtractSwapFeeAmount(swapAmount);
        const tokenOutScale18 = _calcOutGivenIn(tIn.scale18, tIn.weight, tOut.scale18, tOut.weight, amountWithFee.scale18, this.poolTypeVersion);
        const tokenOutAmount = TokenAmount.fromScale18Amount(tokenOut, tokenOutScale18);
        if (mutateBalances) {
            tIn.increase(swapAmount.amount);
            tOut.decrease(tokenOutAmount.amount);
        }
        return tokenOutAmount;
    }
    swapGivenOut(tokenIn, tokenOut, swapAmount, mutateBalances) {
        const { tIn, tOut } = this.getRequiredTokenPair(tokenIn, tokenOut);
        if (swapAmount.amount > this.getLimitAmountSwap(tokenIn, tokenOut, SwapKind.GivenOut)) {
            throw new Error('Swap amount exceeds the pool limit');
        }
        const tokenInScale18 = _calcInGivenOut(tIn.scale18, tIn.weight, tOut.scale18, tOut.weight, swapAmount.scale18, this.poolTypeVersion);
        const tokenInAmount = this.addSwapFeeAmount(TokenAmount.fromScale18Amount(tokenIn, tokenInScale18, true));
        if (mutateBalances) {
            tIn.increase(tokenInAmount.amount);
            tOut.decrease(swapAmount.amount);
        }
        return tokenInAmount;
    }
    subtractSwapFeeAmount(amount) {
        const feeAmount = amount.mulUpFixed(this.swapFee);
        return amount.sub(feeAmount);
    }
    addSwapFeeAmount(amount) {
        return amount.divUpFixed(MathSol.complementFixed(this.swapFee));
    }
    getRequiredTokenPair(tokenIn, tokenOut) {
        const tIn = this.tokenMap.get(tokenIn.wrapped);
        const tOut = this.tokenMap.get(tokenOut.wrapped);
        if (!tIn || !tOut) {
            throw new Error('Pool does not contain the tokens provided');
        }
        return { tIn, tOut };
    }
}
//# sourceMappingURL=index.js.map