import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("📝 部署账户:", deployer.address);
  console.log("💰 账户余额:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // 部署 Counter 合约
  console.log("\n📦 部署 Counter 合约...");
  const Counter = await ethers.getContractFactory("Counter");
  const counter = await Counter.deploy();
  await counter.waitForDeployment();

  const counterAddress = await counter.getAddress();
  console.log("✅ Counter 合约已部署到:", counterAddress);

  // 验证部署
  console.log("\n🔍 验证合约部署...");
  const currentValue = await counter.x();
  console.log("当前计数器值:", currentValue.toString());

  // 执行初始化交易
  console.log("\n⚙️ 执行初始化...");
  const tx = await counter.incBy(10);
  await tx.wait();
  console.log("✅ 初始化完成，计数器增加了 10");

  const newValue = await counter.x();
  console.log("新的计数器值:", newValue.toString());

  console.log("\n✨ 部署完成!");
  console.log("合约地址:", counterAddress);

  // 保存部署信息
  const deploymentInfo = {
    contractName: "Counter",
    contractAddress: counterAddress,
    deployerAddress: deployer.address,
    blockNumber: await ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString(),
  };

  console.log("\n📄 部署信息:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main().catch((error) => {
  console.error("❌ 部署失败:", error);
  process.exitCode = 1;
});