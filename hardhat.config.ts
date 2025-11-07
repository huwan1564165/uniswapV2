import "@nomicfoundation/hardhat-foundry";
import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@matterlabs/hardhat-zksync-deploy";
import "@matterlabs/hardhat-zksync-solc";
import "hardhat-abi-exporter";
import * as dotenv from "dotenv";
dotenv.config();
import "hardhat-contract-sizer";
import "hardhat-gas-reporter";
import "@OpenZeppelin/hardhat-upgrades";
import "@typechain/hardhat";

const accounts =
  process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [];

const config: HardhatUserConfig = {
  // 编译配置
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
      outputSelection: {
        '*': {
          '*': [
            'abi',
            'evm.bytecode',
            'evm.deployedBytecode',
            'evm.methodIdentifiers',
            'metadata',
            'storageLayout'  // 用于升级验证
          ],
          '': ['ast']  // 源代码 AST
        },
      },
    },
  },

  zksolc: {
    version: "1.3.22",
    compilerSource: "binary",
    settings: {
        isSystem: false, // optional.  Enables Yul instructions available only for zkSync system contracts and libraries
        forceEvmla: false, // optional. Falls back to EVM legacy assembly if there is a bug with Yul
        optimizer: {
          enabled: true, // optional. True by default
          mode: 'z' // optional. 3 by default, z to optimize bytecode size
        },
      },
  },

  // 设置单个测试用例的最大执行时间
  mocha: {
    timeout: 10 * 60 * 1000,
  },

  // 网络配置
  networks: {
    hardhat: {
      allowUnlimitedContractSize: false,
      chainId: 1,
    },
    localhost:{
         url:"http://127.0.0.1:8545",
         accounts:accounts,
    },
    eth: {
      url: "https://ethereum-rpc.publicnode.com",
      accounts: accounts,
      chainId: 1,
      },
    op: {
      url: "https://optimism-rpc.publicnode.com",
      accounts: accounts,
      chainId: 10,
    },
    bsc: {
      url:"https://bsc.drpc.org",
      accounts: accounts,
      chainId: 56,
    },
    wld: {
      url: "https://480.rpc.thirdweb.com",
      accounts: accounts,
      chainId: 480,
    },
    polygon: {
      url:"https://polygon.drpc.org",
      accounts: accounts,
      chainId: 137,
    },
    ftm: {
      url: "https://fantom-json-rpc.stakely.io",
      accounts: accounts,
      chainId: 250,
    },
    zk: {
      url: "https://mainnet.era.zksync.io",
      accounts: accounts,
      ethNetwork: "mainnet",
      zksync: true,
      chainId: 324,
    },
    linea: { 
      url: "https://linea.drpc.org",
      accounts: accounts,
      chainId: 59144,
    },
    base: {
      url: "https://base.drpc.org",
      accounts: accounts,
      chainId: 8453,
    },
    arb: {
      url: "https://public-arb-mainnet.fastnode.io",
      accounts: accounts,
      chainId: 42161,
    },
    blast: {
      url: "https://blast.drpc.org",
      accounts: accounts,
      chainId: 81457,
    },
    avax: {
      url:"https://endpoints.omniatech.io/v1/avax/mainnet/public",
      accounts: accounts,
      chainId: 43114,
    },
    gateLayer: {
      url: "https://gatelayer-mainnet.gatenode.cc",
      accounts: accounts,
      chainId: 10088,
    },
  },

  // gas报告配置
  gasReporter: {
    currency: "USDT",
    enabled: !!process.env.REPORT_GAS,
  },

  // 合约大小报告配置
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: false,
    only: [],
  },

  // ABI导出配置
  abiExporter: {
    path: "./abis",
    runOnCompile: true,
    clear: true,
    flat: true,
    pretty: false,
    except: ["lib"],
  },

  // 合约验证配置
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY as string,
  },

  // 覆盖配置
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },

  // typechain配置
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
};

export default config;
