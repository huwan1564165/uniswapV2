const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

class MerkleTreeDemo{
    //写一个构造函数,初始化地址列表和一个空的树
    constructor(){
        this.addrsAmounts = [
            {address:'0x0000000000000000000000000000000000000001',amount: 100},
            {address:'0x0000000000000000000000000000000000000002',amount: 200},
            {address:'0x0000000000000000000000000000000000000003',amount: 300},
            {address:'0x0000000000000000000000000000000000000004',amount: 400}
        ];

        this.tree = null;
    }

    //地址标准化
    normalizeAddress(address){
        //先转成小写字母，再去掉0x
        return address.toLowerCase().replace('0x','');
    }
    //地址和金额打包函数（不用ethers）
    packAddressAndAmount(address,amount){
        //标准化地址
        const normalizeAddr=this.normalizeAddress(address);
        const addrBuffer = Buffer.from(normalizeAddr, 'hex');

        //金额转换为32字节的Buffer
        const amountBuffer = Buffer.alloc(32);
        amountBuffer.writeBigUInt64BE(BigInt(amount), 24);

        //拼接地址和金额
        return Buffer.concat([addrBuffer,amountBuffer]);
    }
    //创建默克尔树
    createMerkleTree(){
        // 显示原始地址
        console.log("原始地址：")
        this.addrsAmounts.forEach((addr , i) => {
            console.log(`[${i}]==>${addr.address}`);
        });
        // 哈希处理所有地址
        const hashedAddress=this.addrsAmounts.map(addr => {
            return keccak256(this.packAddressAndAmount(addr.address,addr.amount));
        })
        // 显示哈希后的叶子节点
        console.log("叶子节点：")
        hashedAddress.forEach((addr , i) => {
            console.log(`[${i}]==>${addr.toString('hex')}`);
        });
        // 构建默克尔树
        this.tree= new MerkleTree(hashedAddress,keccak256,{
            sortPairs:true,
            sortLeaves:true
        });
        // 返回根哈希和树实例
        const root = this.tree.getRoot()
        console.log(`默克尔树根哈希： 0x${root.toString('hex')}`);
        return {
            root: '0x'+root.toString('hex'),
            tree: this.tree
        }
        
    }

    //为指定地址生成证明
    generateProofForAddress(address,amount){
        // 1. 检查树是否存在
        if(!this.tree){
            throw new Error('请先创建默克尔树')
        }
        // 2. 标准化地址并哈希
        const hashedAddress = keccak256(this.packAddressAndAmount(address,amount));
        // 3. 生成证明路径
        const proof=this.tree.getProof(hashedAddress);
        if(proof.length==0){
            console.log('生成证明失败，该地址不在树中');
            return;
        }
        // 4. 验证证明有效性
        const root=this.tree.getRoot();
        const isValid = this.tree.verify(proof,hashedAddress,root);
        console.log(`证明验证结果：${isValid?'有效':'无效'}`)
        // 5. 返回证明信息
        return {
            address:address,
            amount:amount,
            proof:proof.map(p => '0x'+p.data.toString('hex')),
            proofPositions:proof.map(p => p.position ==='left'? 0: 1),
            isValid:isValid
        }
    }
    
    // 添加新地址并更新树
    addNewAddress(address,amount){
        //验证地址格式
        if(!address.match(/^0x[a-fA-F0-9]{40}$/)){
            console.log('无效的地址格式');
            return;
        }
        const addressExists = this.addrsAmounts.some(item => 
            item.address.toLowerCase() === address.toLowerCase()
        );
        //验证地址是否已存在
        if(addressExists){
            console.log('地址已存在');
            return;
        }
        //添加新地址
        this.addrsAmounts.push({
            address:address,
            amount:amount
        });
        //重新创建默克尔树并返回
        return this.createMerkleTree();
    }
}
const demo = new MerkleTreeDemo();
const {root} = demo.createMerkleTree();

console.log(`根哈希: ${root}`);
module.exports = MerkleTreeDemo;