# Uniswap V3 数学公式 ↔ Solidity 实现对照表（教学版）

> 目标：用“公式 → 函数 → 作用场景”把 V3 数学模型与核心合约串起来。

---

## 行号基准

* 行号来自 Uniswap v3-core v1.0.0
* 具体文件：`SqrtPriceMath.sol`、`SwapMath.sol`、`TickMath.sol`、`Tick.sol`、`TickBitmap.sol`、`LiquidityMath.sol`
* 若你本地版本不同，请用对应文件行号替换

---

## 一、基础符号速查

| 符号 | 含义 |
| --- | --- |
| P | 价格（token1 / token0） |
| √P | sqrtPrice，使用 Q64.96 表示 |
| L | 流动性（虚拟深度） |
| tick | 价格离散单位，`P = 1.0001 ^ tick` |
| amount0 / amount1 | token0/token1 的数量 |

---

## 二、公式 → 代码对照（核心）

### 1) amount0 / amount1 公式

当价格 P 位于 [Pa, Pb]：

```
amount0 = L * (√Pb - √P) / (√P * √Pb)
amount1 = L * (√P - √Pa)
```

对应函数：

* `SqrtPriceMath.getAmount0Delta`
* `SqrtPriceMath.getAmount1Delta`

使用位置：

* `SwapMath.computeSwapStep`
* `UniswapV3Pool.swap()` 中的 step 计算

教学提示：

* 这两个函数是 swap 计算的基础构件
* 用于把价格变化映射为 token 数量变化
* 行号参考：`SqrtPriceMath.sol:153`、`SqrtPriceMath.sol:182`

源码片段（v1.0.0）：

```solidity
// SqrtPriceMath.sol:153
function getAmount0Delta(
    uint160 sqrtRatioAX96,
    uint160 sqrtRatioBX96,
    uint128 liquidity,
    bool roundUp
) internal pure returns (uint256 amount0) {
    if (sqrtRatioAX96 > sqrtRatioBX96) (sqrtRatioAX96, sqrtRatioBX96) = (sqrtRatioBX96, sqrtRatioAX96);
    uint256 numerator1 = uint256(liquidity) << FixedPoint96.RESOLUTION;
    uint256 numerator2 = sqrtRatioBX96 - sqrtRatioAX96;
    require(sqrtRatioAX96 > 0);
    return
        roundUp
            ? UnsafeMath.divRoundingUp(
                FullMath.mulDivRoundingUp(numerator1, numerator2, sqrtRatioBX96),
                sqrtRatioAX96
            )
            : FullMath.mulDiv(numerator1, numerator2, sqrtRatioBX96) / sqrtRatioAX96;
}

// SqrtPriceMath.sol:182
function getAmount1Delta(
    uint160 sqrtRatioAX96,
    uint160 sqrtRatioBX96,
    uint128 liquidity,
    bool roundUp
) internal pure returns (uint256 amount1) {
    if (sqrtRatioAX96 > sqrtRatioBX96) (sqrtRatioAX96, sqrtRatioBX96) = (sqrtRatioBX96, sqrtRatioAX96);
    return
        roundUp
            ? FullMath.mulDivRoundingUp(liquidity, sqrtRatioBX96 - sqrtRatioAX96, FixedPoint96.Q96)
            : FullMath.mulDiv(liquidity, sqrtRatioBX96 - sqrtRatioAX96, FixedPoint96.Q96);
}
```

---

### 2) 价格推进（给定 amount0/amount1）

关键作用：

* 由 token 输入量反推价格变化

对应函数：

* `SqrtPriceMath.getNextSqrtPriceFromInput`
* `SqrtPriceMath.getNextSqrtPriceFromOutput`

使用位置：

* `SwapMath.computeSwapStep`

教学提示：

* swap 的“价格移动”由这里决定
* 输入与输出指定走不同分支
* 行号参考：`SqrtPriceMath.sol:106`、`SqrtPriceMath.sol:129`

源码片段（v1.0.0）：

```solidity
// SqrtPriceMath.sol:106
function getNextSqrtPriceFromInput(
    uint160 sqrtPX96,
    uint128 liquidity,
    uint256 amountIn,
    bool zeroForOne
) internal pure returns (uint160 sqrtQX96) {
    require(sqrtPX96 > 0);
    require(liquidity > 0);
    return
        zeroForOne
            ? getNextSqrtPriceFromAmount0RoundingUp(sqrtPX96, liquidity, amountIn, true)
            : getNextSqrtPriceFromAmount1RoundingDown(sqrtPX96, liquidity, amountIn, true);
}

// SqrtPriceMath.sol:129
function getNextSqrtPriceFromOutput(
    uint160 sqrtPX96,
    uint128 liquidity,
    uint256 amountOut,
    bool zeroForOne
) internal pure returns (uint160 sqrtQX96) {
    require(sqrtPX96 > 0);
    require(liquidity > 0);
    return
        zeroForOne
            ? getNextSqrtPriceFromAmount1RoundingDown(sqrtPX96, liquidity, amountOut, false)
            : getNextSqrtPriceFromAmount0RoundingUp(sqrtPX96, liquidity, amountOut, false);
}
```

---

### 3) 流动性变化

核心公式直觉：

```
L = 常数（在一个区间内）
```

当跨越 tick：

```
L = L + liquidityNet
```

对应函数：

* `LiquidityMath.addDelta`
* `Tick.cross`

使用位置：

* `UniswapV3Pool.swap()` 穿越 tick 时

教学提示：

* 跨 tick 是 V3 的核心创新
* 不同区间有不同 L
* 行号参考：`LiquidityMath.sol:10`、`Tick.sol:166`

源码片段（v1.0.0）：

```solidity
// LiquidityMath.sol:10
function addDelta(uint128 x, int128 y) internal pure returns (uint128 z) {
    if (y < 0) {
        require((z = x - uint128(-y)) < x, 'LS');
    } else {
        require((z = x + uint128(y)) >= x, 'LA');
    }
}

// Tick.sol:166
function cross(
    mapping(int24 => Tick.Info) storage self,
    int24 tick,
    uint256 feeGrowthGlobal0X128,
    uint256 feeGrowthGlobal1X128,
    uint160 secondsPerLiquidityCumulativeX128,
    int56 tickCumulative,
    uint32 time
) internal returns (int128 liquidityNet) {
    Tick.Info storage info = self[tick];
    info.feeGrowthOutside0X128 = feeGrowthGlobal0X128 - info.feeGrowthOutside0X128;
    info.feeGrowthOutside1X128 = feeGrowthGlobal1X128 - info.feeGrowthOutside1X128;
    info.secondsPerLiquidityOutsideX128 = secondsPerLiquidityCumulativeX128 - info.secondsPerLiquidityOutsideX128;
    info.tickCumulativeOutside = tickCumulative - info.tickCumulativeOutside;
    info.secondsOutside = time - info.secondsOutside;
    liquidityNet = info.liquidityNet;
}
```

---

### 4) 单步 swap 计算

作用：

* 在一个 tick 区间内完成价格与数量计算

对应函数：

* `SwapMath.computeSwapStep`

输入参数：

* 当前价格、目标价格、流动性、剩余数量、手续费

输出：

* 新价格、amountIn、amountOut、feeAmount

教学提示：

* 这是 swap 核心“数学引擎”
* 行号参考：`SwapMath.sol:21`

源码片段（v1.0.0）：

```solidity
// SwapMath.sol:21
function computeSwapStep(
    uint160 sqrtRatioCurrentX96,
    uint160 sqrtRatioTargetX96,
    uint128 liquidity,
    int256 amountRemaining,
    uint24 feePips
)
    internal
    pure
    returns (
        uint160 sqrtRatioNextX96,
        uint256 amountIn,
        uint256 amountOut,
        uint256 feeAmount
    )
{
    bool zeroForOne = sqrtRatioCurrentX96 >= sqrtRatioTargetX96;
    bool exactIn = amountRemaining >= 0;
    if (exactIn) {
        uint256 amountRemainingLessFee = FullMath.mulDiv(uint256(amountRemaining), 1e6 - feePips, 1e6);
        amountIn = zeroForOne
            ? SqrtPriceMath.getAmount0Delta(sqrtRatioTargetX96, sqrtRatioCurrentX96, liquidity, true)
            : SqrtPriceMath.getAmount1Delta(sqrtRatioCurrentX96, sqrtRatioTargetX96, liquidity, true);
        if (amountRemainingLessFee >= amountIn) sqrtRatioNextX96 = sqrtRatioTargetX96;
        else
            sqrtRatioNextX96 = SqrtPriceMath.getNextSqrtPriceFromInput(
                sqrtRatioCurrentX96,
                liquidity,
                amountRemainingLessFee,
                zeroForOne
            );
    } else {
        amountOut = zeroForOne
            ? SqrtPriceMath.getAmount1Delta(sqrtRatioTargetX96, sqrtRatioCurrentX96, liquidity, false)
            : SqrtPriceMath.getAmount0Delta(sqrtRatioCurrentX96, sqrtRatioTargetX96, liquidity, false);
        if (uint256(-amountRemaining) >= amountOut) sqrtRatioNextX96 = sqrtRatioTargetX96;
        else
            sqrtRatioNextX96 = SqrtPriceMath.getNextSqrtPriceFromOutput(
                sqrtRatioCurrentX96,
                liquidity,
                uint256(-amountRemaining),
                zeroForOne
            );
    }
}
```

---

### 5) Tick 离散化与定位

核心关系：

```
price = 1.0001 ^ tick
```

对应函数：

* `TickMath.getSqrtRatioAtTick`
* `TickMath.getTickAtSqrtRatio`

使用位置：

* `UniswapV3Pool.swap()`
* `TickBitmap.nextInitializedTickWithinOneWord`

教学提示：

* tick 解决了“连续价格”不可遍历的问题
* 行号参考：`TickMath.sol:23`、`TickMath.sol:61`、`TickBitmap.sol:42`

源码片段（v1.0.0）：

```solidity
// TickMath.sol:23
function getSqrtRatioAtTick(int24 tick) internal pure returns (uint160 sqrtPriceX96) {
    uint256 absTick = tick < 0 ? uint256(-int256(tick)) : uint256(int256(tick));
    require(absTick <= uint256(MAX_TICK), 'T');
    uint256 ratio = absTick & 0x1 != 0 ? 0xfffcb933bd6fad37aa2d162d1a594001 : 0x100000000000000000000000000000000;
    if (absTick & 0x2 != 0) ratio = (ratio * 0xfff97272373d413259a46990580e213a) >> 128;
    if (absTick & 0x4 != 0) ratio = (ratio * 0xfff2e50f5f656932ef12357cf3c7fdcc) >> 128;
    if (tick > 0) ratio = type(uint256).max / ratio;
    sqrtPriceX96 = uint160((ratio >> 32) + (ratio % (1 << 32) == 0 ? 0 : 1));
}

// TickMath.sol:61
function getTickAtSqrtRatio(uint160 sqrtPriceX96) internal pure returns (int24 tick) {
    require(sqrtPriceX96 >= MIN_SQRT_RATIO && sqrtPriceX96 < MAX_SQRT_RATIO, 'R');
    uint256 ratio = uint256(sqrtPriceX96) << 32;
    uint256 r = ratio;
    uint256 msb = 0;
    // ... 省略位运算细节
}

// TickBitmap.sol:42
function nextInitializedTickWithinOneWord(
    mapping(int16 => uint256) storage self,
    int24 tick,
    int24 tickSpacing,
    bool lte
) internal view returns (int24 next, bool initialized) {
    int24 compressed = tick / tickSpacing;
    if (tick < 0 && tick % tickSpacing != 0) compressed--;
    // ... 省略位图查找细节
}
```

---

## 三、公式与合约的典型路径

教学型路径：

```
swap() 入口
  → TickBitmap 找下一个 tick
  → SwapMath.computeSwapStep (调用 SqrtPriceMath)
  → Tick.cross 更新流动性
  → while 循环继续
```

---

## 四、常见误区（教学版）

* L 不是资金数量，而是“虚拟深度”
* 公式中的 √P 才是真正参与计算的价格
* amountSpecified 正负决定输入/输出指定
* 跨 tick 时才更新 L，不在区间内变化

---

## 五、推荐的阅读顺序

1. `UniswapV3Pool.sol`（swap 入口）
2. `SwapMath.sol`
3. `SqrtPriceMath.sol`
4. `Tick.sol` / `TickBitmap.sol`
5. `LiquidityMath.sol`

---

> 教学建议：先让读者形成“while 循环 + 每次只处理一个区间”的整体认知，再深入公式推导。
