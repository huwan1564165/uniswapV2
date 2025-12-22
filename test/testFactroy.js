const {expect} = require("chai")
const {ethers} = require("hardhat")

describe("测试Pair合约",async function(){
    let owner,add1
    let ownerAddress
    let UniswapV2Factory
    let factory
    let factoryAddress
    let testFactory
    let testFactoryAddress


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
        factoryAddress = await factory.getAddress();
        //获取合约工厂对象
        UniswapV2PairTest = await ethers.getContractFactory("UniswapV2PairTest");
        //用工厂合约对象部署合约(但还未确认)
        testFactory = await UniswapV2PairTest.deploy(factoryAddress);
        //等待合约部署交易被矿工确认
        await testFactory.waitForDeployment();
        await testFactory.before();
        testFactoryAddress = await testFactory.getAddress();
        await factory.setFeeToSetter(testFactoryAddress);

    })
    //测试Pair合约
    it("初始化测试", async function(){
      await testFactory.init();
        console.log(await testFactory.pair())
    })
    it("返回储备量测试", async function(){
        await testFactory.getReservesTest();
    })
    it("LPtoken初始化测试", async function(){
        await testFactory.LPTokenInit();
    })
    it("首次添加流动性测试", async function(){
        await testFactory.mintTest();
    })
    it("移除流动性测试", async function(){
        await testFactory.burnTest();
    })
    it("测试交易函数", async function(){
        await testFactory.swapTest();
    })


    //测试UniswapV2Factory合约
    it("测试FeeTo地址", async function(){
        await testFactory.FeeToTest();
    })
    it("测试FeeToSetter地址", async function(){
        await testFactory.FeeToSetterTest();
    })
    it("测试allPairsLength函数", async function(){
        await testFactory.allPairsLengthTest();
    })
    it("token测试", async function(){
        await testFactory.tokenTest();
    })
    it("测试creat函数", async function(){
        await testFactory.createPair();
    })
})