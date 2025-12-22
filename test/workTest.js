const {expect} = require("chai")
const {ethers} = require("hardhat")

describe("测试work合约", async function(){
    let Work01;
    let work01;
    let owner;
    let ownerAddress;
    let addrs;
    this.beforeEach(async function(){
          [owner] = await ethers.getSigners();
          ownerAddress=await owner.getAddress()
        Work01=await ethers.getContractFactory("work01");
        work01=await Work01.deploy();
        await work01.waitForDeployment();
        addrs = [];
        for(var i=0;i<99;i++){
            var addr = ethers.Wallet.createRandom();
            //获取助记词
            // console.log(addr.mnemonic.phrase);
            //获取私钥
            // console.log(addr.privateKey);
            addrs.push(addr.address);
        }
        addrs.push(ownerAddress);
       
       
    })
    it("work测试",async function(){
        // console.log(addrs);
        await work01.transferAll(addrs,ethers.parseUnits("1"));
        const value=await work01.getUserToken(addrs);
        console.log(value);
    })
      it("work测试2",async function(){
        // console.log(addrs);
        await work01.transferAll1(addrs,ethers.parseUnits("2"));
        const value=await work01.getUserToken1(addrs);
        console.log(value);
        await work01.getUserToken2();
          const value1=await work01.getUserToken1(addrs);
        console.log(value1);

        const value2=await work01.getUserToken([ownerAddress]);
        console.log(value2);

    })
})