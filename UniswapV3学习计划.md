# Uniswap V3 学习计划（系统版）

> 目标：从 **理解设计 → 掌握数学 → 阅读源码 → 能做定制化研究与开发**

---

## 学习总目标

* 理解 Uniswap V3 相比 V2 的**本质创新**
* 能看懂 **Tick / 流动性 / Swap 的数学含义**
* 能顺着调用链阅读 **核心合约源码**
* 具备 **研究级别分析与改造能力**

---

## 第一阶段：基础准备（V2 对照理解）

### 学习内容

* AMM 基础模型
* Uniswap V2 的设计与问题
* V3 的设计动机

### 关键讲解

Uniswap V2 使用恒定乘积公式：

```
x * y = k
```

直观函数图（恒定乘积曲线，曲线上任意点满足 x*y=k）：

![Uniswap V2 恒定乘积曲线](image.png)

特点：

* 流动性在**全价格区间**平均分布
* 大部分资金在当前价格区间外处于“闲置”状态

V2 的主要问题：

* 资本效率低
* LP 无法控制风险区间
* 单一手续费（0.3%）

V3 的核心目标：

* 集中流动性
* 多手续费档位
* LP 行为更接近专业做市商

---

## 第二阶段：Uniswap V3 核心概念（必学）

### 1. 集中流动性（Concentrated Liquidity）

LP 不再覆盖全价格区间，而是选择：

```
[P_min, P_max]
```

直观示意（仅在区间内提供流动性）：

```
流动性 L
^
|        ██████████
|        ██████████
|        ██████████
|________|_________|________> 价格 P
         P_min     P_max
```

影响：

* 相同资金 → 更深的流动性
* 价格出区间 → 资产变为单边

---

### 2. Tick（价格离散化）

V3 将连续价格离散为 Tick：

```
price = 1.0001 ^ tick
```

* 每个 tick ≈ 0.01% 价格变化
* Tick 是所有数学和状态变化的基础单位

---

### 3. Position（LP 仓位即 NFT）

每个 LP 仓位由以下参数唯一决定：

* token0 / token1
* fee
* tickLower / tickUpper
* liquidity

因此使用 ERC721 表示（NonfungiblePositionManager）。

---

### 4. Fee Tier（手续费档位）

| 手续费   | 适用场景  |
| ----- | ----- |
| 0.05% | 稳定币   |
| 0.3%  | 主流交易对 |
| 1%    | 高波动资产 |

---

## 第三阶段：V3 数学模型（理解层面）

### 1. 流动性 L 的含义

在 V3 中：

```
L ≠ 资金数量
```

L 表示在给定价格区间内的**虚拟深度**。

---

### 2. Token 数量计算（区间内）

当价格 P 位于 [Pa, Pb]：

```
amount0 = L * (√Pb - √P) / (√P * √Pb)
amount1 = L * (√P - √Pa)
```

理解要点：

* 越靠近上界 → token0 越少
* 越靠近下界 → token1 越少

---

### 3. Swap 的本质

Swap 不是简单的余额变化，而是：

* 价格在 tick 之间移动
* 穿越 tick 时更新活跃流动性

---

## 第四阶段：合约架构总览

### 核心合约关系

```
UniswapV3Factory
 └── UniswapV3Pool
       ├── swap()
       ├── mint()
       ├── burn()
       └── collect()
```

---

### 常用外围合约

* NonfungiblePositionManager（LP 操作入口）
* SwapRouter（交易入口）

---

## 第五阶段：实操建议

建议在测试网完成：

* 创建 LP 仓位
* 手动设置 tick 区间
* 调用 collect 提取手续费

---

## 第六阶段：研究与进阶方向

* LP 收益/风险建模
* 自动化区间调整策略
* MEV 对 V3 的影响
* 集中流动性对市场深度的影响

---

# 第二部分：Uniswap V3 源码导向学习路线

> 本部分适合 **偏研究 / 偏工程 / 偏源码分析**

---

## 一、源码整体结构

```
contracts/
 ├── UniswapV3Factory.sol
 ├── UniswapV3Pool.sol
 ├── libraries/
 │    ├── SwapMath.sol
 │    ├── Tick.sol
 │    ├── TickBitmap.sol
 │    ├── LiquidityMath.sol
 │    └── SqrtPriceMath.sol
```

---

## 二、阅读顺序（强烈建议）

### 1️⃣ UniswapV3Pool.sol

重点关注：

* slot0（价格、tick、状态）
* swap() 主流程
* mint / burn

目标：

* 跟踪一次完整 swap 的状态变化

---

### 2️⃣ TickBitmap.sol

作用：

* 快速定位下一个已初始化 tick

理解点：

* 位运算 + gas 优化

---

### 3️⃣ Tick.sol

作用：

* 管理每个 tick 的 liquidityNet
* tick 跨越时的流动性变化

---

### 4️⃣ SwapMath.sol

作用：

* 单个 tick 区间内的 swap 计算

核心：

* 精确控制价格变化
* 防止溢出

---

### 5️⃣ LiquidityMath / SqrtPriceMath

作用：

* L 的加减
* sqrtPrice 与 token 数量换算

---

## 三、源码阅读方法论

* 不要一次看完
* 只跟踪一条 swap 路径
* 用注释画状态转移图

---

## 四、研究级课题建议

* Tick 密度对 gas 的影响
* LP 区间宽度与收益分布
* V3 数学模型在其他 AMM 中的复用
* 军事/机构资金参与 LP 的风险评估模型

---

> 该文档可直接作为 **内部研究 / 教学 / 技术沉淀文档** 使用。
