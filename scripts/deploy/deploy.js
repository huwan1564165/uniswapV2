import "dotenv/config";
import hre from "hardhat";

const { ethers } = hre;

async function main() {
  //ethers.getSigners() 返回所有可用账户的数组
  //[deployer] 使用数组解构取第一个账户
  const [deployer] = await hre.ethers.getSigners();
  //获取部署者的钱包地址
  const deployerAddress = await deployer.getAddress();

  //打印部署者地址
  console.log("使用账户部署:", deployerAddress);
  //ethers.provider 是网络提供者
  //getBalance() 查询地址余额
  const balance = await ethers.provider.getBalance(deployerAddress);
  //balance.toString()：将 BigNumber 转换为可读字符串
  console.log("账户余额:", balance.toString());

  //获取合约工厂对象
  const UniswapV2Factory = await ethers.getContractFactory("UniswapV2Factory");
  //用工厂合约对象部署合约(但还未确认)
  const factory = await UniswapV2Factory.deploy(deployerAddress);
  //等待合约部署交易被矿工确认
  await factory.waitForDeployment();

  //获取已部署合约的地址
  const factoryAddress = await factory.getAddress();
  console.log("UniswapV2Factory 部署到:", factoryAddress);

  //调用合约的 view 函数,读取 feeToSetter 状态变量
  const feeToSetter = await factory.feeToSetter();
  console.log("FeeToSetter:", feeToSetter);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});