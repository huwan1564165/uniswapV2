import { ethers, upgrades } from 'hardhat';

/**
 * 部署 可升级 合约
 */
async function main() {
  
  // 使用 OpenZeppelin Upgrades 插件部署可升级合约
  console.log('\n📦 部署 可升级合约...');
  const CounterFactory = await ethers.getContractFactory('CounterUUPS');
  
  // 使用 deployProxy 方法，自动处理实现合约和代理合约的部署
  const counter = await upgrades.deployProxy(
    CounterFactory,
    [], // 初始化参数（空数组，因为 initialize 函数无参数）
    {
      initializer: 'initialize',
      kind: 'uups', // 指定使用 UUPS 代理模式
      unsafeAllow: [], // 可以在这里配置允许的不安全操作，如delegatecall
    }
  );
  await counter.waitForDeployment();
  
  const proxyAddress = await counter.getAddress();
  
  // 尝试获取实现合约地址，如果失败则手动读取存储槽
  let implementationAddress;
  try {
    implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  } catch (error) {
    console.log('⚠️  通过upgrades.erc1967获取实现地址失败，尝试手动读取...');
    // ERC1967标准的实现地址存储槽
    const implementationSlot = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
    const rawImplementationAddress = await ethers.provider.getStorage(proxyAddress, implementationSlot);
    implementationAddress = '0x' + rawImplementationAddress.slice(-40);
    console.log('从存储槽读取到实现地址:', implementationAddress);
  }
 
  console.log('✅ 可升级合约部署完成:', proxyAddress);
  console.log('✅ 可升级合约实现地址:', implementationAddress);

  console.log('\n📋 部署摘要:');
  console.log('=====================================');
  console.log('实现合约地址:', implementationAddress);
  console.log('代理合约地址:', proxyAddress);

  return {
    proxyAddress,
    implementationAddress,
  };
}

// 如果直接运行此脚本
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ 部署失败:', error);
      process.exit(1);
    });
}

export default main;
