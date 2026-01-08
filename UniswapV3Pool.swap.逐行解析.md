# UniswapV3Pool.swap() 源码逐行解析（教学版）

> 目标：从 swap() 入口到 while 循环与 tick 穿越，建立“代码流程 → 数学含义 → 状态更新”的清晰脑图。

---

## 适用版本

* Uniswap V3 Core
* 以 `UniswapV3Pool.sol` 的 `swap()` 为主线

---

## 行号基准

* 行号来自 `UniswapV3Pool.sol`（Uniswap v3-core v1.0.0）
* 若你本地版本不同，请用对应文件行号替换

---

## 源码行号速查（v1.0.0）

* swap() 入口与参数检查：`UniswapV3Pool.sol:596`
* slot0 缓存与 SwapState 初始化：`UniswapV3Pool.sol:605`
* while 循环主流程：`UniswapV3Pool.sol:640`
* TickBitmap 查找下一个 tick：`UniswapV3Pool.sol:646`
* SwapMath 单步计算：`UniswapV3Pool.sol:663`
* Tick 穿越与流动性更新：`UniswapV3Pool.sol:695`
* 价格/状态落库：`UniswapV3Pool.sol:732`
* 回调与转账结算：`UniswapV3Pool.sol:771`
* Swap 事件：`UniswapV3Pool.sol:786`

---

## 一、swap() 入口：参数与语义

```solidity
function swap(
  address recipient,
  bool zeroForOne,
  int256 amountSpecified,
  uint160 sqrtPriceLimitX96,
  bytes calldata data
) external override lock returns (int256 amount0, int256 amount1)
```

关键概念：

* `recipient`：接收输出资产的一方
* `zeroForOne`：方向。`true` 表示 token0 → token1
* `amountSpecified`：交易量，正值=指定输入，负值=指定输出
* `sqrtPriceLimitX96`：价格保护，swap 最多到这个价格为止

教学提示：

* `amountSpecified` 的正负决定“输入指定”还是“输出指定”
* `sqrtPriceLimitX96` 是防滑点的硬边界
* 行号参考：`UniswapV3Pool.sol:596`

---

## 二、slot0 缓存：swap 所需的核心状态

```solidity
Slot0 memory slot0Start = slot0;
```

slot0 里最重要的字段：

* `sqrtPriceX96`：当前价格（sqrt 形式）
* `tick`：当前 tick
* `liquidity`：当前活跃流动性

教学提示：

* swap 的本质就是让 `sqrtPriceX96` 在 tick 间移动
* `liquidity` 决定价格移动的“阻力”
* 行号参考：`UniswapV3Pool.sol:605`

---

## 三、swap 状态对象：局部变量结构

源码里会构建一个 `SwapState` 与 `StepComputations`：

* `SwapState`：用于保存整个 swap 的动态状态
* `StepComputations`：保存一次“单个 tick 区间”内的计算

典型字段：

* `amountSpecifiedRemaining`：剩余需要成交的数量
* `amountCalculated`：已累计的输出或输入
* `sqrtPriceX96`：当前价格
* `tick`：当前 tick
* `liquidity`：当前活跃流动性

教学提示：

* swap 是一个“while 循环 + 每次处理一个区间”的过程
* 行号参考：`UniswapV3Pool.sol:629`

---

## 四、while 循环骨架（核心流程）

伪代码结构：

```
while (amountRemaining != 0 && sqrtPriceX96 != sqrtPriceLimitX96) {
  找到下一个已初始化 tick
  计算这一步能移动到哪里
  扣减剩余数量，累计输出
  如穿越 tick，则更新流动性
}
```

教学提示：

* 每次循环处理一个 tick 区间
* tick 跨越时，流动性会改变
* 行号参考：`UniswapV3Pool.sol:640`

---

## 五、查找下一个 tick：TickBitmap

核心调用：

```solidity
TickBitmap.nextInitializedTickWithinOneWord(...)
```

作用：

* 在位图中快速找到下一个“被初始化”的 tick
* 减少 gas 并避免遍历所有 tick

教学提示：

* tick 是否初始化决定“跨越时是否有流动性变化”
* 行号参考：`UniswapV3Pool.sol:646`

---

## 六、单步 swap：SwapMath.computeSwapStep

核心调用：

```solidity
SwapMath.computeSwapStep(
  sqrtPriceX96,
  sqrtPriceNextX96,
  liquidity,
  amountRemaining,
  fee
)
```

返回值一般包括：

* `sqrtPriceNextX96`：移动后的价格
* `amountIn` / `amountOut`
* `feeAmount`

教学提示：

* 这一步是“数学 → 代码”的核心映射
* 只在一个 tick 区间内完成计算
* 行号参考：`UniswapV3Pool.sol:663`

---

## 七、Tick 穿越：流动性变化

当价格到达 `tickNext`，且它是初始化的：

```solidity
liquidityNet = ticks.cross(tickNext, ...)
```

逻辑：

* `liquidityNet` 表示该 tick 进入/退出的流动性
* 向上穿越与向下穿越符号相反

教学提示：

* 这是“集中流动性”的核心：不同区间有不同 L
* 行号参考：`UniswapV3Pool.sol:695`

---

## 八、金额累计与事件

每次 swap step 后：

* 更新 `amountSpecifiedRemaining`
* 累计 `amountCalculated`
* 最终更新全局状态并触发 `Swap` 事件

教学提示：

* 事件里的 amount0/amount1 是最终净额
* 行号参考：`UniswapV3Pool.sol:771`

---

## 九、swap 全流程教学图（文字版）

```
进入 swap()
  ↓
读取 slot0 (价格/当前tick/流动性)
  ↓
while 循环
  ├─ 找下一个初始化 tick
  ├─ computeSwapStep 计算价格与数量变化
  ├─ 若到达 tickNext 且已初始化 → cross 更新流动性
  └─ 更新剩余数量/累计输出
  ↓
更新 slot0 + 触发 Swap 事件
```

---

## 十、教学提示：如何带学生看懂 swap()

* 先理解“每个 while 只处理一个区间”
* 把 `SwapMath` 当作黑盒，先关注输入输出
* 再回过头理解 TickBitmap 和 Tick.cross
* 最后补上精度与溢出的处理细节

---

## 附：swap() 关键片段（带行号，v1.0.0）

### while 循环骨架与单步计算

```solidity
// UniswapV3Pool.sol:640
while (state.amountSpecifiedRemaining != 0 && state.sqrtPriceX96 != sqrtPriceLimitX96) {
    StepComputations memory step;
    step.sqrtPriceStartX96 = state.sqrtPriceX96;

    // UniswapV3Pool.sol:646
    (step.tickNext, step.initialized) = tickBitmap.nextInitializedTickWithinOneWord(
        state.tick,
        tickSpacing,
        zeroForOne
    );

    // UniswapV3Pool.sol:663
    (state.sqrtPriceX96, step.amountIn, step.amountOut, step.feeAmount) = SwapMath.computeSwapStep(
        state.sqrtPriceX96,
        (zeroForOne ? step.sqrtPriceNextX96 < sqrtPriceLimitX96 : step.sqrtPriceNextX96 > sqrtPriceLimitX96)
            ? sqrtPriceLimitX96
            : step.sqrtPriceNextX96,
        state.liquidity,
        state.amountSpecifiedRemaining,
        fee
    );
}
```

### Tick 穿越与流动性更新

```solidity
// UniswapV3Pool.sol:695
if (step.initialized) {
    int128 liquidityNet = ticks.cross(
        step.tickNext,
        (zeroForOne ? state.feeGrowthGlobalX128 : feeGrowthGlobal0X128),
        (zeroForOne ? feeGrowthGlobal1X128 : state.feeGrowthGlobalX128),
        cache.secondsPerLiquidityCumulativeX128,
        cache.tickCumulative,
        cache.blockTimestamp
    );
    if (zeroForOne) liquidityNet = -liquidityNet;
    state.liquidity = LiquidityMath.addDelta(state.liquidity, liquidityNet);
}
```

---

> 建议搭配阅读：`SwapMath.sol`、`TickBitmap.sol`、`Tick.sol`。
