const {expect} = require("chai")
const {ethers} = require("hardhat")

describe("测试Pair合约",async function(){
    let owner,add1
    let ownerAddress
    let UniswapV2Factory
    let factory
    let MyTokens1
    let myTokens1
    let MyTokens2
    let myTokens2
    let myTokens1Add
    let myTokens2Add
    let pairAdd
    let UniswapV2Pair
    let pair
    let token0
    let token1
    this.beforeEach(async function () {
        //获取测试用户
        [owner,add1] = await ethers.getSigners();
        //获取部署者的钱包地址
        ownerAddress=await owner.getAddress();
        //获取合约工厂对象
        UniswapV2Factory = await ethers.getContractFactory("UniswapV2Factory");
        //用工厂合约对象部署合约(但还未确认)
        factory = await UniswapV2Factory.deploy(ownerAddress);
        //等待合约部署交易被矿工确认
        await factory.waitForDeployment();

        MyTokens1 = await ethers.getContractFactory("MyTokens");
        //用工厂合约对象部署合约(但还未确认)
        myTokens1 = await MyTokens1.deploy("Test1","T1",ethers.parseUnits("10000"));
        //等待合约部署交易被矿工确认
        await myTokens1.waitForDeployment();

        MyTokens2 = await ethers.getContractFactory("MyTokens");
        //用工厂合约对象部署合约(但还未确认)
        myTokens2 = await MyTokens2.deploy("Test2","T2",ethers.parseUnits("10000"));
        //等待合约部署交易被矿工确认
        await myTokens2.waitForDeployment();
        
        myTokens1Add = await myTokens1.getAddress();
        myTokens2Add = await myTokens2.getAddress();

        await factory.createPair(myTokens1Add,myTokens2Add);
        pairAdd=await factory.getPair(myTokens1Add,myTokens2Add);

        UniswapV2Pair = await ethers.getContractFactory("UniswapV2Pair");
        pair = UniswapV2Pair.attach(pairAdd);

        //排序
        token0=myTokens1Add<myTokens2Add?myTokens1Add:myTokens2Add;
        token1=myTokens1Add>myTokens2Add?myTokens1Add:myTokens2Add;

        


    })
    //测试Pair合约
    it("初始化测试", async function(){
        expect(await pair.factory()).to.equals(await factory.getAddress());
        expect(await pair.token0()).to.equals(token0);
        expect(await pair.token1()).to.equals(token1);
    })
    it("返回储备量测试", async function(){
        const [reserve0,reserve1,blockTimestampLast]=await pair.getReserves();
        expect(await reserve0).to.equals(0);
        expect(await reserve1).to.equals(0);
        expect(await blockTimestampLast).to.equals(0);
    })
    it("LPtoken初始化测试", async function(){
        expect(await pair.name()).to.equal("Uniswap V2");
        expect(await pair.symbol()).to.equal("UNI-V2");
        expect(await pair.decimals()).to.equal(18);
        expect(await pair.totalSupply()).to.equal(0); 
    })
    it("首次添加流动性测试",async function () {
        //给Pair合约转账，增加余额
        const value0=ethers.parseUnits("100");
        const value1=ethers.parseUnits("200");
        await myTokens1.transfer(pairAdd,value0)
        await myTokens2.transfer(pairAdd,value1)

        const balance0 = await myTokens1.balanceOf(pairAdd);
        const balance1 = await myTokens2.balanceOf(pairAdd);

        await pair.mint(ownerAddress);

        //检查LPToken数量是否正确
        const liquidityA=await pair.balanceOf(ownerAddress);
        const mulValue= value0*value1;
        const sqrtValue= await sqrtBigint(mulValue);
        const liquidityB=sqrtValue-1000n;
        
        expect(liquidityA).to.be.equals(liquidityB);
        //首次添加流动性LPToken总量应大于获得的LPToken
        expect(await pair.totalSupply()).to.gt(liquidityA);

        //检查储备量是否正确更新
        const [reserve0,reserve1]=await pair.getReserves();
        expect(reserve0).to.equals(balance0);
        expect(reserve1).to.equals(balance1);
    })
    it("移除流动性测试",async function () {
        //给Pair合约转账，增加余额
        await myTokens1.transfer(pairAdd,ethers.parseUnits("100"))
        await myTokens2.transfer(pairAdd,ethers.parseUnits("100"))

        //添加流动性
        await pair.mint(ownerAddress);

        const balance0 = await myTokens1.balanceOf(ownerAddress);
        const balance1 = await myTokens2.balanceOf(ownerAddress);
        const pairBalance0 = await myTokens1.balanceOf(pairAdd);
        const pairBalance1 = await myTokens2.balanceOf(pairAdd);
        const liquidity=await pair.balanceOf(ownerAddress);
        const totalSupply=await pair.totalSupply();

        console.log("移除前-用户LP:",liquidity.toString())
        console.log("移除前-token0代币:",balance0.toString())
        console.log("移除前-token1代币:",balance1.toString())

        await pair.transfer(pairAdd,liquidity);

        await pair.burn(ownerAddress);

        //检查token0，token1返还数量是否正确
        const balance0After=await myTokens1.balanceOf(ownerAddress);
        const balance1After=await myTokens2.balanceOf(ownerAddress);
        console.log("移除后-token0代币:",balance0After.toString())
        console.log("移除后-token1代币:",balance1After.toString())
        //根据公式计算返还代币数量
        const return0 = (liquidity*pairBalance0) / totalSupply;
        const return1 = (liquidity*pairBalance1) / totalSupply;
        const balance0Sub=balance0After-balance0;
        const balance1Sub=balance1After-balance1;
        console.log("应返回token0代币数量：",balance0Sub.toString())
        console.log("应返回token1代币数量：",balance1Sub.toString())

        expect(balance0Sub).to.be.equals(return0);
        expect(balance1Sub).to.be.equals(return1);
        //检查LPtoken是否销毁
        expect(await pair.balanceOf(ownerAddress)).to.equals(0);


        // 检查储备量更新
        const [reserve0, reserve1] = await pair.getReserves();
        expect(reserve0).to.equal(await myTokens1.balanceOf(pairAdd));
        expect(reserve1).to.equal(await myTokens2.balanceOf(pairAdd));
    })

    it("测试交易函数",async function(){
        //给Pair合约转账，增加余额
        await myTokens1.transfer(pairAdd,ethers.parseUnits("100"))
        await myTokens2.transfer(pairAdd,ethers.parseUnits("100"))
        //添加流动性
        await pair.mint(ownerAddress);
        //用来交易的代币
        await myTokens1.transfer(pairAdd,ethers.parseUnits("10"))
        //要输出的代币
        const amount1Out=ethers.parseUnits("5");
        //交易前账户上myTokens2的代币数量
        const balanceBefore=await myTokens2.balanceOf(ownerAddress);
        //测试两种代币输出都是0是否正确拒绝
        await expect(pair.swap(0,0,ownerAddress,"0x")).to.be.revertedWith('UniswapV2: INSUFFICIENT_OUTPUT_AMOUNT');
        //测试输出量大于储备量时是否正确拒绝
        await expect(pair.swap(0,ethers.parseUnits("1000"),ownerAddress,"0x"))
        .to.be.revertedWith('UniswapV2: INSUFFICIENT_LIQUIDITY');
        await expect(pair.swap(ethers.parseUnits("1000"),0,ownerAddress,"0x"))
        .to.be.revertedWith('UniswapV2: INSUFFICIENT_LIQUIDITY');
        //测试接收地址是代币合约本身是否正确拒绝
        await expect(pair.swap(ethers.parseUnits("99"),0,token0,"0x"))
        .to.be.revertedWith('UniswapV2: INVALID_TO');
        await expect(pair.swap(ethers.parseUnits("99"),0,token1,"0x"))
        .to.be.revertedWith('UniswapV2: INVALID_TO');
        //执行交易函数
        await pair.swap(0,amount1Out,ownerAddress,"0x")
        //交易后账户上myTokens2的代币数量
        const balanceAfter=await myTokens2.balanceOf(ownerAddress);
        //验证交易前后账户上增加的myTokens2代币数量，是否等于要输出的代币数量
        expect(balanceAfter-balanceBefore).to.equals(amount1Out);

        // 检查储备量更新
        const [reserve0, reserve1] = await pair.getReserves();
        expect(reserve0).to.equal(await myTokens1.balanceOf(pairAdd));
        expect(reserve1).to.equal(await myTokens2.balanceOf(pairAdd));  


    })







    //测试UniswapV2Factory合约
    it("测试allPairsLength函数", async function(){
        expect(await factory.allPairsLength()).to.equals(1)
    })
    it("测试creat函数", async function(){
        //测试两个 token 地址相同是否正确拒绝
        await expect(factory.createPair(myTokens1Add,myTokens1Add))
        .to.be.revertedWith('UniswapV2: IDENTICAL_ADDRESSES')
        //测试 token 地址为零地址是否正确拒绝
        await expect(factory.createPair(myTokens1Add,ethers.ZeroAddress))
        .to.be.revertedWith('UniswapV2: ZERO_ADDRESS')
        //测试双向记录是否正常工作
        expect(await factory.getPair(myTokens1Add,myTokens2Add)).to.equals(pairAdd)
        expect(await factory.getPair(myTokens2Add,myTokens1Add)).to.equals(pairAdd)
        //测试新配对合约地址是否正确添加到数组中
        expect(await factory.allPairs(0)).to.equals(pairAdd)
        //测试该交易对已存在是否正确拒绝
        await expect(factory.createPair(myTokens1Add,myTokens2Add))
        .to.be.revertedWith('UniswapV2: PAIR_EXISTS')
    },)

    it("token测试", async function(){
        expect(await myTokens1.balanceOf(ownerAddress)).to.equals(ethers.parseUnits("10000"));
        expect(await myTokens2.balanceOf(ownerAddress)).to.equals(ethers.parseUnits("10000"));

    },)

    it("测试FeeTo地址", async function(){
        //测试feeToSetter设置FeeTo地址是否正常工作
        await factory.setFeeTo(add1.address);
        expect(await factory.feeTo()).to.equal(add1.address)
        //测试非feeToSetter设置FeeTo地址是否正确拒绝
        await expect(factory.connect(add1).setFeeTo(add1.address))
        .to.be.revertedWith("UniswapV2: FORBIDDEN")

    },)
    it("测试FeeToSetter地址", async function(){
        //测试非feeToSetter设置FeeTo地址是否正确拒绝
        await expect(factory.connect(add1).setFeeToSetter(add1.address))
        .to.be.revertedWith("UniswapV2: FORBIDDEN")
        //测试feeToSetter设置feeToSetter地址是否正常工作
        await factory.setFeeToSetter(add1.address);
        expect(await factory.feeToSetter()).to.equal(add1.address);
    },)
    
    
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