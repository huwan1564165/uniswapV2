const {ethers} = require("hardhat")
const MerkleTreeDemo = require('../scripts/merkleDemo.js')
const { expect } = require("chai")

describe("测试MerkleRoot合约",async function(){
    let MerkleRoot
    let merkleRoot
    let testAddress
    let testAmount
    let proofInfo
    let owner,addr1
    let ownerAddress
    let addr1Addr
    let addr1Amount
    let ownerAmount
    
    this.beforeEach(async function(){
        // //获取根哈希
        // const demo = new MerkleTreeDemo();
        // let {root} = demo.createMerkleTree();

        // [owner,addr1] = await ethers.getSigners();
        // ownerAddress = await owner.getAddress();
        // addr1Addr = await addr1.getAddress();
        // addr1Amount = 500n;
        // ownerAmount = 500n;
        // const newTree = demo.addNewAddress(addr1Addr,addr1Amount);
        // root = newTree.root;

        // //获取测试地址证明
        // proofInfo = demo.generateProofForAddress(addr1Addr,addr1Amount);

        // console.log(`根哈希：${root}`);
        
        // //部署合约
        // MerkleRoot = await ethers.getContractFactory("MerkleRoot");
        // merkleRoot = await MerkleRoot.deploy(root,"MyTokens","MT",1000n*10n**18n);
        // await merkleRoot.waitForDeployment();

    })

    it("测试合约",async function(){
        //获取根哈希
        const demo = new MerkleTreeDemo();
        let {root} = demo.createMerkleTree();

        [owner,addr1] = await ethers.getSigners();
        ownerAddress = await owner.getAddress();
        addr1Addr = await addr1.getAddress();
        addr1Amount = 500n;
        ownerAmount = 500n;
        const newTree = demo.addNewAddress(addr1Addr,addr1Amount);
        root = newTree.root;

        //获取测试地址证明
        proofInfo = demo.generateProofForAddress(addr1Addr,addr1Amount);

        console.log(`根哈希：${root}`);
        
        //部署合约
        MerkleRoot = await ethers.getContractFactory("MerkleRoot");
        merkleRoot = await MerkleRoot.deploy(root,"MyTokens","MT",1000n*10n**18n);
        await merkleRoot.waitForDeployment();


        const isValid=await merkleRoot.verify(addr1Addr,proofInfo.proof,addr1Amount)
        expect(isValid).to.be.equals(true);
        console.log(`验证通过`)
        await merkleRoot.connect(addr1).claim(addr1Amount,proofInfo.proof);
        expect(await merkleRoot.balanceOf(addr1Addr)).to.be.equals(addr1Amount);
        console.log(`领取成功`)
        const newTree2 = demo.addNewAddress(ownerAddress,ownerAmount);
        await expect(merkleRoot.connect(addr1).setRoot(newTree2.root)).to.be.revertedWith('你没有权限修改');
    })
})