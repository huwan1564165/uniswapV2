pragma solidity =0.5.16;

import './interfaces/IUniswapV2Factory.sol';
import './UniswapV2Pair.sol';

contract UniswapV2Factory is IUniswapV2Factory {
    //接收交易费用的地址
    address public feeTo;
    //有权设置 feeTo 地址的权限账户
    address public feeToSetter;
    //token0=>token1=>pair
    //token1=>token0=>pair
    //存储 tokenA 和 tokenB 对应的配对合约地址
    mapping(address => mapping(address => address)) public getPair;
    //存储所有已创建的配对合约地址
    address[] public allPairs;

    bytes32 public hashBytecode = keccak256(type(UniswapV2Pair).creationCode);

    //当新交易对创建时触发的事件
    event PairCreated(address indexed token0, address indexed token1, address pair, uint);

    //部署合约时设置 feeToSetter 地址
    constructor(address _feeToSetter) public {
        feeToSetter = _feeToSetter;
    }

    //返回已创建的交易对总数
    function allPairsLength() external view returns (uint) {
        return allPairs.length;
    }

    //核心功能
    function createPair(address tokenA, address tokenB) external returns (address pair) {
        //检查两个 token 地址不能相同
        require(tokenA != tokenB, 'UniswapV2: IDENTICAL_ADDRESSES');
        //对 token 地址进行排序，确保 token0 < token1
        //这是为了确保无论传入顺序如何，相同的 token 对都有相同的排序
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        //检查 token 地址不能为零地址
        require(token0 != address(0), 'UniswapV2: ZERO_ADDRESS');
        //检查该交易对是否已存在
        require(getPair[token0][token1] == address(0), 'UniswapV2: PAIR_EXISTS'); // single check is sufficient
        //获取 UniswapV2Pair 合约的创建字节码
        bytes memory bytecode = type(UniswapV2Pair).creationCode;

        //创建合约
        //根据排序后的 token 地址生成盐值
        //用于 CREATE2 操作码，确保相同 token 对总是生成相同的合约地址
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        //内联汇编使用 CREATE2 操作码部署新合约
        assembly {
            //add(bytecode的位置1，32) 33
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }

        //调用新创建配对合约的 initialize 函数进行初始化
        IUniswapV2Pair(pair).initialize(token0, token1);
        //在映射中记录配对关系（双向记录）
        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair; // populate mapping in the reverse direction
        //将新配对合约地址添加到数组中
        allPairs.push(pair);
        //触发事件，通知监听者新交易对已创建
        emit PairCreated(token0, token1, pair, allPairs.length);
    }

    //设置接收交易费用的地址
    function setFeeTo(address _feeTo) external {
        //检查调用者地址是否为feeToSetter，只有 feeToSetter 可以调用
        require(msg.sender == feeToSetter, 'UniswapV2: FORBIDDEN');
        feeTo = _feeTo;
    }

    //转移 feeToSetter 权限给新地址
    function setFeeToSetter(address _feeToSetter) external {
        //检查调用者地址是否为feeToSetter,只有当前 feeToSetter 可以调用
        require(msg.sender == feeToSetter, 'UniswapV2: FORBIDDEN');
        feeToSetter = _feeToSetter;
    }
}

//实际例子
//假设我们要创建 WETH 和 USDC 的交易对：

// 输入
//tokenA = "0xC02...（WETH地址）"
//tokenB = "0xA0b...（USDC地址）"

// 步骤1：排序（确保顺序一致）
//token0 = "0xA0b..." // USDC（地址小的）
//token1 = "0xC02..." // WETH（地址大的）

// 步骤2：生成唯一编号
//salt = keccak256("0xA0b...0xC02...") = "abc123..."

// 步骤3：创建合约
// 使用CREATE2创建，地址永远是确定的：
// 新合约地址 = "0x789..."（根据图纸和编号计算出来的固定地址）

// 步骤4：初始化
// 告诉新合约："你是用来交易USDC和WETH的"