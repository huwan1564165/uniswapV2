const {expect} = require("chai")
const {ethers} = require("hardhat")

describe("router合约测试",async function () {
    let owner,addr1
    let ownerAddress
    let addr1Addr
    let UniswapV2Factory
    let factory
    let MyTokens0
    let myTokens0
    let MyTokens1
    let myTokens1
    let myTokens0Add
    let myTokens1Add
    let UniswapV2Pair
    let pair
    let pairAdd
    let WETH
    let wETH
    let UniswapV2Router02
    let router
    let routerAddress
    let currentTime
    let deadline
    let factoryAddress
    let wethAddress
    let ethPairAddress
    let UniswapV2ETHPair
    let ethPair
    let FeeTokens0
    let feeTokens0
    let FeeTokens1
    let feeTokens1
    let feeTokens0Addr
    let feeTokens1Addr
    let feePairAddress
    let UniswapV2FeePair
    let feePair
    let feeEthPairAddress
    let feeEthPair
    let UniswapV2FeeEthPair

    this.beforeEach(async function(){
        //获取测试用户
        [owner,addr1] = await ethers.getSigners();
        //获取部署者的钱包地址
        ownerAddress = await owner.getAddress();
        addr1Addr = await addr1.getAddress();
        //获取合约工厂对象
        UniswapV2Factory = await ethers.getContractFactory("UniswapV2Factory");
        //用工厂合约对象部署合约(但还未确认)
        factory = await UniswapV2Factory.deploy(ownerAddress);
        //等待合约部署交易被矿工确认
        await factory.waitForDeployment();
        factoryAddress = await factory.getAddress();
        //获取合约工厂对象
        MyTokens0 = await ethers.getContractFactory("MyTokens");
        //用工厂合约对象部署合约(但还未确认)
        myTokens0 = await MyTokens0.deploy("Test0","T0",ethers.parseUnits("10000"));
        //等待合约部署交易被矿工确认
        await myTokens0.waitForDeployment();

        //获取合约工厂对象
        MyTokens1 = await ethers.getContractFactory("MyTokens");
        //用工厂合约对象部署合约(但还未确认)
        myTokens1 = await MyTokens1.deploy("Test1","T1",ethers.parseUnits("10000"));
        //等待合约部署交易被矿工确认
        await myTokens1.waitForDeployment();

        myTokens0Add = await myTokens0.getAddress();
        myTokens1Add = await myTokens1.getAddress();

        //排序
        token0=myTokens0Add<myTokens1Add?myTokens0Add:myTokens1Add;
        token1=myTokens0Add>myTokens1Add?myTokens0Add:myTokens1Add;

        await factory.createPair(token0,token1);
        pairAdd=await factory.getPair(token0,token1);

        UniswapV2Pair = await ethers.getContractFactory("UniswapV2Pair");
        pair = UniswapV2Pair.attach(pairAdd);

        //获取合约工厂对象
        WETH = await ethers.getContractFactory("WETH9");
        //用工厂合约对象部署合约(但还未确认)
        wETH = await WETH.deploy();
        //等待合约部署交易被矿工确认
        await wETH.waitForDeployment();
        wethAddress = await wETH.getAddress();

        //获取合约工厂对象
        UniswapV2Router02 = await ethers.getContractFactory("UniswapV2Router02");
        //用工厂合约对象部署合约(但还未确认)
        router = await UniswapV2Router02.deploy(factoryAddress,wethAddress);
        //等待合约部署交易被矿工确认
        await router.waitForDeployment();
        routerAddress = await router.getAddress();

        //代币——ETH池子
        await factory.createPair(myTokens0Add,wethAddress);
        ethPairAddress=await factory.getPair(myTokens0Add,wethAddress);

        UniswapV2ETHPair = await ethers.getContractFactory("UniswapV2Pair");
        ethPair = UniswapV2ETHPair.attach(ethPairAddress);

        //收取手续费的代币
        FeeTokens0 = await ethers.getContractFactory("FeeTokens");
        //用工厂合约对象部署合约(但还未确认)
        feeTokens0 = await FeeTokens0.deploy("FeeTest0","FT0",ethers.parseUnits("10000"),5,addr1Addr);
        //等待合约部署交易被矿工确认
        await feeTokens0.waitForDeployment();

        //收取手续费的代币
        FeeTokens1 = await ethers.getContractFactory("FeeTokens");
        //用工厂合约对象部署合约(但还未确认)
        feeTokens1 = await FeeTokens1.deploy("FeeTest1","FT1",ethers.parseUnits("10000"),5,addr1Addr);
        //等待合约部署交易被矿工确认
        await feeTokens1.waitForDeployment();

        feeTokens0Addr=await feeTokens0.getAddress();
        feeTokens1Addr=await feeTokens1.getAddress();

         //收取手续费的代币池子
        await factory.createPair(feeTokens0Addr,feeTokens1Addr);
        feePairAddress=await factory.getPair(feeTokens0Addr,feeTokens1Addr);

        UniswapV2FeePair = await ethers.getContractFactory("UniswapV2Pair");
        feePair = UniswapV2FeePair.attach(feePairAddress);
        
        // 创建ETH-手续费代币的Pair
        await factory.createPair(feeTokens0Addr, wethAddress);
        feeEthPairAddress = await factory.getPair(feeTokens0Addr, wethAddress);
        UniswapV2FeeEthPair = await ethers.getContractFactory("UniswapV2Pair");
        feeEthPair = UniswapV2Pair.attach(feeEthPairAddress);


        // 获取当前区块时间戳（秒）
        // Math.floor向下取整
        currentTime = Math.floor(Date.now() / 1000);
        // 设置10分钟后过期
        deadline = currentTime + 600;  // 600秒 = 10分钟
    })
        
    // //添加流动性函数
    it("测试addLiquidity函数",async function(){
        
        //owner的token0代币数量
        const ownerToken0BalanceBefore= await myTokens0.balanceOf(ownerAddress);
        //owner的token1代币数量
        const ownerToken1BalanceBefore= await myTokens1.balanceOf(ownerAddress);
        //owner的LPToken数量
        const pairLPBalanceBefore = await pair.balanceOf(ownerAddress);
        //pair的token0代币数量
        const pairToken0BalanceBefore= await myTokens0.balanceOf(pairAdd);
        //pair的token1代币数量
        const pairToken1BalanceBefore= await myTokens1.balanceOf(pairAdd);
        //授权
        await myTokens0.approve(routerAddress,ethers.parseUnits("100"));
        await myTokens1.approve(routerAddress,ethers.parseUnits("100"));
        await router.addLiquidity(token0,token1,
            ethers.parseUnits("10"),
            ethers.parseUnits("10"),
            ethers.parseUnits("5"),
            ethers.parseUnits("5"),
            ownerAddress,
            deadline
            )
        //记录值
        //owner的token0代币数量
        const ownerToken0BalanceAfter= await myTokens0.balanceOf(ownerAddress);
        //owner的token1代币数量
        const ownerToken1BalanceAfter= await myTokens1.balanceOf(ownerAddress);
        //owner的LPToken数量
        const pairLPBalanceAfter = await pair.balanceOf(ownerAddress);
        //pair的token0代币数量
        const pairToken0BalanceAfter= await myTokens0.balanceOf(pairAdd);
        //pair的token1代币数量
        const pairToken1BalanceAfter= await myTokens1.balanceOf(pairAdd);
        //计算变化量
        //owner花费的token0代币数量
        const amount0=ownerToken0BalanceBefore-ownerToken0BalanceAfter;
        //owner花费的token1代币数量
        const amount1=ownerToken1BalanceBefore-ownerToken1BalanceAfter;
        //owner获得的LPToken数量
        const liquidityA=pairLPBalanceAfter-pairLPBalanceBefore;
        //pair添加的token0代币数量
        const pairToken0BalanceSub = pairToken0BalanceAfter-pairToken0BalanceBefore;
        //pair添加的token1代币数量
        const pairToken1BalanceSub = pairToken1BalanceAfter-pairToken1BalanceBefore;
        //计算应获得的LPToken数量
        const mulValue= amount0*amount1;
        const sqrtValue= await sqrtBigint(mulValue);
        const liquidityB=sqrtValue-1000n;
        expect(amount0).to.equals(pairToken0BalanceSub);
        expect(amount1).to.equals(pairToken1BalanceSub);
        expect(liquidityA).to.equals(liquidityB);
    })
    it("测试addLiquidityETH函数",async function(){
        // 1. 获取 provider
        const provider = ethers.provider;
        //owner的代币数量
        const ownerToken0BalanceBefore= await myTokens0.balanceOf(ownerAddress);
        //owner的LPToken数量
        const pairLPBalanceBefore = await ethPair.balanceOf(ownerAddress);
        //owner的ETH数量
        const ownerETHBalanceBefore = await provider.getBalance(ownerAddress);
        //owner的WETH数量
        const ownerWETHBalanceBefore = await wETH.balanceOf(ownerAddress);
        //pair的代币数量
        const pairToken0BalanceBefore= await myTokens0.balanceOf(ethPairAddress);
        //pair的WETH数量
        const pairWETHBalanceBefore = await wETH.balanceOf(ethPairAddress);
        //授权
        await myTokens0.approve(routerAddress,ethers.parseUnits("100"));
        const tx = await router.addLiquidityETH(myTokens0Add,
            ethers.parseUnits("100"),
            ethers.parseUnits("50"),
            ethers.parseEther("0.5"),
            ownerAddress,
            deadline,
            {
                value: ethers.parseEther("1"),  // 关键：发送ETH
                gasLimit: 5000000               // 增加gas限制
            }
        )
        
        const receipt = await tx.wait();
        const gasUsed = receipt.gasUsed * receipt.gasPrice;
        //记录值
        //owner的代币数量
        const ownerToken0BalanceAfter= await myTokens0.balanceOf(ownerAddress);
        //owner的LPToken数量
        const pairLPBalanceAfter = await ethPair.balanceOf(ownerAddress);
        //owner的ETH数量
        const ownerETHBalanceAfter = await provider.getBalance(ownerAddress);
        //owner的WETH数量
        const ownerWETHBalanceAfter = await wETH.balanceOf(ownerAddress);
        //pair的代币数量
        const pairToken0BalanceAfter= await myTokens0.balanceOf(ethPairAddress);
        //pair的WETH数量
        const pairWETHBalanceAfter = await wETH.balanceOf(ethPairAddress);

        //计算变化量
        //owner花费的代币数量
        const amount0=ownerToken0BalanceBefore-ownerToken0BalanceAfter;
        //owner花费的ETH数量(包含gas费)
        const ethSpentWithGas = ownerETHBalanceBefore - ownerETHBalanceAfter;
        const ethSpent = ethSpentWithGas-gasUsed;
        //owner获得的LPToken数量
        const liquidityA=pairLPBalanceAfter-pairLPBalanceBefore;
        //pair添加的代币数量
        const pairTokenBalanceSub = pairToken0BalanceAfter-pairToken0BalanceBefore;
        //pair添加的WETH数量
        const pairWETHBalanceSub = pairWETHBalanceAfter-pairWETHBalanceBefore;
        //计算应获得的LPToken数量
        const mulValue= pairTokenBalanceSub*pairWETHBalanceSub;
        const sqrtValue= await sqrtBigint(mulValue);
        const liquidityB=sqrtValue-1000n;
        //验证
        expect(amount0).to.equals(pairTokenBalanceSub);
        expect(liquidityA).to.equals(liquidityB);
        
        //验证2: Owner实际添加的ETH ≈ Pair增加的WETH
        const result = ethSpent>pairWETHBalanceSub?ethSpent-pairWETHBalanceSub:pairWETHBalanceSub-ethSpent;
        //差值小于0.001个ETH
        expect(result).to.be.lt(ethers.parseEther("0.001"));
    })
    

    
    
    //移除流动性测试
    it("测试removeLiquidity函数",async function(){
        //owner的LPToken数量
        const pairLPBalanceBefore = await pair.balanceOf(ownerAddress);
        //授权
        await myTokens0.approve(routerAddress,ethers.parseUnits("100"));
        await myTokens1.approve(routerAddress,ethers.parseUnits("100"));
        await router.addLiquidity(token0,token1,
            ethers.parseUnits("10"),
            ethers.parseUnits("10"),
            ethers.parseUnits("5"),
            ethers.parseUnits("5"),
            ownerAddress,
            deadline
            )
        //记录值
        //owner的token0代币数量
        const ownerToken0BalanceAfter= await myTokens0.balanceOf(ownerAddress);
        //owner的token1代币数量
        const ownerToken1BalanceAfter= await myTokens1.balanceOf(ownerAddress);
        //owner的LPToken数量
        const pairLPBalanceAfter = await pair.balanceOf(ownerAddress);
        //pair的token0代币数量
        const pairToken0BalanceAfter= await myTokens0.balanceOf(pairAdd);
        //pair的token1代币数量
        const pairToken1BalanceAfter= await myTokens1.balanceOf(pairAdd);
        //计算变化量
        const liquidityA=pairLPBalanceAfter-pairLPBalanceBefore;
        await pair.approve(routerAddress,pairLPBalanceAfter)
        await router.removeLiquidity(token0,token1,
            pairLPBalanceAfter,
            ethers.parseUnits("5"),
            ethers.parseUnits("5"), 
            ownerAddress,
            deadline)
        
        //记录值
        //owner的token0代币数量
        const ownerToken0BalanceAfter2= await myTokens0.balanceOf(ownerAddress);
        //owner的token1代币数量
        const ownerToken1BalanceAfter2= await myTokens1.balanceOf(ownerAddress);
        //owner的LPToken数量
        const pairLPBalanceAfter2 = await pair.balanceOf(ownerAddress);
        //pair的token0代币数量
        const pairToken0BalanceAfter2= await myTokens0.balanceOf(pairAdd);
        //pair的token1代币数量
        const pairToken1BalanceAfter2= await myTokens1.balanceOf(pairAdd);

        //计算变化量
        //owner获得的token0代币数量
        const amount0=ownerToken0BalanceAfter2-ownerToken0BalanceAfter;
        //owner获得的token1代币数量
        const amount1=ownerToken1BalanceAfter2-ownerToken1BalanceAfter;
        //pair返还的token0代币数量
        const pairToken0BalanceSub = pairToken0BalanceAfter-pairToken0BalanceAfter2;
        //pair返还的token1代币数量
        const pairToken1BalanceSub = pairToken1BalanceAfter-pairToken1BalanceAfter2;
        //验证owner的LPToken是否销毁
        expect(pairLPBalanceAfter2).to.equals(0)
        //验证返回的token0数量是否正确
        expect(amount0).to.equals(pairToken0BalanceSub)
        //验证返回的token1数量是否正确
        expect(amount1).to.equals(pairToken1BalanceSub)
        //验证用户实际收到的代币数量不低于预期最小值
        expect(amount0).to.be.gt(ethers.parseUnits("5"))
        expect(amount1).to.be.gt(ethers.parseUnits("5"))
    })
    it("测试removeLiquidityETH函数",async function(){
        //owner的LPToken数量
        const pairLPBalanceBefore = await ethPair.balanceOf(ownerAddress);
        //授权
        await myTokens0.approve(routerAddress,ethers.parseUnits("100"));
        const tx = await router.addLiquidityETH(myTokens0Add,
            ethers.parseUnits("100"),
            ethers.parseUnits("50"),
            ethers.parseEther("0.5"),
            ownerAddress,
            deadline,
            {
                value: ethers.parseEther("1"),  // 关键：发送ETH
            }
        )
        const receipt = await tx.wait();
        const gasUsed = receipt.gasUsed * receipt.gasPrice;
        // 1. 获取 provider
        const provider = ethers.provider;
        //owner的代币数量
        const ownerToken0BalanceBefore= await myTokens0.balanceOf(ownerAddress);
        //owner的LPToken数量
        const pairLPBalanceAfter = await ethPair.balanceOf(ownerAddress);
        //owner的ETH数量
        const ownerETHBalanceBefore = await provider.getBalance(ownerAddress);
        //owner的WETH数量
        const ownerWETHBalanceBefore = await wETH.balanceOf(ownerAddress);
        //pair的代币数量
        const pairToken0BalanceBefore= await myTokens0.balanceOf(ethPairAddress);
        //pair的WETH数量
        const pairWETHBalanceBefore = await wETH.balanceOf(ethPairAddress);
        //计算变化量
        const liquidityA=pairLPBalanceAfter-pairLPBalanceBefore;
        await ethPair.approve(routerAddress,pairLPBalanceAfter)
        const removeTx = await router.removeLiquidityETH(myTokens0Add,
            pairLPBalanceAfter,
            ethers.parseUnits("5"),
            ethers.parseEther("0.001"), 
            ownerAddress,
            deadline)
        
        const removeReceipt = await removeTx.wait();
        const removeGasUsed = removeReceipt.gasUsed * removeReceipt.gasPrice;
        //记录值
        //owner的代币数量
        const ownerToken0BalanceAfter= await myTokens0.balanceOf(ownerAddress);
        //owner的LPToken数量
        const pairLPBalanceAfter2 = await ethPair.balanceOf(ownerAddress);
        //owner的ETH数量
        const ownerETHBalanceAfter = await provider.getBalance(ownerAddress);
        //owner的WETH数量
        const ownerWETHBalanceAfter = await wETH.balanceOf(ownerAddress);
        //pair的代币数量
        const pairToken0BalanceAfter= await myTokens0.balanceOf(ethPairAddress);
        //pair的WETH数量
        const pairWETHBalanceAfter = await wETH.balanceOf(ethPairAddress);

        //计算变化量
        //owner获得的token0代币数量
        const amount0=ownerToken0BalanceAfter-ownerToken0BalanceBefore;
        //owner获得的ETH数量
        const amount1=(ownerETHBalanceAfter+removeGasUsed)-ownerETHBalanceBefore;
        //pair返还的token0代币数量
        const pairToken0BalanceSub = pairToken0BalanceBefore-pairToken0BalanceAfter;
        //pair返还的WETH数量
        const pairWETHBalanceSub = pairWETHBalanceBefore-pairWETHBalanceAfter;
        //验证owner的LPToken是否销毁
        expect(pairLPBalanceAfter2).to.equals(0)
        //验证返回的token0数量是否正确
        expect(amount0).to.equals(pairToken0BalanceSub)
        //验证Owner实际添加的ETH ≈ Pair返回的WETH
        const result = amount1>pairWETHBalanceSub?amount1-pairWETHBalanceSub:pairWETHBalanceSub-amount1;
        //差值小于0.001个ETH
        expect(result).to.be.lt(ethers.parseEther("0.001"));
        //验证用户实际收到的代币数量不低于预期最小值
        expect(amount0).to.be.gt(ethers.parseUnits("5"))
    })

    it("测试removeLiquidityWithPermit函数",async function(){
        //授权
        await myTokens0.approve(routerAddress,ethers.parseUnits("100"));
        await myTokens1.approve(routerAddress,ethers.parseUnits("100"));
        await router.addLiquidity(token0,token1,
            ethers.parseUnits("100"),
            ethers.parseUnits("100"),
            ethers.parseUnits("5"),
            ethers.parseUnits("5"),
            ownerAddress,
            deadline
            )
        
        //记录值
        //owner的token0代币数量
        const ownerToken0BalanceBefore= await myTokens0.balanceOf(ownerAddress);
        //owner的token1代币数量
        const ownerToken1BalanceBefore= await myTokens1.balanceOf(ownerAddress);
        //owner的LPToken数量
        const pairLPBalanceBefore = await pair.balanceOf(ownerAddress);
        //pair的token0代币数量
        const pairToken0BalanceBefore= await myTokens0.balanceOf(pairAdd);
        //pair的token1代币数量
        const pairToken1BalanceBefore= await myTokens1.balanceOf(pairAdd);

        //创建签名
        const chainId = (await ethers.provider.getNetwork()).chainId;
        
        const signature = await createPermitSignature(
            pair,                      // Pair合约
            owner,                     // 签名者（LP所有者）
            routerAddress,             // 被授权者（Router）
            pairLPBalanceBefore,              // 授权数量
            deadline,            // 授权过期时间
            chainId                    // 链ID
        );

        //调用removeLiquidityWithPermit
        await router.removeLiquidityWithPermit(
            token0,
            token1,
            pairLPBalanceBefore,
            ethers.parseUnits("5"),
            ethers.parseUnits("5"),
            ownerAddress,
            deadline,
            false,
            signature.v,
            signature.r,
            signature.s
        )

        //记录值
        //owner的token0代币数量
        const ownerToken0BalanceAfter= await myTokens0.balanceOf(ownerAddress);
        //owner的token1代币数量
        const ownerToken1BalanceAfter= await myTokens1.balanceOf(ownerAddress);
        //owner的LPToken数量
        const pairLPBalanceAfter = await pair.balanceOf(ownerAddress);
        //pair的token0代币数量
        const pairToken0BalanceAfter= await myTokens0.balanceOf(pairAdd);
        //pair的token1代币数量
        const pairToken1BalanceAfter= await myTokens1.balanceOf(pairAdd);
        //计算变化量
        //owner获得的token0代币数量
        const amount0=ownerToken0BalanceAfter-ownerToken0BalanceBefore;
        //owner获得的token1代币数量
        const amount1=ownerToken1BalanceAfter-ownerToken1BalanceBefore;
        //pair返还的token0代币数量
        const pairToken0BalanceSub = pairToken0BalanceBefore-pairToken0BalanceAfter;
        //pair返还的token1代币数量
        const pairToken1BalanceSub = pairToken1BalanceBefore-pairToken1BalanceAfter;

        //验证owner的LPToken是否销毁
        expect(pairLPBalanceAfter).to.equals(0)
        //验证返回的token0数量是否正确
        expect(amount0).to.equals(pairToken0BalanceSub)
        //验证返回的token1数量是否正确
        expect(amount1).to.equals(pairToken1BalanceSub)
        //验证用户实际收到的代币数量不低于预期最小值
        expect(amount0).to.be.gt(ethers.parseUnits("5"))
        expect(amount1).to.be.gt(ethers.parseUnits("5"))

    })

    
    it("测试removeLiquidityETHWithPermit函数", async function(){
        // 先添加流动性
        await myTokens0.approve(routerAddress, ethers.parseUnits("100"));
        const tx = await router.addLiquidityETH(
            myTokens0Add,
            ethers.parseUnits("100"),
            ethers.parseUnits("50"),
            ethers.parseEther("0.5"),
            ownerAddress,
            deadline,
            {
                value: ethers.parseEther("1"),
            }
        )
        await tx.wait();
        
        // 获取 provider
        const provider = ethers.provider;
        
        // 记录添加流动性后的状态
        const ownerToken0BalanceBefore = await myTokens0.balanceOf(ownerAddress);
        const ownerETHBalanceBefore = await provider.getBalance(ownerAddress);
        const pairLPBalanceAfter = await ethPair.balanceOf(ownerAddress);
        
        // 获取 Pair 池子的状态
        const pairToken0BalanceBefore = await myTokens0.balanceOf(ethPairAddress);
        const pairWETHBalanceBefore = await wETH.balanceOf(ethPairAddress);
        
        // 创建签名
        const chainId = (await ethers.provider.getNetwork()).chainId;
        
        // 注意：这里应该使用最新的 LP token 余额，不是添加前的余额
        // 并且应该使用一个新的 deadline 用于 permit
        const permitDeadline = Math.floor(Date.now() / 1000) + 600; // 10分钟后过期
        
        const signature = await createPermitSignature(
            ethPair,                     // Pair合约
            owner,                      // 签名者（LP所有者）
            routerAddress,              // 被授权者（Router）
            pairLPBalanceAfter,         // 授权数量（使用最新的余额）
            permitDeadline,             // 授权过期时间
            chainId                     // 链ID
        );

        // 调用 removeLiquidityETHWithPermit
        const removeTx = await router.removeLiquidityETHWithPermit(
            myTokens0Add,
            pairLPBalanceAfter,         // 要移除的流动性数量
            ethers.parseUnits("5"),     // token0 最小输出
            ethers.parseEther("0.001"), // ETH 最小输出
            ownerAddress,
            permitDeadline,             // 使用 permit 的 deadline
            false,                      // approveMax
            signature.v,
            signature.r,
            signature.s
        )
        
        const removeReceipt = await removeTx.wait();
        const removeGasUsed = removeReceipt.gasUsed * removeReceipt.gasPrice;
        
        // 记录移除流动性后的状态
        const ownerToken0BalanceAfter = await myTokens0.balanceOf(ownerAddress);
        const ownerETHBalanceAfter = await provider.getBalance(ownerAddress);
        const pairLPBalanceAfter2 = await ethPair.balanceOf(ownerAddress);
        
        const pairToken0BalanceAfter = await myTokens0.balanceOf(ethPairAddress);
        const pairWETHBalanceAfter = await wETH.balanceOf(ethPairAddress);

        // 计算变化量
        const amount0 = ownerToken0BalanceAfter - ownerToken0BalanceBefore;
        const amount1 = (ownerETHBalanceAfter + removeGasUsed) - ownerETHBalanceBefore;
        const pairToken0BalanceSub = pairToken0BalanceBefore - pairToken0BalanceAfter;
        const pairWETHBalanceSub = pairWETHBalanceBefore - pairWETHBalanceAfter;
        
        // 验证
        expect(pairLPBalanceAfter2).to.equals(0);
        expect(amount0).to.equals(pairToken0BalanceSub);
        
        // 验证实际收到的 ETH 和 Pair 减少的 WETH 基本一致
        const diff = amount1 > pairWETHBalanceSub 
            ? amount1 - pairWETHBalanceSub 
            : pairWETHBalanceSub - amount1;
        
        expect(diff).to.be.lt(ethers.parseEther("0.001"));
        expect(amount0).to.be.gt(ethers.parseUnits("5"));
    });

    it("测试removeLiquidityETHSupportingFeeOnTransferTokens函数", async function(){
        //owner的LPToken数量
        const pairLPBalanceBefore = await ethPair.balanceOf(ownerAddress);
        //授权
        await myTokens0.approve(routerAddress,ethers.parseUnits("100"));
        const tx = await router.addLiquidityETH(myTokens0Add,
            ethers.parseUnits("100"),
            ethers.parseUnits("50"),
            ethers.parseEther("0.5"),
            ownerAddress,
            deadline,
            {
                value: ethers.parseEther("1") // 关键：发送ETH
            }
        )
        const receipt = await tx.wait();
        const gasUsed = receipt.gasUsed * receipt.gasPrice;
        // 1. 获取 provider
        const provider = ethers.provider;
        //owner的代币数量
        const ownerToken0BalanceBefore= await myTokens0.balanceOf(ownerAddress);
        //owner的LPToken数量
        const pairLPBalanceAfter = await ethPair.balanceOf(ownerAddress);
        //owner的ETH数量
        const ownerETHBalanceBefore = await provider.getBalance(ownerAddress);
        //owner的WETH数量
        const ownerWETHBalanceBefore = await wETH.balanceOf(ownerAddress);
        //pair的代币数量
        const pairToken0BalanceBefore= await myTokens0.balanceOf(ethPairAddress);
        //pair的WETH数量
        const pairWETHBalanceBefore = await wETH.balanceOf(ethPairAddress);
        //计算变化量
        const liquidityA=pairLPBalanceAfter-pairLPBalanceBefore;
        await ethPair.approve(routerAddress,pairLPBalanceAfter)
        const removeTx = await router.removeLiquidityETHSupportingFeeOnTransferTokens(myTokens0Add,
            pairLPBalanceAfter,
            ethers.parseUnits("5"),
            ethers.parseEther("0.001"), 
            ownerAddress,
            deadline)
        
        const removeReceipt = await removeTx.wait();
        const removeGasUsed = removeReceipt.gasUsed * removeReceipt.gasPrice;
        //记录值
        //owner的代币数量
        const ownerToken0BalanceAfter= await myTokens0.balanceOf(ownerAddress);
        //owner的LPToken数量
        const pairLPBalanceAfter2 = await ethPair.balanceOf(ownerAddress);
        //owner的ETH数量
        const ownerETHBalanceAfter = await provider.getBalance(ownerAddress);
        //owner的WETH数量
        const ownerWETHBalanceAfter = await wETH.balanceOf(ownerAddress);
        //pair的代币数量
        const pairToken0BalanceAfter= await myTokens0.balanceOf(ethPairAddress);
        //pair的WETH数量
        const pairWETHBalanceAfter = await wETH.balanceOf(ethPairAddress);

        //计算变化量
        //owner获得的token0代币数量
        const amount0=ownerToken0BalanceAfter-ownerToken0BalanceBefore;
        //owner获得的ETH数量
        const amount1=(ownerETHBalanceAfter+removeGasUsed)-ownerETHBalanceBefore;
        //pair返还的token0代币数量
        const pairToken0BalanceSub = pairToken0BalanceBefore-pairToken0BalanceAfter;
        //pair返还的WETH数量
        const pairWETHBalanceSub = pairWETHBalanceBefore-pairWETHBalanceAfter;
        //验证owner的LPToken是否销毁
        expect(pairLPBalanceAfter2).to.equals(0)
        //验证返回的token0数量是否正确
        expect(amount0).to.equals(pairToken0BalanceSub)
        expect(await myTokens0.balanceOf(routerAddress)).to.equals(0)
        //验证Owner实际添加的ETH ≈ Pair返回的WETH
        const result = amount1>pairWETHBalanceSub?amount1-pairWETHBalanceSub:pairWETHBalanceSub-amount1;
        //差值小于0.001个ETH
        expect(result).to.be.lt(ethers.parseEther("0.001"));
        //验证用户实际收到的代币数量不低于预期最小值
        expect(amount0).to.be.gt(ethers.parseUnits("5"))
    })

    it("测试removeLiquidityETHWithPermitSupportingFeeOnTransferTokens函数", async function(){
        // 先添加流动性
        await myTokens0.approve(routerAddress, ethers.parseUnits("100"));
        const tx = await router.addLiquidityETH(
            myTokens0Add,
            ethers.parseUnits("100"),
            ethers.parseUnits("50"),
            ethers.parseEther("0.5"),
            ownerAddress,
            deadline,
            {
                value: ethers.parseEther("1"),
            }
        )
        await tx.wait();
        
        // 获取 provider
        const provider = ethers.provider;
        
        // 记录添加流动性后的状态
        const ownerToken0BalanceBefore = await myTokens0.balanceOf(ownerAddress);
        const ownerETHBalanceBefore = await provider.getBalance(ownerAddress);
        const pairLPBalanceAfter = await ethPair.balanceOf(ownerAddress);
        
        // 获取 Pair 池子的状态
        const pairToken0BalanceBefore = await myTokens0.balanceOf(ethPairAddress);
        const pairWETHBalanceBefore = await wETH.balanceOf(ethPairAddress);
        
        // 创建签名
        const chainId = (await ethers.provider.getNetwork()).chainId;
        
        // 注意：这里应该使用最新的 LP token 余额，不是添加前的余额
        // 并且应该使用一个新的 deadline 用于 permit
        const permitDeadline = Math.floor(Date.now() / 1000) + 600; // 10分钟后过期
        
        const signature = await createPermitSignature(
            ethPair,                     // Pair合约
            owner,                      // 签名者（LP所有者）
            routerAddress,              // 被授权者（Router）
            pairLPBalanceAfter,         // 授权数量（使用最新的余额）
            permitDeadline,             // 授权过期时间
            chainId                     // 链ID
        );

        // 调用 removeLiquidityETHWithPermit
        const removeTx = await router.removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(
            myTokens0Add,
            pairLPBalanceAfter,         // 要移除的流动性数量
            ethers.parseUnits("5"),     // token0 最小输出
            ethers.parseEther("0.001"), // ETH 最小输出
            ownerAddress,
            permitDeadline,             // 使用 permit 的 deadline
            false,                      // approveMax
            signature.v,
            signature.r,
            signature.s
        )
        
        const removeReceipt = await removeTx.wait();
        const removeGasUsed = removeReceipt.gasUsed * removeReceipt.gasPrice;
        
        // 记录移除流动性后的状态
        const ownerToken0BalanceAfter = await myTokens0.balanceOf(ownerAddress);
        const ownerETHBalanceAfter = await provider.getBalance(ownerAddress);
        const pairLPBalanceAfter2 = await ethPair.balanceOf(ownerAddress);
        
        const pairToken0BalanceAfter = await myTokens0.balanceOf(ethPairAddress);
        const pairWETHBalanceAfter = await wETH.balanceOf(ethPairAddress);

        // 计算变化量
        const amount0 = ownerToken0BalanceAfter - ownerToken0BalanceBefore;
        const amount1 = (ownerETHBalanceAfter + removeGasUsed) - ownerETHBalanceBefore;
        const pairToken0BalanceSub = pairToken0BalanceBefore - pairToken0BalanceAfter;
        const pairWETHBalanceSub = pairWETHBalanceBefore - pairWETHBalanceAfter;
        
        // 验证
        expect(pairLPBalanceAfter2).to.equals(0);
        expect(amount0).to.equals(pairToken0BalanceSub);
        
        // 验证实际收到的 ETH 和 Pair 减少的 WETH 基本一致
        const diff = amount1 > pairWETHBalanceSub 
            ? amount1 - pairWETHBalanceSub 
            : pairWETHBalanceSub - amount1;
        
        expect(diff).to.be.lt(ethers.parseEther("0.001"));
        expect(amount0).to.be.gt(ethers.parseUnits("5"));
    })

    //SWAP函数测试
    it("测试swapExactTokensForTokens函数", async function(){
        //先添加流动性
        await myTokens0.approve(routerAddress,ethers.parseUnits("100"));
        await myTokens1.approve(routerAddress,ethers.parseUnits("100"));
        await router.addLiquidity(token0,token1,
            ethers.parseUnits("100"),
            ethers.parseUnits("100"),
            ethers.parseUnits("5"),
            ethers.parseUnits("5"),
            ownerAddress,
            deadline
            )
        
        //当前储备量
        const [reserveIn, reserveOut] = await pair.getReserves();
        const aomuntOutBefore = await myTokens1.balanceOf(ownerAddress);
        //用确定数量的代币A，换取最少数量要求的代币B
        await myTokens0.approve(routerAddress,ethers.parseUnits("10"));
        await router.swapExactTokensForTokens(
            ethers.parseUnits("10"),
            ethers.parseUnits("1"),
            [myTokens0Add,myTokens1Add],
            ownerAddress,
            deadline
        )
        //记录值
        //owner的token1余额
        const aomuntOutAfter = await myTokens1.balanceOf(ownerAddress);
        
        const amountIn = ethers.parseUnits("10");

        //计算变化量
        const amountOut = aomuntOutAfter-aomuntOutBefore;
        //计算应输出的代币数量
        const amountInWithFee = amountIn * 997n;
        const numerator = amountInWithFee * reserveOut;
        const denominator = reserveIn * 1000n + amountInWithFee;
        const amountOut1 = numerator / denominator;
        console.log("amountOut:",amountOut)
        console.log("amountOut1:",amountOut1)
        expect(amountOut).to.be.gt(ethers.parseUnits("1"));
        expect(amountOut).to.equals(amountOut1);
    })
    it("测试swapTokensForExactTokens函数",async function (){
        //先添加流动性
        await myTokens0.approve(routerAddress,ethers.parseUnits("100"));
        await myTokens1.approve(routerAddress,ethers.parseUnits("100"));
        await router.addLiquidity(token0,token1,
            ethers.parseUnits("100"),
            ethers.parseUnits("100"),
            ethers.parseUnits("5"),
            ethers.parseUnits("5"),
            ownerAddress,
            deadline
            )
        
        //当前储备量
        const [reserveIn, reserveOut] = await pair.getReserves();
        const aomuntOutBefore = await myTokens1.balanceOf(ownerAddress);
        const aomuntInBefore = await myTokens0.balanceOf(ownerAddress);
        //用不超过指定数量的代币A，换取确定数量的代币B
        await myTokens0.approve(routerAddress,ethers.parseUnits("20"));
        await router.swapTokensForExactTokens(
            ethers.parseUnits("5"),
            ethers.parseUnits("10"),
            [myTokens0Add,myTokens1Add],
            ownerAddress,
            deadline
        )
        //记录值
        //owner的token1余额
        const aomuntOutAfter = await myTokens1.balanceOf(ownerAddress);
        //owner的token0余额
        const aomuntInAfter = await myTokens0.balanceOf(ownerAddress);


        //计算变化量
        const amountIn = aomuntInBefore-aomuntInAfter;
        const amountOut = ethers.parseUnits("5");
        //计算应输出的代币数量
        const numerator = amountOut * reserveIn * 1000n;
        const denominator = (reserveOut - amountOut) * 997n;
        const amountIn1 = (numerator / denominator)+1n;
        expect(amountIn).to.be.gt(ethers.parseUnits("1"));
        expect(amountIn).to.equals(amountIn1);
    })
    it("测试swapExactETHForTokens函数", async function(){
        //授权
        await myTokens0.approve(routerAddress,ethers.parseUnits("100"));
        //先添加流动性
        const tx = await router.addLiquidityETH(
            myTokens0Add,
            ethers.parseUnits("100"),
            ethers.parseUnits("50"),
            ethers.parseEther("0.5"),
            ownerAddress,
            deadline,
            {
                value: ethers.parseEther("1"),  // 关键：发送ETH
            }
        )
        const receipt = await tx.wait();
        const gasUsed = receipt.gasUsed * receipt.gasPrice;
        
        //当前储备量
        const [reserveIn, reserveOut] = await ethPair.getReserves();
        const aomuntOutBefore = await myTokens0.balanceOf(ownerAddress);
        //用确定数量的ETH购买代币
        await router.swapExactETHForTokens(
            ethers.parseUnits("1"),
            [wethAddress,myTokens0Add],
            ownerAddress,
            deadline,
            {
                value: ethers.parseEther("0.05")
            }
        )
        //记录值
        //owner的token0余额
        const aomuntOutAfter = await myTokens0.balanceOf(ownerAddress);
        
        const amountIn = ethers.parseEther("0.05");

        //计算变化量
        const amountOut = aomuntOutAfter-aomuntOutBefore;
        //计算应输出的代币数量
        const amountInWithFee = amountIn * 997n;
        const numerator = amountInWithFee * reserveOut;
        const denominator = reserveIn * 1000n + amountInWithFee;
        const amountOut1 = numerator / denominator;
        console.log("amountOut:",amountOut)
        console.log("amountOut1:",amountOut1)
        expect(amountOut).to.be.gt(ethers.parseUnits("1"));
        expect(amountOut).to.equals(amountOut1);
        expect(aomuntOutAfter).to.equals(aomuntOutBefore+amountOut)
    })
    it("测试swapTokensForExactETH函数", async function(){
        //授权
        await myTokens0.approve(routerAddress,ethers.parseUnits("100"));
        //先添加流动性
        const tx = await router.addLiquidityETH(
            myTokens0Add,
            ethers.parseUnits("100"),
            ethers.parseUnits("50"),
            ethers.parseEther("0.5"),
            ownerAddress,
            deadline,
            {
                value: ethers.parseEther("1"),  // 关键：发送ETH
            }
        )
        const receipt = await tx.wait();
        const gasUsed = receipt.gasUsed * receipt.gasPrice;
        
        //当前储备量
        const [reserveOut, reserveIn] = await ethPair.getReserves();
        const aomuntOutBefore = await wETH.balanceOf(ownerAddress);
        const aomuntInBefore = await myTokens0.balanceOf(ownerAddress);
        //用代币换取确定数量的ETH
        await myTokens0.approve(routerAddress,ethers.parseUnits("50"));
        await router.swapTokensForExactETH(
            ethers.parseEther("0.01"),
            ethers.parseUnits("50"),
            [myTokens0Add,wethAddress],
            ownerAddress,
            deadline
        )
        //记录值
        //owner的token1余额
        const aomuntOutAfter = await wETH.balanceOf(ownerAddress);
        //owner的token0余额
        const aomuntInAfter = await myTokens0.balanceOf(ownerAddress);


        //计算变化量
        const amountIn = aomuntInBefore-aomuntInAfter;
        const amountOut = ethers.parseEther("0.01");
        //计算应输出的代币数量
        const amountOutBigInt = BigInt(amountOut.toString());
        const reserveInBigInt = BigInt(reserveIn.toString());
        const reserveOutBigInt = BigInt(reserveOut.toString());

        const numerator = reserveInBigInt * amountOutBigInt * 1000n;
        const denominator = (reserveOutBigInt - amountOutBigInt) * 997n;
        const amountIn1 = (numerator / denominator) + 1n;
        expect(amountIn).to.be.lt(ethers.parseUnits("50"));
        expect(amountIn).to.equals(amountIn1);
    })
    it("测试swapExactTokensForETH函数", async function(){
        //授权
        await myTokens0.approve(routerAddress,ethers.parseUnits("100"));
        //先添加流动性
        const tx = await router.addLiquidityETH(
            myTokens0Add,
            ethers.parseUnits("100"),
            ethers.parseUnits("50"),
            ethers.parseEther("0.5"),
            ownerAddress,
            deadline,
            {
                value: ethers.parseEther("1"),  // 关键：发送ETH
            }
        )
        const receipt = await tx.wait();
        const gasUsed = receipt.gasUsed * receipt.gasPrice;
        
        //当前储备量
        const [reserveOut, reserveIn] = await ethPair.getReserves();
        const aomuntOutBefore = await wETH.balanceOf(ethPairAddress);
        await myTokens0.approve(routerAddress,ethers.parseUnits("50"));
        //卖出确定数量的代币换取ETH
        await router.swapExactTokensForETH(
            ethers.parseUnits("50"),
            ethers.parseEther("0.01"),
            [myTokens0Add,wethAddress],
            ownerAddress,
            deadline,
        )
        
        const amountIn = ethers.parseUnits("50");
        const aomuntOutAfter = await wETH.balanceOf(ethPairAddress);
        //计算变化量
        const amountOut = aomuntOutBefore-aomuntOutAfter;
        //计算应输出的代币数量
        const amountInWithFee = amountIn * 997n;
        const numerator = amountInWithFee * reserveOut;
        const denominator = reserveIn * 1000n + amountInWithFee;
        const amountOut1 = numerator / denominator;
        console.log("amountOut:",amountOut)
        console.log("amountOut1:",amountOut1)
        expect(amountOut).to.be.gt(ethers.parseEther("0.01"));
        expect(amountOut).to.equals(amountOut1);
    })
    it("测试swapETHForExactTokens函数", async function(){
        //授权
        await myTokens0.approve(routerAddress,ethers.parseUnits("100"));
        //先添加流动性
        const tx = await router.addLiquidityETH(
            myTokens0Add,
            ethers.parseUnits("100"),
            ethers.parseUnits("50"),
            ethers.parseEther("0.5"),
            ownerAddress,
            deadline,
            {
                value: ethers.parseEther("1"),  // 关键：发送ETH
            }
        )
        const receipt = await tx.wait();
        const gasUsed = receipt.gasUsed * receipt.gasPrice;
        
        //当前储备量
        const [reserveIn, reserveOut] = await ethPair.getReserves();
        const aomuntInBefore = await wETH.balanceOf(ethPairAddress);
        const aomuntOutBefore = await myTokens0.balanceOf(ownerAddress);
        //用ETH购买确定数量的代币
        await router.swapETHForExactTokens(
            ethers.parseUnits("10"),
            [wethAddress,myTokens0Add],
            ownerAddress,
            deadline,
            {
                value:ethers.parseEther("0.8")
            }
        )
        //记录值
        //owner的token1余额
        const aomuntInAfter = await wETH.balanceOf(ethPairAddress);
        //owner的token0余额
        const aomuntOutAfter = await myTokens0.balanceOf(ownerAddress);


        //计算变化量
        const amountIn = aomuntInAfter-aomuntInBefore;
        const amountOut = ethers.parseUnits("10");
        //计算应输出的代币数量
        const amountOutBigInt = BigInt(amountOut.toString());
        const reserveInBigInt = BigInt(reserveIn.toString());
        const reserveOutBigInt = BigInt(reserveOut.toString());

        const numerator = reserveInBigInt * amountOutBigInt * 1000n;
        const denominator = (reserveOutBigInt - amountOutBigInt) * 997n;
        const amountIn1 = (numerator / denominator) + 1n;
        expect(amountIn).to.be.gt(ethers.parseEther("0"));
        expect(amountIn).to.equals(amountIn1);
    })
    it("测试swapExactTokensForTokensSupportingFeeOnTransferTokens函数", async function(){
        //先添加流动性
        await feeTokens0.approve(routerAddress,ethers.parseUnits("100"));
        await feeTokens1.approve(routerAddress,ethers.parseUnits("100"));
        await router.addLiquidity(feeTokens0Addr,feeTokens1Addr,
            ethers.parseUnits("100"),
            ethers.parseUnits("100"),
            ethers.parseUnits("5"),
            ethers.parseUnits("5"),
            ownerAddress,
            deadline
            )
        
        //当前储备量
        //const [reserveOut, reserveIn] = await feePair.getReserves();
        //const [reserveIn, reserveOut] = await feePair.getReserves();
         // 正确获取储备量（根据代币地址排序）
        const [reserve0, reserve1] = await feePair.getReserves();
        const token0Address = await feePair.token0();
        const token1Address = await feePair.token1();
        
        // 确定哪个储备对应哪个代币
        let reserveIn, reserveOut;
        if (token0Address.toLowerCase() === feeTokens0Addr.toLowerCase()) {
            // token0 是 feeTokens0
            reserveIn = reserve0;
            reserveOut = reserve1;
        } else {
            // token0 是 feeTokens1
            reserveIn = reserve1;
            reserveOut = reserve0;
        }

        const aomuntOutBefore = await feeTokens1.balanceOf(ownerAddress);
        //router的token1余额
        const routerAomuntOutBefore = await feeTokens1.balanceOf(routerAddress);
        
        console.log("feeReceiver",await feeTokens1.balanceOf(addr1.getAddress()))
        //用确定数量的代币A，换取最少数量要求的代币B
        await feeTokens0.approve(routerAddress,ethers.parseUnits("10"));
        await router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
            ethers.parseUnits("10"),
            ethers.parseUnits("1"),
            [feeTokens0Addr,feeTokens1Addr],
            ownerAddress,
            deadline
        )
        //记录值
        //owner的token1余额
        const aomuntOutAfter = await feeTokens1.balanceOf(ownerAddress);
        //router的token1余额
        const routerAomuntOutAfter = await feeTokens1.balanceOf(routerAddress);
        const pairAomuntOutAfter = await feeTokens0.balanceOf(feePairAddress);
        const amountIn = pairAomuntOutAfter-reserveIn;

        //计算变化量
        const amountOut = aomuntOutAfter-aomuntOutBefore;

        //计算应输出的代币数量
        console.log("reserveIn",reserveIn)
        console.log("reserveOut",reserveOut)
        const amountInWithFee = amountIn * 997n;
        const numerator = amountInWithFee * reserveOut;
        const denominator = reserveIn * 1000n + amountInWithFee;
        const amountOut1 = numerator / denominator;
        console.log("aomuntOutBefore",aomuntOutBefore)
        console.log("aomuntOutAfter",aomuntOutAfter)
        console.log("feeReceiver",await feeTokens1.balanceOf(addr1.getAddress()))
        console.log("owner",ownerAddress)
        console.log("addr1Addr",await addr1.getAddress())
        console.log("feeReceiver",await feeTokens1.feeReceiver())
        console.log("无手续费应输出:",amountOut1)
        console.log("有手续费应输出:",amountOut)
        expect(routerAomuntOutAfter).to.equals(0);
        expect(amountOut).to.be.gt(ethers.parseUnits("1"));
        expect(amountOut).to.be.lt(amountOut1);
    })
    it("测试swapExactETHForTokensSupportingFeeOnTransferTokens函数", async function(){
        // 授权
        await feeTokens0.approve(routerAddress, ethers.parseUnits("1000"));
        
        // 先添加流动性
        const tx = await router.addLiquidityETH(
            feeTokens0Addr,
            ethers.parseUnits("100"),
            ethers.parseUnits("50"),
            ethers.parseEther("0.5"),
            ownerAddress,
            deadline,
            {
                value: ethers.parseEther("1"),
            }
        )
        await tx.wait();
        
        // 正确获取储备量（根据地址排序）
        const [reserve0, reserve1] = await feeEthPair.getReserves();
        
        // 确定哪个是WETH，哪个是代币
        const token0Address = await feeEthPair.token0();
        const token1Address = await feeEthPair.token1();
        
        let reserveWETH, reserveToken;
        if (token0Address.toLowerCase() === wethAddress.toLowerCase()) {
            // token0 是 WETH
            reserveWETH = reserve0;
            reserveToken = reserve1;
        } else {
            // token1 是 WETH  
            reserveWETH = reserve1;
            reserveToken = reserve0;
        }
        
        console.log("WETH储备:", ethers.formatEther(reserveWETH));
        console.log("代币储备:", reserveToken.toString());
        
        const tokenBalanceBefore = await feeTokens0.balanceOf(ownerAddress);
        console.log("tokenBalanceBefore:",tokenBalanceBefore)
        // 支付的ETH数量
        const exactETHIn = ethers.parseEther("0.05");
        
        // 计算理论输出（不考虑手续费）
        const ethInBigInt = BigInt(exactETHIn.toString());
        const reserveInBigInt = BigInt(reserveWETH.toString());
        const reserveOutBigInt = BigInt(reserveToken.toString());
        
        const amountInWithFee = ethInBigInt * 997n;
        const numerator = amountInWithFee * reserveOutBigInt;
        const denominator = reserveInBigInt * 1000n + amountInWithFee;
        const theoreticalOutput = numerator / denominator;
        
        console.log("理论输出（无手续费）:", theoreticalOutput.toString());
        
        // 设置最小输出（比理论值小一些）
        const minTokenOut = theoreticalOutput * 90n / 100n;
                console.log("addr1:",await feeTokens0.balanceOf(addr1Addr));
        // 用确定数量的ETH购买代币
        await router.swapExactETHForTokensSupportingFeeOnTransferTokens(
            minTokenOut,
            [wethAddress, feeTokens0Addr],
            ownerAddress,
            deadline,
            {
                value: exactETHIn
            }
        )
        
        // 记录值
        const tokenBalanceAfter = await feeTokens0.balanceOf(ownerAddress);
        const routerTokenBalance = await feeTokens0.balanceOf(routerAddress);
        
        const actualTokenOut = tokenBalanceAfter - tokenBalanceBefore;
        console.log("tokenBalanceAfter:", tokenBalanceAfter);
        console.log("实际输出（有手续费）:", actualTokenOut.toString());
        console.log("Router代币余额:", routerTokenBalance.toString());
        console.log("addr1:",await feeTokens0.balanceOf(addr1Addr));
        
        // 验证
        expect(routerTokenBalance).to.equals(0);
        expect(actualTokenOut).to.be.gt(minTokenOut);
        expect(actualTokenOut).to.be.lt(theoreticalOutput);
    })
    it("测试swapExactTokensForETHSupportingFeeOnTransferTokens函数", async function(){
        // 授权
        await feeTokens0.approve(routerAddress, ethers.parseUnits("1000"));
        
        // 先添加流动性
        const tx = await router.addLiquidityETH(
            feeTokens0Addr,
            ethers.parseUnits("100"),
            ethers.parseUnits("50"),
            ethers.parseEther("0.5"),
            ownerAddress,
            deadline,
            {
                value: ethers.parseEther("1"),
            }
        )
        await tx.wait();
        
        // 获取provider来检查ETH余额
        const provider = ethers.provider;
        const ethBalanceBefore = await provider.getBalance(ownerAddress);
        
        // 正确获取储备量
        const [reserve0, reserve1] = await feeEthPair.getReserves();
        
        const token0Address = await feeEthPair.token0();
        const token1Address = await feeEthPair.token1();
        
        let reserveToken, reserveWETH;
        if (token0Address.toLowerCase() === wethAddress.toLowerCase()) {
            // token0 是 WETH
            reserveWETH = reserve0;
            reserveToken = reserve1;
        } else {
            // token1 是 WETH  
            reserveWETH = reserve1;
            reserveToken = reserve0;
        }
        
        console.log("代币储备:", reserveToken.toString());
        console.log("WETH储备:", ethers.formatEther(reserveWETH));
        
        // 卖出的代币数量
        const exactTokenIn = ethers.parseUnits("10")*95n/100n; // 卖出10个代币
        
        // 计算理论ETH输出（不考虑手续费）
        const tokenInBigInt = BigInt(exactTokenIn.toString());
        const reserveInBigInt = BigInt(reserveToken.toString());
        const reserveOutBigInt = BigInt(reserveWETH.toString());
        
        const amountInWithFee = tokenInBigInt * 997n;
        const numerator = amountInWithFee * reserveOutBigInt;
        const denominator = reserveInBigInt * 1000n + amountInWithFee;
        const theoreticalETHOut = numerator / denominator;
        
        console.log("理论ETH输出（无手续费）:", ethers.formatEther(theoreticalETHOut));
        
        // 设置最小ETH输出
        const minETHOut = theoreticalETHOut * 90n / 100n;
        
        // 授权代币
        const approveTx = await feeTokens0.approve(routerAddress, exactTokenIn * 2n);
          const approveReceipt = await approveTx.wait();
          const approveFasUesd = approveReceipt.gasUsed * approveReceipt.gasPrice;
        // 卖出代币换取ETH
        const swapTx = await router.swapExactTokensForETHSupportingFeeOnTransferTokens(
            ethers.parseUnits("10"),
            minETHOut,
            [feeTokens0Addr, wethAddress],
            ownerAddress,
            deadline
        )
        
        const swapReceipt = await swapTx.wait();
        const swapGasUsed = swapReceipt.gasUsed * swapReceipt.gasPrice;
        // console.log("swapReceipt",swapReceipt)
        // 记录结果
        const ethBalanceAfter = await provider.getBalance(ownerAddress);
        const routerTokenBalance = await feeTokens0.balanceOf(routerAddress);
        
        // 实际收到的ETH（考虑gas费用）
        const actualETHReceived = ethBalanceAfter - ethBalanceBefore+swapGasUsed+approveFasUesd;
        
        console.log("实际ETH输出:", ethers.formatEther(actualETHReceived));
        console.log("Router代币余额:", routerTokenBalance.toString());
        
        // 验证
        expect(routerTokenBalance).to.equals(0);
        expect(actualETHReceived).to.be.gt(minETHOut);
        expect(actualETHReceived).to.equals(theoreticalETHOut)
    })
})
//开根号
function sqrtBigint(value) {
    if (value < 0n) throw new Error('负数不能开根号');
    if (value < 2n) return value;
    
    let x = value;
    let y = (x + 1n) / 2n;
    
    while (y < x) {
        x = y;
        y = (value / x + x) / 2n;
    }
    return x;
}
//创建EIP-712签名
async function createPermitSignature(
    pairContract,      // Pair合约实例
    owner,            // 签名者（LP所有者）
    spender,          // 被授权者（Router地址）
    value,            // 授权数量
    deadline,         // 授权过期时间
    chainId           // 链ID
) {
    // 1. 获取Pair合约的domain信息
    const name = await pairContract.name();
    const version = "1";
    const verifyingContract = await pairContract.getAddress();
    
    // 2. 定义EIP-712类型哈希
    const domain = {
        name: name,
        version: version,
        chainId: chainId,
        verifyingContract: verifyingContract,
    };
    
    // 3. 定义Permit类型
    const types = {
        Permit: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
            { name: "value", type: "uint256" },
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint256" },
        ]
    };
    
    // 4. 获取nonce
    const nonce = await pairContract.nonces(owner.address);
    
    // 5. 创建消息
    const message = {
        owner: owner.address,
        spender: spender,
        value: value,
        nonce: nonce,
        deadline: deadline,
    };
    
    // 6. 签名
    const signature = await owner.signTypedData(domain, types, message);
    
    // 7. 拆分签名为v, r, s
    const sig = ethers.Signature.from(signature);
    
    return {
        v: sig.v,
        r: sig.r,
        s: sig.s,
        signature: signature
    };
}