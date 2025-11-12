pragma solidity =0.5.16;

import './interfaces/IUniswapV2Pair.sol';
import './UniswapV2ERC20.sol';
import './libraries/Math.sol';
import './libraries/UQ112x112.sol';
import './interfaces/IERC20.sol';
import './interfaces/IUniswapV2Factory.sol';
import './interfaces/IUniswapV2Callee.sol';

contract UniswapV2Pair is IUniswapV2Pair, UniswapV2ERC20 {
    //SafeMath：防止数学溢出
    using SafeMath  for uint;
    //UQ112x112：用于高精度价格计算（112.112定点数）
    using UQ112x112 for uint224;
    //MINIMUM_LIQUIDITY：首次添加流动性时永久锁定的最小LP
    uint public constant MINIMUM_LIQUIDITY = 10**3;
    //SELECTOR：ERC20 transfer 函数的选择器
    bytes4 private constant SELECTOR = bytes4(keccak256(bytes('transfer(address,uint256)')));

    //核心状态变量

    //创建此配对合约的工厂地址
    address public factory;
    //交易对中的两种代币（已排序）
    address public token0;
    address public token1;

    //两种代币的当前储备量
    uint112 private reserve0;           // uses single storage slot, accessible via getReserves
    uint112 private reserve1;           // uses single storage slot, accessible via getReserves
    //最后一次更新储备量的时间戳
    uint32  private blockTimestampLast; // uses single storage slot, accessible via getReserves

    //价格追踪变量
    //用于追踪时间加权平均价格（TWAP）
    //token0 的累积价格（用于TWAP）
    uint public price0CumulativeLast;
    //token1 的累积价格
    uint public price1CumulativeLast;
    //最后一次流动性事件后的 k 值（用于计算协议费用）
    uint public kLast; // reserve0 * reserve1, as of immediately after the most recent liquidity event

    //重入锁
    //防止重入攻击的修饰器,确保关键函数在执行期间不会被重入调用
    uint private unlocked = 1;
    modifier lock() {
        require(unlocked == 1, 'UniswapV2: LOCKED');
        unlocked = 0;
        _;
        unlocked = 1;
    }

    //外部查询当前储备状态,返回当前的储备量和时间戳
    function getReserves() public view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast) {
        //token0 的储备量
        _reserve0 = reserve0;
        //token1 的储备量
        _reserve1 = reserve1;
        //最后更新时间戳
        _blockTimestampLast = blockTimestampLast;
    }

    //安全转账函数
    function _safeTransfer(address token, address to, uint value) private {
        //低级别调用 ERC20 的 transfer 函数
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(SELECTOR, to, value));
        //检查调用是否成功
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'UniswapV2: TRANSFER_FAILED');
    }

    //记录流动性添加、移除、交易和储备量同步事件
    event Mint(address indexed sender, uint amount0, uint amount1);
    event Burn(address indexed sender, uint amount0, uint amount1, address indexed to);
    event Swap(
        address indexed sender,
        uint amount0In,
        uint amount1In,
        uint amount0Out,
        uint amount1Out,
        address indexed to
    );
    event Sync(uint112 reserve0, uint112 reserve1);

    //构造函数设置工厂地址
    constructor() public {
        factory = msg.sender;
    }

    //由工厂调用，设置交易对代币
    function initialize(address _token0, address _token1) external {
        //只有工厂合约能调用
        require(msg.sender == factory, 'UniswapV2: FORBIDDEN'); // sufficient check
        //设置第一个代币地址
        token0 = _token0;
        //设置第二个代币地址
        token1 = _token1;
    }

    // 更新储备量函数
    // 参数：新的余额和旧的储备量
    function _update(uint balance0, uint balance1, uint112 _reserve0, uint112 _reserve1) private {
        //检查余额不超过 uint112 最大值
        require(balance0 <= uint112(-1) && balance1 <= uint112(-1), 'UniswapV2: OVERFLOW');
        //取模防止溢出，只取低32位
        uint32 blockTimestamp = uint32(block.timestamp % 2**32);
        //timeElapsed：计算时间间隔，溢出是期望的（可处理时间回绕）
        uint32 timeElapsed = blockTimestamp - blockTimestampLast; // overflow is desired
        if (timeElapsed > 0 && _reserve0 != 0 && _reserve1 != 0) {
            // * never overflows, and + overflow is desired
            price0CumulativeLast += uint(UQ112x112.encode(_reserve1).uqdiv(_reserve0)) * timeElapsed;
            price1CumulativeLast += uint(UQ112x112.encode(_reserve0).uqdiv(_reserve1)) * timeElapsed;
        }
        reserve0 = uint112(balance0);
        reserve1 = uint112(balance1);
        blockTimestampLast = blockTimestamp;
        emit Sync(reserve0, reserve1);
    }

    // 铸造协议费用
    function _mintFee(uint112 _reserve0, uint112 _reserve1) private returns (bool feeOn) {
        address feeTo = IUniswapV2Factory(factory).feeTo();
        feeOn = feeTo != address(0);
        uint _kLast = kLast; // gas savings
        if (feeOn) {
            if (_kLast != 0) {
                uint rootK = Math.sqrt(uint(_reserve0).mul(_reserve1));
                uint rootKLast = Math.sqrt(_kLast);
                if (rootK > rootKLast) {
                    uint numerator = totalSupply.mul(rootK.sub(rootKLast));
                    uint denominator = rootK.mul(5).add(rootKLast);
                    uint liquidity = numerator / denominator;
                    if (liquidity > 0) _mint(feeTo, liquidity);
                }
            }
        } else if (_kLast != 0) {
            kLast = 0;
        }
    }

    // 添加流动性
    function mint(address to) external lock returns (uint liquidity) {
        //返回当前token0、token1的储备量
        (uint112 _reserve0, uint112 _reserve1,) = getReserves(); // gas savings
        //当前Pair合约的token0的代币余额
        uint balance0 = IERC20(token0).balanceOf(address(this));
        //当前Pair合约的token1的代币余额
        uint balance1 = IERC20(token1).balanceOf(address(this));
        //这次添加的token0代币的数量
        uint amount0 = balance0.sub(_reserve0);
        //这次添加的token1代币的数量
        uint amount1 = balance1.sub(_reserve1);
        //协议费
        bool feeOn = _mintFee(_reserve0, _reserve1);
        //LP代币的总发行量
        uint _totalSupply = totalSupply; // gas savings, must be defined here since totalSupply can update in _mintFee
        //首次添加流动性
        if (_totalSupply == 0) {
            // Math.sqrt 开根号
            // .mul 乘法
            // .sub 减法
            // amount0.mul(amount1) 遵循的 x*y=k 的公式
            // 首次添加流动性获得的LPtoken减去永久锁定的1000 = 获得的LPtoken
            liquidity = Math.sqrt(amount0.mul(amount1)).sub(MINIMUM_LIQUIDITY);
            // 首次添加流动性会_mint 0地址 1000 LPtoken ，这个叫永久锁定
           _mint(address(0), MINIMUM_LIQUIDITY); // permanently lock the first MINIMUM_LIQUIDITY tokens
        } else {
            //后续添加流动性
            //Math.min 取最小值
            //amount0.mul(_totalSupply) / _reserve0 可以理解为 这次添加的token0数量是储备量的几倍 再 * LPtoken总量
            //这次添加流动性返还的等价值的LPtoken
            liquidity = Math.min(amount0.mul(_totalSupply) / _reserve0, amount1.mul(_totalSupply) / _reserve1);
        }
        //验证LPtoken不为0
        require(liquidity > 0, 'UniswapV2: INSUFFICIENT_LIQUIDITY_MINTED');
        //给当前添加流动性的用户返回对应价值的LPtoken
        _mint(to, liquidity);
        
        //更新储备量
        _update(balance0, balance1, _reserve0, _reserve1);
        if (feeOn) kLast = uint(reserve0).mul(reserve1); // reserve0 and reserve1 are up-to-date
        emit Mint(msg.sender, amount0, amount1);
    }

    // 移除流动性
    function burn(address to) external lock returns (uint amount0, uint amount1) {
        //返回当前token0、token1的储备量
        (uint112 _reserve0, uint112 _reserve1,) = getReserves(); // 为了省gas 
        address _token0 = token0;                                // 为了省gas 
        address _token1 = token1;                                // 为了省gas 
        //当前Pair合约的token0的代币余额
        uint balance0 = IERC20(_token0).balanceOf(address(this));
        //当前Pair合约的token1的代币余额
        uint balance1 = IERC20(_token1).balanceOf(address(this));
        //当前Pair合约的 LPtoken 的代币余额
        uint liquidity = balanceOf[address(this)];

        bool feeOn = _mintFee(_reserve0, _reserve1);
        //LP代币的总发行量
        uint _totalSupply = totalSupply; // 为了省gas 
        //按投入的LPtoken返还等价值的token0代币
        //liquidity.mul(balance0) / _totalSupply 可以理解为 这次添加的LPtoken数量是LPtoken总量的几倍 再 * token0的代币余额
        amount0 = liquidity.mul(balance0) / _totalSupply; // using balances ensures pro-rata distribution
        //按投入的LPtoken返还等价值的token1代币
        //liquidity.mul(balance1) / _totalSupply 可以理解为 这次添加的LPtoken数量是LPtoken总量的几倍 再 * token1的代币余额
        amount1 = liquidity.mul(balance1) / _totalSupply; // using balances ensures pro-rata distribution
        //验证返还的token0和token1代币不为0
        require(amount0 > 0 && amount1 > 0, 'UniswapV2: INSUFFICIENT_LIQUIDITY_BURNED');
        //计算出这次要返还的token0和token1代币数量后 从账户上销毁这次投入的LPtoken数量
        _burn(address(this), liquidity);
        //真正将池子里的token0打到自己的账户上
        _safeTransfer(_token0, to, amount0);
        //真正将池子里的token1打到自己的账户上
        _safeTransfer(_token1, to, amount1);
        //更新当前Pair合约的token0的代币余额
        balance0 = IERC20(_token0).balanceOf(address(this));
        //更新当前Pair合约的token1的代币余额
        balance1 = IERC20(_token1).balanceOf(address(this));

        //更新储备量
        _update(balance0, balance1, _reserve0, _reserve1);
        if (feeOn) kLast = uint(reserve0).mul(reserve1); // reserve0 and reserve1 are up-to-date
        emit Burn(msg.sender, amount0, amount1, to);
    }

    // 交易函数
    //amount0Out：要输出的 token0 数量
    //amount1Out：要输出的 token1 数量
    //to：接收输出代币的地址
    //data：回调数据（用于闪电贷）
    function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external lock {
        //必须至少输出一种代币（不能两个都是0）
        require(amount0Out > 0 || amount1Out > 0, 'UniswapV2: INSUFFICIENT_OUTPUT_AMOUNT');
        //获取储备量：保存到内存变量（gas优化）
        (uint112 _reserve0, uint112 _reserve1,) = getReserves(); // gas savings
        //检查流动性：输出量必须小于储备量
        require(amount0Out < _reserve0 && amount1Out < _reserve1, 'UniswapV2: INSUFFICIENT_LIQUIDITY');

        //用于存储转账后的余额
        uint balance0;
        uint balance1;
        { // scope for _token{0,1}, avoids stack too deep errors
        //保存代币地址：gas优化
        address _token0 = token0;
        address _token1 = token1;
        //检查接收地址：不能是代币合约本身
        require(to != _token0 && to != _token1, 'UniswapV2: INVALID_TO');
        //乐观转账：先转出代币，后面再验证
        //为什么叫"乐观"：相信调用者会转入足够的代币
        if (amount0Out > 0) _safeTransfer(_token0, to, amount0Out); // optimistically transfer tokens
        if (amount1Out > 0) _safeTransfer(_token1, to, amount1Out); // optimistically transfer tokens
        //闪电贷回调：如果data不为空，调用接收者的回调函数
        //用途：实现闪电贷和复杂交易
        if (data.length > 0) IUniswapV2Callee(to).uniswapV2Call(msg.sender, amount0Out, amount1Out, data);
        //获取新余额：转账和回调后的实际余额
        balance0 = IERC20(_token0).balanceOf(address(this));
        balance1 = IERC20(_token1).balanceOf(address(this));
        }
        //公式：输入量 = 新余额 - (旧储备 - 输出量)
        //逻辑：如果余额 > (储备 - 输出)，说明有人转入了代币
        uint amount0In = balance0 > _reserve0 - amount0Out ? balance0 - (_reserve0 - amount0Out) : 0;
        uint amount1In = balance1 > _reserve1 - amount1Out ? balance1 - (_reserve1 - amount1Out) : 0;
        //必须至少有一种代币的输入量 > 0
        require(amount0In > 0 || amount1In > 0, 'UniswapV2: INSUFFICIENT_INPUT_AMOUNT');
        { // scope for reserve{0,1}Adjusted, avoids stack too deep errors
        //计算调整后余额（包含0.3%手续费）：
        //原理：从输入量中扣除0.3%作为手续费
        //公式：调整后余额 = 余额 × 1000 - 输入量 × 3
        uint balance0Adjusted = balance0.mul(1000).sub(amount0In.mul(3));
        uint balance1Adjusted = balance1.mul(1000).sub(amount1In.mul(3));
        //恒定乘积检查：
        //公式：(调整后余额0) × (调整后余额1) ≥ (旧储备0) × (旧储备1) × 1000²
        //乘以1000²：因为两边都乘以了1000，要平衡
        //X*Y=K x*y=K 100 100 = 10000  x * 200 = 10000 x=50  100+100-0.3=199.7 10000/199.7=50.1
        //简化理解：(余额0 × 1000 - 输入0 × 3) × (余额1 × 1000 - 输入1 × 3) ≥ 储备0 × 储备1 × 1000000
        require(balance0Adjusted.mul(balance1Adjusted) >= uint(_reserve0).mul(_reserve1).mul(1000**2), 'UniswapV2: K');
        }
        //更新储备量,
        _update(balance0, balance1, _reserve0, _reserve1);
        emit Swap(msg.sender, amount0In, amount1In, amount0Out, amount1Out, to);
    }

    //辅助函数
    // 提取多余的代币（当储备量与实际余额不匹配时）
    function skim(address to) external lock {
        address _token0 = token0; // gas savings
        address _token1 = token1; // gas savings
        _safeTransfer(_token0, to, IERC20(_token0).balanceOf(address(this)).sub(reserve0));
        _safeTransfer(_token1, to, IERC20(_token1).balanceOf(address(this)).sub(reserve1));
    }

    // 强制同步储备量与实际余额
    function sync() external lock {
        _update(IERC20(token0).balanceOf(address(this)), IERC20(token1).balanceOf(address(this)), reserve0, reserve1);
    }
}
