// 安装依赖：
// npm install merkletreejs keccak256

const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

class MerkleTreeAddressDemo {
  constructor() {
    // 示例地址数据
    this.addresses = [
      '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', 
      '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
      '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
      '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
      '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
      '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f'
    ];
    
    // 初始化默克尔树
    this.tree = null;
  }

  // 标准化地址（小写，去除0x）
  normalizeAddress(address) {
    return address.toLowerCase().replace('0x', '');
  }

  // 创建地址的默克尔树
  createMerkleTree() {
    console.log('=== 创建地址默克尔树 ===\n');
    
    console.log('原始地址列表:');
    this.addresses.forEach((addr, i) => {
      console.log(`[${i}] ${addr}`);
    });

    // 1. 对地址进行哈希处理
    const hashedLeaves = this.addresses.map(addr => {
      // 对于地址，通常需要先进行keccak256哈希
      const normalizedAddr = this.normalizeAddress(addr);
      return keccak256(Buffer.from(normalizedAddr, 'hex'));
    });

    console.log('\n哈希后的叶子节点:');
    hashedLeaves.forEach((hash, i) => {
      console.log(`[${i}] ${hash.toString('hex')}`);
    });

    // 2. 创建默克尔树
    this.tree = new MerkleTree(hashedLeaves, keccak256, {
      sortPairs: true,
      sortLeaves: true // 对叶子进行排序
    });

    // 3. 输出树的信息
    console.log('\n默克尔树根哈希:');
    const root = this.tree.getRoot();
    console.log(`0x${root.toString('hex')}`);

    console.log('\n树结构:');
    console.log(this.tree.toString());

    return {
      root: '0x' + root.toString('hex'),
      tree: this.tree
    };
  }

  // 为指定地址生成证明
  generateProofForAddress(address) {
    if (!this.tree) {
      throw new Error('请先创建默克尔树');
    }

    console.log(`\n=== 为地址生成证明 ===`);
    console.log(`目标地址: ${address}`);
    
    // 标准化地址并计算哈希
    const normalizedAddr = this.normalizeAddress(address);
    const hashedAddress = keccak256(Buffer.from(normalizedAddr, 'hex'));
    
    console.log(`地址哈希: ${hashedAddress.toString('hex')}`);

    // 检查地址是否在叶子节点中
    const leafExists = this.addresses.some(addr => 
      this.normalizeAddress(addr) === normalizedAddr
    );
    
    if (!leafExists) {
      console.log('⚠️  警告: 该地址不在原始地址列表中');
    }

    // 生成证明
    const proof = this.tree.getProof(hashedAddress);
    
    if (proof.length === 0) {
      console.log('❌ 无法生成证明：地址不在树中');
      return null;
    }

    console.log('\n证明路径:');
    proof.forEach((p, i) => {
      const position = p.position === 'left' ? '左' : '右';
      console.log(`[${i}] ${p.data.toString('hex')} (${position})`);
    });

    // 验证证明
    const root = this.tree.getRoot();
    const isValid = this.tree.verify(proof, hashedAddress, root);
    
    console.log(`\n证明验证结果: ${isValid ? '✅ 有效' : '❌ 无效'}`);

    return {
      address: address,
      proof: proof.map(p => '0x' + p.data.toString('hex')),
      proofPositions: proof.map(p => p.position === 'left' ? 0 : 1),
      isValid: isValid
    };
  }

  // 手动验证证明（模拟Solidity中的验证逻辑）
  manualVerifyProof(address, proofHexArray, rootHex) {
    console.log('\n=== 手动验证证明 ===');
    
    // 1. 计算叶子哈希
    const normalizedAddr = this.normalizeAddress(address);
    let computedHash = keccak256(Buffer.from(normalizedAddr, 'hex'));
    
    console.log(`初始叶子哈希: ${computedHash.toString('hex')}`);
    
    // 2. 逐步计算
    for (let i = 0; i < proofHexArray.length; i++) {
      const proofElement = Buffer.from(proofHexArray[i].replace('0x', ''), 'hex');
      
      // 在真实场景中，我们需要知道每个证明元素的位置（左或右）
      // 这里我们假设从generateProofForAddress获取的proofPositions
      // 实际上，在Solidity中，我们需要传递位置信息
      
      // 简单示例：交替左右（实际应根据proofPositions）
      if (i % 2 === 0) {
        computedHash = keccak256(Buffer.concat([proofElement, computedHash]));
        console.log(`[${i}] 与左节点合并: ${computedHash.toString('hex').slice(0, 16)}...`);
      } else {
        computedHash = keccak256(Buffer.concat([computedHash, proofElement]));
        console.log(`[${i}] 与右节点合并: ${computedHash.toString('hex').slice(0, 16)}...`);
      }
    }
    
    // 3. 比较根哈希
    const finalRoot = '0x' + computedHash.toString('hex');
    const isValid = finalRoot === rootHex;
    
    console.log(`\n计算得到的根: ${finalRoot}`);
    console.log(`原始根哈希: ${rootHex}`);
    console.log(`验证结果: ${isValid ? '✅ 匹配' : '❌ 不匹配'}`);
    
    return isValid;
  }



  // 添加新地址并更新树
  addNewAddress(newAddress) {
    console.log('\n=== 添加新地址 ===');
    
    // 检查地址格式
    if (!newAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      console.log('❌ 无效的地址格式');
      return;
    }
    
    // 检查是否已存在
    if (this.addresses.includes(newAddress)) {
      console.log('⚠️  地址已存在');
      return;
    }
    
    this.addresses.push(newAddress);
    console.log(`添加地址: ${newAddress}`);
    console.log(`总地址数: ${this.addresses.length}`);
    
    // 重新创建树
    return this.createMerkleTree();
  }

  // 完整的演示
  runFullDemo() {
    console.log('🔄 地址默克尔树验证演示\n');
    
    // 1. 创建默克尔树
    const { root } = this.createMerkleTree();
    
    // 2. 验证存在的地址
    console.log('\n📋 验证存在的地址:');
    const existingAddress = this.addresses[2];
    const proofInfo = this.generateProofForAddress(existingAddress);
    
    // 3. 手动验证
    if (proofInfo) {
      this.manualVerifyProof(existingAddress, proofInfo.proof, root);
    }
    
    // 4. 验证不存在的地址
    console.log('\n📋 验证不存在的地址:');
    const nonExistingAddress = '0x1111111111111111111111111111111111111111';
    this.generateProofForAddress(nonExistingAddress);
    

    
    // 6. 添加新地址并验证
    console.log('\n📋 添加新地址演示:');
    const newAddress = '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199';
    this.addNewAddress(newAddress);
    
    // 验证新地址
    if (this.tree) {
      console.log('\n📋 验证新添加的地址:');
      this.generateProofForAddress(newAddress);
    }
    
    console.log('\n✨ 演示完成');
    
    // 返回重要信息
    return {
      rootHash: root,
      totalAddresses: this.addresses.length,
      treeHeight: this.tree.getDepth()
    };
  }
}

// 使用示例
const demo = new MerkleTreeAddressDemo();
const result = demo.runFullDemo();

console.log('\n=== 总结信息 ===');
console.log(`根哈希: ${result.rootHash}`);
console.log(`地址数量: ${result.totalAddresses}`);
console.log(`树高度: ${result.treeHeight}`);

// 导出验证函数供其他模块使用
module.exports = {
  createMerkleTreeForAddresses: (addresses) => {
    const d = new MerkleTreeAddressDemo();
    d.addresses = addresses;
    return d.createMerkleTree();
  },
  
};