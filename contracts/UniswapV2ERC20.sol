pragma solidity =0.5.16;

import './interfaces/IUniswapV2ERC20.sol';
import './libraries/SafeMath.sol';

contract UniswapV2ERC20 is IUniswapV2ERC20 {
    //简单理解：给 uint 类型"安装扩展包"
    using SafeMath for uint;

    //标准 ERC20 代币基本信息：名称、符号、小数位、总量
    string public constant name = 'Uniswap V2';
    string public constant symbol = 'UNI-V2';
    uint8 public constant decimals = 18;
    uint  public totalSupply;

    //地址到余额的映射,记录改地址的代币余额
    mapping(address => uint) public balanceOf;
    //嵌套映射，记录授权额度：owner => spender => amount
    mapping(address => mapping(address => uint)) public allowance;

    //许可签名相关（EIP-2612）
    //EIP-712 域分隔符，防止签名重放
    bytes32 public DOMAIN_SEPARATOR;
    // keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");
    //许可函数的类型哈希，固定值
    bytes32 public constant PERMIT_TYPEHASH = 0x6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9;
    //每个地址的随机数，防止签名重复使用
    mapping(address => uint) public nonces;

    //标准 ERC20 事件：授权和转账
    event Approval(address indexed owner, address indexed spender, uint value);
    event Transfer(address indexed from, address indexed to, uint value);

    constructor() public {
        uint chainId;
        assembly {
            chainId := chainid
        }
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'),
                keccak256(bytes(name)),
                keccak256(bytes('1')),
                chainId,
                address(this)
            )
        );
    }
    //内部函数
    //铸币函数
    function _mint(address to, uint value) internal {
        //增加总供应量
        totalSupply = totalSupply.add(value);
        //增加目标地址余额
        balanceOf[to] = balanceOf[to].add(value);
        //从零地址转账事件
        emit Transfer(address(0), to, value);
    }

    //销毁函数
    function _burn(address from, uint value) internal {
        //减少地址余额和总供应量
        balanceOf[from] = balanceOf[from].sub(value);
        totalSupply = totalSupply.sub(value);
        //向零地址转账事件
        emit Transfer(from, address(0), value);
    }

    //授权函数
    function _approve(address owner, address spender, uint value) private {
        //设置授权额度
        allowance[owner][spender] = value;
        //触发授权事件
        emit Approval(owner, spender, value);
    }

    //转账函数
    function _transfer(address from, address to, uint value) private {
        //从发送方扣除余额
        balanceOf[from] = balanceOf[from].sub(value);
        //向接收方增加余额
        balanceOf[to] = balanceOf[to].add(value);
        //触发转账事件
        emit Transfer(from, to, value);
    }

    //外部函数
    //标准授权
    function approve(address spender, uint value) external returns (bool) {
        //调用者授权给spender一定额度
        _approve(msg.sender, spender, value);
        return true;
    }

    //转账
    function transfer(address to, uint value) external returns (bool) {
        //调用者向目标地址转账
        _transfer(msg.sender, to, value);
        return true;
    }

    //从授权中转账
    function transferFrom(address from, address to, uint value) external returns (bool) {
        //检查授权额度（uint(-1)表示无限授权）
        if (allowance[from][msg.sender] != uint(-1)) {
            //如果不是无限授权，则扣除相应额度
            allowance[from][msg.sender] = allowance[from][msg.sender].sub(value);
        }
        //执行转账
        _transfer(from, to, value);
        return true;
    }

    //许可函数（EIP-2612）
    function permit(address owner, address spender, uint value, uint deadline, uint8 v, bytes32 r, bytes32 s) external {
        //检查许可是否过期
        require(deadline >= block.timestamp, 'UniswapV2: EXPIRED');
        //构建 EIP-712 兼容的签名摘要
        bytes32 digest = keccak256(
            abi.encodePacked(
                '\x19\x01',
                DOMAIN_SEPARATOR,
                keccak256(abi.encode(PERMIT_TYPEHASH, owner, spender, value, nonces[owner]++, deadline))
            )
        );
        //从签名中恢复地址
        address recoveredAddress = ecrecover(digest, v, r, s);
        //验证签名有效性且与owner匹配
        require(recoveredAddress != address(0) && recoveredAddress == owner, 'UniswapV2: INVALID_SIGNATURE');
        //执行授权
        _approve(owner, spender, value);
    }
}

//工作流程举例
//假设 Alice 想授权 Bob 使用她的 100 个代币：
//线下签名：Alice 在自己的钱包中对许可消息签名，不发送交易
//传递签名：Alice 将签名（v, r, s）和其他参数交给 Bob
//提交交易：Bob 调用 permit 函数，提交所有参数
//合约验证：合约验证签名确实来自 Alice
//完成授权：在链上记录 Alice 授权给 Bob 100 个代币
