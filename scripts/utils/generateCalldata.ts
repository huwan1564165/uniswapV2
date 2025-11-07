import { ethers } from "hardhat";

async function generateSetAllowedBrokerCalldata() {
  // 合约地址
  const vaultAddress = "0x82b6b970711C07FE98Fa60C9d80f1be5B9fa32FF";
  
  // 参数
  const brokerHash = "0xad7c5bef027816a800da1736444fb58a807ef4c9603b7848673f7e3a68eb14a5";
  const allowed = true; // 添加 broker
  
  // 定义函数的 ABI
  const functionAbi = [
    "function setAllowedBroker(bytes32 _brokerHash, bool _allowed)"
  ];
  
  // 创建 Interface 实例
  const iface = new ethers.Interface(functionAbi);
  
  // 编码函数调用数据
  const calldata = iface.encodeFunctionData("setAllowedBroker", [
    brokerHash,
    allowed
  ]);
  
  console.log("=".repeat(80));
  console.log("Vault 合约地址:", vaultAddress);
  console.log("函数名称: setAllowedBroker");
  console.log("参数:");
  console.log("  - brokerHash:", brokerHash);
  console.log("  - allowed:", allowed);
  console.log("=".repeat(80));
  console.log("生成的 Calldata:");
  console.log(calldata);
  console.log("=".repeat(80));
  
  return calldata;
}

// 执行函数
generateSetAllowedBrokerCalldata()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

