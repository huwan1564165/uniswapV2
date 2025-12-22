/**
 *Submitted for verification at Etherscan.io on 2020-06-05
*/

pragma solidity =0.6.6;

interface IUniswapV2Factory {
    event PairCreated(address indexed token0, address indexed token1, address pair, uint);

    function feeTo() external view returns (address);
    function feeToSetter() external view returns (address);

    function getPair(address tokenA, address tokenB) external view returns (address pair);
    function allPairs(uint) external view returns (address pair);
    function allPairsLength() external view returns (uint);

    function createPair(address tokenA, address tokenB) external returns (address pair);

    function setFeeTo(address) external;
    function setFeeToSetter(address) external;
}

interface IUniswapV2Pair {
    event Approval(address indexed owner, address indexed spender, uint value);
    event Transfer(address indexed from, address indexed to, uint value);

    function name() external pure returns (string memory);
    function symbol() external pure returns (string memory);
    function decimals() external pure returns (uint8);
    function totalSupply() external view returns (uint);
    function balanceOf(address owner) external view returns (uint);
    function allowance(address owner, address spender) external view returns (uint);

    function approve(address spender, uint value) external returns (bool);
    function transfer(address to, uint value) external returns (bool);
    function transferFrom(address from, address to, uint value) external returns (bool);

    function DOMAIN_SEPARATOR() external view returns (bytes32);
    function PERMIT_TYPEHASH() external pure returns (bytes32);
    function nonces(address owner) external view returns (uint);

    function permit(address owner, address spender, uint value, uint deadline, uint8 v, bytes32 r, bytes32 s) external;

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

    function MINIMUM_LIQUIDITY() external pure returns (uint);
    function factory() external view returns (address);
    function token0() external view returns (address);
    function token1() external view returns (address);
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
    function price0CumulativeLast() external view returns (uint);
    function price1CumulativeLast() external view returns (uint);
    function kLast() external view returns (uint);

    function mint(address to) external returns (uint liquidity);
    function burn(address to) external returns (uint amount0, uint amount1);
    function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external;
    function skim(address to) external;
    function sync() external;

    function initialize(address, address) external;
}

interface IUniswapV2Router01 {
    function factory() external pure returns (address);
    function WETH() external pure returns (address);

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity);
    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external payable returns (uint amountToken, uint amountETH, uint liquidity);
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB);
    function removeLiquidityETH(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external returns (uint amountToken, uint amountETH);
    function removeLiquidityWithPermit(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline,
        bool approveMax, uint8 v, bytes32 r, bytes32 s
    ) external returns (uint amountA, uint amountB);
    function removeLiquidityETHWithPermit(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline,
        bool approveMax, uint8 v, bytes32 r, bytes32 s
    ) external returns (uint amountToken, uint amountETH);
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    function swapTokensForExactTokens(
        uint amountOut,
        uint amountInMax,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline)
        external
        payable
        returns (uint[] memory amounts);
    function swapTokensForExactETH(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)
        external
        returns (uint[] memory amounts);
    function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
        external
        returns (uint[] memory amounts);
    function swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline)
        external
        payable
        returns (uint[] memory amounts);

    function quote(uint amountA, uint reserveA, uint reserveB) external pure returns (uint amountB);
    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) external pure returns (uint amountOut);
    function getAmountIn(uint amountOut, uint reserveIn, uint reserveOut) external pure returns (uint amountIn);
    function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts);
    function getAmountsIn(uint amountOut, address[] calldata path) external view returns (uint[] memory amounts);
}

interface IUniswapV2Router02 is IUniswapV2Router01 {
    function removeLiquidityETHSupportingFeeOnTransferTokens(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external returns (uint amountETH);
    function removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline,
        bool approveMax, uint8 v, bytes32 r, bytes32 s
    ) external returns (uint amountETH);

    function swapExactTokensForTokensSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external;
    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable;
    function swapExactTokensForETHSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external;
}

interface IERC20 {
    event Approval(address indexed owner, address indexed spender, uint value);
    event Transfer(address indexed from, address indexed to, uint value);

    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
    function totalSupply() external view returns (uint);
    function balanceOf(address owner) external view returns (uint);
    function allowance(address owner, address spender) external view returns (uint);

    function approve(address spender, uint value) external returns (bool);
    function transfer(address to, uint value) external returns (bool);
    function transferFrom(address from, address to, uint value) external returns (bool);
}

interface IWETH {
    function deposit() external payable;
    function transfer(address to, uint value) external returns (bool);
    function withdraw(uint) external;
}

contract UniswapV2Router02 is IUniswapV2Router02 {
    using SafeMath for uint;

    address public immutable override factory;
    address public immutable override WETH;

    //ensure(deadline)函数修饰器，检查交易是否过期,防止交易在市场价格变化后仍被执行
    modifier ensure(uint deadline) {
        require(deadline >= block.timestamp, 'UniswapV2Router: EXPIRED');
        _;
    }

    constructor(address _factory, address _WETH) public {
        factory = _factory;
        WETH = _WETH;
    }

    receive() external payable {
        assert(msg.sender == WETH); // only accept ETH via fallback from the WETH contract
    }

    // **** ADD LIQUIDITY ****
    function _addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,// 用户希望添加的A代币数量
        uint amountBDesired,// 用户希望添加的B代币数量
        uint amountAMin,    // 用户能接受的最少A代币数量
        uint amountBMin     // 用户能接受的最少B代币数量
    ) internal virtual returns (uint amountA, uint amountB) {
        //如果当前交易对不存在，就先创建
        if (IUniswapV2Factory(factory).getPair(tokenA, tokenB) == address(0)) {
            IUniswapV2Factory(factory).createPair(tokenA, tokenB);
        }
        //获取储备量
        (uint reserveA, uint reserveB) = UniswapV2Library.getReserves(factory, tokenA, tokenB);
        //首次添加流动性时直接使用用户期待添加的代币数量
        if (reserveA == 0 && reserveB == 0) {
            (amountA, amountB) = (amountADesired, amountBDesired);
        } else {
            //如果已有流动性：根据当前比例计算最优添加量，确保不改变价格
            //根据A的数量计算需要多少B
            uint amountBOptimal = UniswapV2Library.quote(amountADesired, reserveA, reserveB);

            //当最优添加量小于用户希望添加数量时
            if (amountBOptimal <= amountBDesired) {
                //最优添加量应大于等于用户能接受的最少代币数量
                require(amountBOptimal >= amountBMin, 'UniswapV2Router: INSUFFICIENT_B_AMOUNT');
                //返回最优添加量
                (amountA, amountB) = (amountADesired, amountBOptimal);
            } else {
                // 当计算出的B需求 > 用户愿意提供的B时
                //根据B的数量计算需要多少A
                uint amountAOptimal = UniswapV2Library.quote(amountBDesired, reserveB, reserveA);

                assert(amountAOptimal <= amountADesired);
                //最优添加量应大于等于用户能接受的最少代币数量
                require(amountAOptimal >= amountAMin, 'UniswapV2Router: INSUFFICIENT_A_AMOUNT');
                //返回最优添加量
                (amountA, amountB) = (amountAOptimal, amountBDesired);
            }
        }
    }
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,     // 接收LP代币的地址
        uint deadline   // 交易有效期
    ) external virtual override ensure(deadline) returns (uint amountA, uint amountB, uint liquidity) {
        //计算实际添加量
        (amountA, amountB) = _addLiquidity(tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin);
        //计算交易对地址,使用 CREATE2 方式确定性计算 pair 地址，无需链上查询。
        address pair = UniswapV2Library.pairFor(factory, tokenA, tokenB);
        //将代币从用户转到交易对合约。
        TransferHelper.safeTransferFrom(tokenA, msg.sender, pair, amountA);
        TransferHelper.safeTransferFrom(tokenB, msg.sender, pair, amountB);
        //铸造流动性代币
        liquidity = IUniswapV2Pair(pair).mint(to);
    }
    //ensure(deadline)函数修饰器，检查交易是否过期,防止交易在市场价格变化后仍被执行
    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external virtual override payable ensure(deadline) returns (uint amountToken, uint amountETH, uint liquidity) {
        //计算添加量（ETH作为tokenB）
        (amountToken, amountETH) = _addLiquidity(
            token,
            WETH,           // 使用WETH地址
            amountTokenDesired,
            msg.value,      // 用户发送的ETH数量
            amountTokenMin,
            amountETHMin
        );
        //根据token计算pair地址
        address pair = UniswapV2Library.pairFor(factory, token, WETH);
        // 转账ERC20代币
        //TransferHelper 是一个安全的代币和ETH转账工具库
        TransferHelper.safeTransferFrom(token, msg.sender, pair, amountToken);
        // 将ETH包装成WETH
        IWETH(WETH).deposit{value: amountETH}();
        // 转账WETH到pair
        assert(IWETH(WETH).transfer(pair, amountETH));
        //铸造LP代币
        liquidity = IUniswapV2Pair(pair).mint(to);
        //如果用户发送的ETH多于实际需要的，退还差额。
        if (msg.value > amountETH) TransferHelper.safeTransferETH(msg.sender, msg.value - amountETH);
    }

    // **** REMOVE LIQUIDITY ****
    //移除流动性
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint liquidity, //LP代币的数量
        uint amountAMin,
        uint amountBMin,
        address to,     //接收tokenA，tokenB的地址
        uint deadline   // 交易有效期
    ) public virtual override ensure(deadline) returns (uint amountA, uint amountB) {
        //根据token计算pair地址
        address pair = UniswapV2Library.pairFor(factory, tokenA, tokenB);
        //向pair地址转入LPtoken
        IUniswapV2Pair(pair).transferFrom(msg.sender, pair, liquidity); // send liquidity to pair
        //进行移除流动性并返还对应数量的tokenA，tokenB
        (uint amount0, uint amount1) = IUniswapV2Pair(pair).burn(to);
        //进行排序
        (address token0,) = UniswapV2Library.sortTokens(tokenA, tokenB);
        //需要返回用户输入的 tokenA 和 tokenB 顺序
        (amountA, amountB) = tokenA == token0 ? (amount0, amount1) : (amount1, amount0);
        //确保用户实际收到的代币数量不低于预期最小值
        require(amountA >= amountAMin, 'UniswapV2Router: INSUFFICIENT_A_AMOUNT');
        require(amountB >= amountBMin, 'UniswapV2Router: INSUFFICIENT_B_AMOUNT');
    }
    //移除ETH-代币流动性
    function removeLiquidityETH(
        address token,
        uint liquidity,
        uint amountTokenMin,// 用户能接受的最少代币数量
        uint amountETHMin,  // 用户能接受的最少ETH代币数量
        address to,
        uint deadline       // 交易有效期
    ) public virtual override ensure(deadline) returns (uint amountToken, uint amountETH) {
        //调用基础移除函数，将WETH作为第二个代币
        (amountToken, amountETH) = removeLiquidity(
            token,
            WETH,
            liquidity,
            amountTokenMin,
            amountETHMin,
            address(this),//接收地址是Router合约本身，不是最终用户
            deadline
        );
        //将ERC20从Router转给用户
        TransferHelper.safeTransfer(token, to, amountToken);
        //将WETH转成ETH
        IWETH(WETH).withdraw(amountETH);
        //将ETH转给用户
        TransferHelper.safeTransferETH(to, amountETH);
    }
    //带授权的移除流动性
    function removeLiquidityWithPermit(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline,      //签名有效期
        bool approveMax,    // true = 授权最大uint值，false = 授权具体数量
        uint8 v, bytes32 r, bytes32 s // EIP-712签名参数
    ) external virtual override returns (uint amountA, uint amountB) {
        //计算pair地址
        address pair = UniswapV2Library.pairFor(factory, tokenA, tokenB);
        //确定授权数量：最大uint值或具体LPToken数量
        uint value = approveMax ? uint(-1) : liquidity;
        //使用签名调用Pair的permit函数，授权Router可以转移用户的LP代币
        IUniswapV2Pair(pair).permit(msg.sender, address(this), value, deadline, v, r, s);
        //进行移除流动性
        (amountA, amountB) = removeLiquidity(tokenA, tokenB, liquidity, amountAMin, amountBMin, to, deadline);
    }
    //带授权的移除ETH-代币流动性
    function removeLiquidityETHWithPermit(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline,
        bool approveMax,
         uint8 v, bytes32 r, bytes32 s
    ) external virtual override returns (uint amountToken, uint amountETH) {
        //计算pair地址
        address pair = UniswapV2Library.pairFor(factory, token, WETH);
        //确定授权数量为最大uint值或者具体的LPToken数量
        uint value = approveMax ? uint(-1) : liquidity;
        //使用签名调用pair的permit函数，授权Router可以转移用户的LP代币
        IUniswapV2Pair(pair).permit(msg.sender, address(this), value, deadline, v, r, s);
        //调用基础移除函数，将WETH作为第二个代币
        (amountToken, amountETH) = removeLiquidityETH(token, liquidity, amountTokenMin, amountETHMin, to, deadline);
    }

    // **** REMOVE LIQUIDITY (supporting fee-on-transfer tokens) ****
    //ensure(deadline)函数修饰器，检查交易是否过期,防止交易在市场价格变化后仍被执行
    //支持转账手续费的移除ETH-代币流动性
    function removeLiquidityETHSupportingFeeOnTransferTokens(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) public virtual override ensure(deadline) returns (uint amountETH) {
        //调用基础移除函数，只接收ETH数量
        //因为token代币的转账数量 ≠ 实际收到数量
        (, amountETH) = removeLiquidity(
            token,
            WETH,
            liquidity,
            amountTokenMin,
            amountETHMin,
            address(this),  // 代币先转到Router
            deadline
        );
        //不知道实际收到多少，转账Router中该代币的全部余额
        TransferHelper.safeTransfer(token, to, IERC20(token).balanceOf(address(this)));
        //将WETH转成ETH
        IWETH(WETH).withdraw(amountETH);
        //转ETH给用户
        TransferHelper.safeTransferETH(to, amountETH);
    }
    //支持转账手续费同时带授权 的 移除ETH-代币流动性
    function removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline,
        bool approveMax, // true = 授权最大uint值，false = 授权具体数量
        uint8 v, bytes32 r, bytes32 s // EIP-712签名参数
    ) external virtual override returns (uint amountETH) {
        //计算pair地址
        address pair = UniswapV2Library.pairFor(factory, token, WETH);
        //确定授权数量为最大uint值或者具体的LPToken数量
        uint value = approveMax ? uint(-1) : liquidity;
        //使用签名调用pair的permit函数，授权Router可以转移用户的LP代币
        IUniswapV2Pair(pair).permit(msg.sender, address(this), value, deadline, v, r, s);
        //调用上面的支持手续费代币移除函数
        amountETH = removeLiquidityETHSupportingFeeOnTransferTokens(
            token, liquidity, amountTokenMin, amountETHMin, to, deadline
        );
    }

    // **** SWAP ****
    // requires the initial amount to have already been sent to the first pair
    //标准交易执行
    //要求输入代币已经转账到第一个交易对
    function _swap(uint[] memory amounts, address[] memory path, address _to) internal virtual {
        // 遍历交易路径中的每一对交易
        for (uint i; i < path.length - 1; i++) {
            // 当前交易的输入代币和输出代币
            (address input, address output) = (path[i], path[i + 1]);
            // 对代币地址排序，确定token0（小地址）和token1（大地址）
            (address token0,) = UniswapV2Library.sortTokens(input, output);
            // 从预计算的数组中获取当前交易的输出数量
            uint amountOut = amounts[i + 1];
            // 确定swap输出的token方向
            // 如果input是token0，那么输出的是token1
            // 如果input是token1，那么输出的是token0
            (uint amount0Out, uint amount1Out) = input == token0 ? (uint(0), amountOut) : (amountOut, uint(0));
            //确定接收地址
            // - 如果不是最后一跳：输出代币转到下一个交易对
            // - 如果是最后一跳：输出代币转到最终用户地址_to
            address to = i < path.length - 2 ? UniswapV2Library.pairFor(factory, output, path[i + 2]) : _to;
            // 执行swap操作
            IUniswapV2Pair(UniswapV2Library.pairFor(factory, input, output)).swap(
                amount0Out, amount1Out, to, new bytes(0)
            );
        }
    }
    //用确定数量的代币A，换取最少数量要求的代币B
    function swapExactTokensForTokens(
        uint amountIn,          // 确定输入数量
        uint amountOutMin,      // 最少输出数量（防止滑点）
        address[] calldata path,// 交易路径（calldata节省gas）
        address to,             // 输出代币接收地址
        uint deadline           // 交易有效期   
    ) external virtual override ensure(deadline) returns (uint[] memory amounts) {
        //预先计算整个路径的交易数量
        // getAmountsOut会计算每一跳的输入输出数量
        amounts = UniswapV2Library.getAmountsOut(factory, amountIn, path);
        //验证最终输出代币数量 >= 最少输出数量
        require(amounts[amounts.length - 1] >= amountOutMin, 'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT');
        //将输入代币从用户转到第一个交易对
        TransferHelper.safeTransferFrom(
            path[0], msg.sender, UniswapV2Library.pairFor(factory, path[0], path[1]), amounts[0]
        );
        //执行swap交易
        _swap(amounts, path, to);
    }
    //用不超过指定数量的代币A，换取确定数量的代币B
    function swapTokensForExactTokens(
        uint amountOut,     // 期望的确切输出数量
        uint amountInMax,   // 用户最多愿意支付的输入数量
        address[] calldata path,
        address to,
        uint deadline
    ) external virtual override ensure(deadline) returns (uint[] memory amounts) {
        //反向计算需要的输入数量
        amounts = UniswapV2Library.getAmountsIn(factory, amountOut, path);
        //验证计算出的输入数量不超过用户上限
        require(amounts[0] <= amountInMax, 'UniswapV2Router: EXCESSIVE_INPUT_AMOUNT');
        //转账输入代币
        TransferHelper.safeTransferFrom(
            path[0], msg.sender, UniswapV2Library.pairFor(factory, path[0], path[1]), amounts[0]
        );
        //执行swapw
        _swap(amounts, path, to);
    }
    //用确定数量的ETH购买代币
    // payable: 表示函数可以接收ETH
    function swapExactETHForTokens(
        uint amountOutMin,      //最少获得的代币数量
        address[] calldata path,//路径必须以WETH开头，如[WETH, DAI]
         address to, 
         uint deadline) external virtual override payable ensure(deadline) returns (uint[] memory amounts)
    {
        // 验证：路径的第一个代币必须是WETH
        require(path[0] == WETH, 'UniswapV2Router: INVALID_PATH');
        // 计算输出数量，msg.value是用户发送的ETH数量
        amounts = UniswapV2Library.getAmountsOut(factory, msg.value, path);
        // 验证输出数量
        require(amounts[amounts.length - 1] >= amountOutMin, 'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT');
        // 将ETH包装成WETH
        IWETH(WETH).deposit{value: amounts[0]}();
        // 将WETH转到第一个交易对
        assert(IWETH(WETH).transfer(UniswapV2Library.pairFor(factory, path[0], path[1]), amounts[0]));
        // 执行swap
        _swap(amounts, path, to);
    }
    //用代币换取确定数量的ETH
    //  address[] calldata path 路径必须以WETH结尾，如[DAI, WETH]
    function swapTokensForExactETH(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)
        external
        virtual
        override
        ensure(deadline)
        returns (uint[] memory amounts)
    {
        // 验证：路径的最后一个代币必须是WETH
        require(path[path.length - 1] == WETH, 'UniswapV2Router: INVALID_PATH');
        // 计算需要的输入代币数量
        amounts = UniswapV2Library.getAmountsIn(factory, amountOut, path);
        // 验证输入数量不超过上限
        require(amounts[0] <= amountInMax, 'UniswapV2Router: EXCESSIVE_INPUT_AMOUNT');
        // 转账输入代币
        TransferHelper.safeTransferFrom(
            path[0], msg.sender, UniswapV2Library.pairFor(factory, path[0], path[1]), amounts[0]
        );
        // 执行swap，输出代币发送到Router合约（address(this)）
        _swap(amounts, path, address(this));
        // 将WETH解包为ETH
        IWETH(WETH).withdraw(amounts[amounts.length - 1]);
        // 将ETH转给用户
        TransferHelper.safeTransferETH(to, amounts[amounts.length - 1]);
    }
    //卖出确定数量的代币换取ETH
    function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
        external
        virtual
        override
        ensure(deadline)
        returns (uint[] memory amounts)
    {
        // 路径必须以WETH结尾
        require(path[path.length - 1] == WETH, 'UniswapV2Router: INVALID_PATH');
        // 计算输出ETH数量
        amounts = UniswapV2Library.getAmountsOut(factory, amountIn, path);
        // 验证输出数量
        require(amounts[amounts.length - 1] >= amountOutMin, 'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT');
        // 转账输入代币
        TransferHelper.safeTransferFrom(
            path[0], msg.sender, UniswapV2Library.pairFor(factory, path[0], path[1]), amounts[0]
        );
        // 执行swap，WETH发送到Router
        _swap(amounts, path, address(this));
        // WETH转ETH
        IWETH(WETH).withdraw(amounts[amounts.length - 1]);
        // ETH转用户
        TransferHelper.safeTransferETH(to, amounts[amounts.length - 1]);
    }
    //用ETH购买确定数量的代币
    function swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline)
        external
        virtual
        override
        payable
        ensure(deadline)
        returns (uint[] memory amounts)
    {
        // 验证路径以WETH开头
        require(path[0] == WETH, 'UniswapV2Router: INVALID_PATH');
        // 计算需要的ETH数量
        amounts = UniswapV2Library.getAmountsIn(factory, amountOut, path);
        // 验证用户发送的ETH足够支付
        require(amounts[0] <= msg.value, 'UniswapV2Router: EXCESSIVE_INPUT_AMOUNT');
        // 包装ETH成WETH
        IWETH(WETH).deposit{value: amounts[0]}();
        // 转账WETH到第一个交易对
        assert(IWETH(WETH).transfer(UniswapV2Library.pairFor(factory, path[0], path[1]), amounts[0]));
        // 执行swap
        _swap(amounts, path, to);
        // refund dust eth, if any
        // 退还多余的ETH
        if (msg.value > amounts[0]) TransferHelper.safeTransferETH(msg.sender, msg.value - amounts[0]);
    }


// for (uint i; i < path.length - 1; i++) {
//             // 当前交易的输入代币和输出代币
//             (address input, address output) = (path[i], path[i + 1]);
//             // 对代币地址排序，确定token0（小地址）和token1（大地址）
//             (address token0,) = UniswapV2Library.sortTokens(input, output);
//             // 从预计算的数组中获取当前交易的输出数量
//             uint amountOut = amounts[i + 1];
//             // 确定swap输出的token方向
//             // 如果input是token0，那么输出的是token1
//             // 如果input是token1，那么输出的是token0
//             (uint amount0Out, uint amount1Out) = input == token0 ? (uint(0), amountOut) : (amountOut, uint(0));
//             //确定接收地址
//             // - 如果不是最后一跳：输出代币转到下一个交易对
//             // - 如果是最后一跳：输出代币转到最终用户地址_to
//             address to = i < path.length - 2 ? UniswapV2Library.pairFor(factory, output, path[i + 2]) : _to;
//             // 执行swap操作
//             IUniswapV2Pair(UniswapV2Library.pairFor(factory, input, output)).swap(
//                 amount0Out, amount1Out, to, new bytes(0)
//             );
//         }
    // **** SWAP (supporting fee-on-transfer tokens) ****
    //手续费代币支持函数
    // requires the initial amount to have already been sent to the first pair
    // 与标准_swap的关键区别：实时计算实际接收的代币数量
    function _swapSupportingFeeOnTransferTokens(address[] memory path, address _to) internal virtual {
        for (uint i; i < path.length - 1; i++) {
            //输入输出代币
            (address input, address output) = (path[i], path[i + 1]);
            // 排序取小地址
            (address token0,) = UniswapV2Library.sortTokens(input, output);
            // 获取交易对合约
            IUniswapV2Pair pair = IUniswapV2Pair(UniswapV2Library.pairFor(factory, input, output));
            uint amountInput;
            uint amountOutput;
            { // 作用域块，避免堆栈过深错误
            // 获取储备量
            (uint reserve0, uint reserve1,) = pair.getReserves();
            // 确定输入和输出的储备量
            (uint reserveInput, uint reserveOutput) = input == token0 ? (reserve0, reserve1) : (reserve1, reserve0);
            // 关键：查询Pair实际收到的代币数量
            // 余额 - 储备量 = 实际收到的数量（考虑了手续费）
            amountInput = IERC20(input).balanceOf(address(pair)).sub(reserveInput);
            // 根据实际收到的数量计算输出
            amountOutput = UniswapV2Library.getAmountOut(amountInput, reserveInput, reserveOutput);
            }
            // 确定输出方向
            (uint amount0Out, uint amount1Out) = input == token0 ? (uint(0), amountOutput) : (amountOutput, uint(0));
            // 确定接收地址
            address to = i < path.length - 2 ? UniswapV2Library.pairFor(factory, output, path[i + 2]) : _to;
            // 执行swap
            pair.swap(amount0Out, amount1Out, to, new bytes(0));
        }
    }
    // 手续费代币交易函数示例
    function swapExactTokensForTokensSupportingFeeOnTransferTokens(
        uint amountIn,      // 输入数量
        uint amountOutMin,  // 最少输出数量
        address[] calldata path,
        address to,
        uint deadline
    ) external virtual override ensure(deadline) {
        // 直接转账输入代币到第一个Pair（不预先计算）
        TransferHelper.safeTransferFrom(
            path[0], msg.sender, UniswapV2Library.pairFor(factory, path[0], path[1]), amountIn
        );
        // 记录用户当前的目标代币余额
        uint balanceBefore = IERC20(path[path.length - 1]).balanceOf(to);
        // 执行手续费代币swap
        _swapSupportingFeeOnTransferTokens(path, to);
        // 事后验证：用户增加的余额是否满足要求
        require(
            IERC20(path[path.length - 1]).balanceOf(to).sub(balanceBefore) >= amountOutMin,
            'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT'
        );
    }
    //用ETH购买有手续费的代币
    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    )
        external
        virtual
        override
        payable
        ensure(deadline)
    {
        // 验证路径：必须从WETH开始
        require(path[0] == WETH, 'UniswapV2Router: INVALID_PATH');
        // amountIn = 用户发送的ETH数量，比如 1 ETH
        uint amountIn = msg.value;
        // 将1 ETH包装成1 WETH
        IWETH(WETH).deposit{value: amountIn}();
        // 将1 WETH转到WETH-XXX交易对
        assert(IWETH(WETH).transfer(UniswapV2Library.pairFor(factory, path[0], path[1]), amountIn));
        // 关键：记录用户当前有多少代币
        uint balanceBefore = IERC20(path[path.length - 1]).balanceOf(to);
        // 执行支持手续费的swap
        _swapSupportingFeeOnTransferTokens(path, to);
        // 验证：用户增加的代币数量是否满足最低要求
        require(
            IERC20(path[path.length - 1]).balanceOf(to).sub(balanceBefore) >= amountOutMin,
            'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT'
        );
    }
    //卖出有手续费的代币换取ETH
    function swapExactTokensForETHSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    )
        external
        virtual
        override
        ensure(deadline)
    {
        // 验证路径：必须以WETH结束
        require(path[path.length - 1] == WETH, 'UniswapV2Router: INVALID_PATH');
        // 将用户的代币转到XXX-WETH交易对
        TransferHelper.safeTransferFrom(
            path[0], msg.sender, UniswapV2Library.pairFor(factory, path[0], path[1]), amountIn
        );
        // 执行支持手续费的swap
        // 注意：输出地址是Router合约本身（address(this)）
        _swapSupportingFeeOnTransferTokens(path, address(this));
        // 查询Router合约现在有多少WETH
        uint amountOut = IERC20(WETH).balanceOf(address(this));
        // 验证：获得的WETH是否满足最低要求
        require(amountOut >= amountOutMin, 'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT');
        // 将WETH解包为ETH
        IWETH(WETH).withdraw(amountOut);
        // 将ETH转给用户
        TransferHelper.safeTransferETH(to, amountOut);
    }

    // **** LIBRARY FUNCTIONS ****
    //根据储备量比例，计算 amountA 对应的 amountB
    function quote(uint amountA, uint reserveA, uint reserveB) public pure virtual override returns (uint amountB) {
        return UniswapV2Library.quote(amountA, reserveA, reserveB);
    }
    //考虑0.3%手续费后，实际能获得多少输出代币
    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut)
        public
        pure
        virtual
        override
        returns (uint amountOut)
    {
        return UniswapV2Library.getAmountOut(amountIn, reserveIn, reserveOut);
    }
    //想要获得指定数量输出，需要多少输入（考虑手续费）
    function getAmountIn(uint amountOut, uint reserveIn, uint reserveOut)
        public
        pure
        virtual
        override
        returns (uint amountIn)
    {
        return UniswapV2Library.getAmountIn(amountOut, reserveIn, reserveOut);
    }
    //计算多跳交易输出,沿着路径计算每一步的交易数量
    function getAmountsOut(uint amountIn, address[] memory path)
        public
        view
        virtual
        override
        returns (uint[] memory amounts)
    {
        return UniswapV2Library.getAmountsOut(factory, amountIn, path);
    }
    //计算多跳交易输入,反向计算需要多少输入才能获得指定输出
    function getAmountsIn(uint amountOut, address[] memory path)
        public
        view
        virtual
        override
        returns (uint[] memory amounts)
    {
        return UniswapV2Library.getAmountsIn(factory, amountOut, path);
    }
}

// a library for performing overflow-safe math, courtesy of DappHub (https://github.com/dapphub/ds-math)

library SafeMath {
    function add(uint x, uint y) internal pure returns (uint z) {
        require((z = x + y) >= x, 'ds-math-add-overflow');
    }

    function sub(uint x, uint y) internal pure returns (uint z) {
        require((z = x - y) <= x, 'ds-math-sub-underflow');
    }

    function mul(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x, 'ds-math-mul-overflow');
    }
}

library UniswapV2Library {
    using SafeMath for uint;

    // returns sorted token addresses, used to handle return values from pairs sorted in this order
    function sortTokens(address tokenA, address tokenB) internal pure returns (address token0, address token1) {
        require(tokenA != tokenB, 'UniswapV2Library: IDENTICAL_ADDRESSES');
        (token0, token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), 'UniswapV2Library: ZERO_ADDRESS');
    }

    // calculates the CREATE2 address for a pair without making any external calls
    function pairFor(address factory, address tokenA, address tokenB) internal pure returns (address pair) {
        (address token0, address token1) = sortTokens(tokenA, tokenB);
        pair = address(uint(keccak256(abi.encodePacked(
                hex'ff',
                factory,
                keccak256(abi.encodePacked(token0, token1)),
                //hex'96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f' // init code hash
                hex'58e929003955f09d033fdd5bd7a49542917c7e9e2a155992adcb74451f1664d6' // 你的init code hash
            ))));
    }

    // fetches and sorts the reserves for a pair
    //获取储备量
    function getReserves(address factory, address tokenA, address tokenB) internal view returns (uint reserveA, uint reserveB) {
        //排序代币地址
        (address token0,) = sortTokens(tokenA, tokenB);
        //计算pair地址并查询储备量
        (uint reserve0, uint reserve1,) = IUniswapV2Pair(pairFor(factory, tokenA, tokenB)).getReserves();
        //映射回原始顺序
        (reserveA, reserveB) = tokenA == token0 ? (reserve0, reserve1) : (reserve1, reserve0);
    }

    // given some amount of an asset and pair reserves, returns an equivalent amount of the other asset
    function quote(uint amountA, uint reserveA, uint reserveB) internal pure returns (uint amountB) {
        //验证amountA不为0
        require(amountA > 0, 'UniswapV2Library: INSUFFICIENT_AMOUNT');
        //验证当前不是空池
        require(reserveA > 0 && reserveB > 0, 'UniswapV2Library: INSUFFICIENT_LIQUIDITY');
        //500=1000*100/200;
        amountB = amountA.mul(reserveB) / reserveA;
    }

    // given an input amount of an asset and pair reserves, returns the maximum output amount of the other asset
    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) internal pure returns (uint amountOut) {
        // 验证输入
        require(amountIn > 0, 'UniswapV2Library: INSUFFICIENT_INPUT_AMOUNT');
        require(reserveIn > 0 && reserveOut > 0, 'UniswapV2Library: INSUFFICIENT_LIQUIDITY');
        // 扣除0.3%手续费
        uint amountInWithFee = amountIn.mul(997);
        // 恒定乘积公式计算输出
        uint numerator = amountInWithFee.mul(reserveOut);
        uint denominator = reserveIn.mul(1000).add(amountInWithFee);
        amountOut = numerator / denominator;
    }

    // given an output amount of an asset and pair reserves, returns a required input amount of the other asset
    function getAmountIn(uint amountOut, uint reserveIn, uint reserveOut) internal pure returns (uint amountIn) {
        // 验证输入
        require(amountOut > 0, 'UniswapV2Library: INSUFFICIENT_OUTPUT_AMOUNT');
        require(reserveIn > 0 && reserveOut > 0, 'UniswapV2Library: INSUFFICIENT_LIQUIDITY');
        // 恒定乘积公式反推输入
        // amountIn - amountIn *3/1000= amountIn1
        // amountIn(1-3/1000) = amountIn1
        // reserveIn*reserveOut=(reserveIn+amountIn(1-3/1000))*(reserveOut-amountOut)
        //    reserveIn*reserveOut = reserveIn*reserveOut -  reserveIn*amountOut+amountIn(1-3/1000)*reserveOut -amountIn(1-3/1000)*amountOut
        //  reserveIn*amountOut = amountIn(1-3/1000)*reserveOut -amountIn(1-3/1000)*amountOut
        //  reserveIn*amountOut = amountIn(997/1000)*(reserveOut-amountOut)
        //   1000*reserveIn*amountOut = amountIn*997*(reserveOut-amountOut)

        uint numerator = reserveIn.mul(amountOut).mul(1000);
        uint denominator = reserveOut.sub(amountOut).mul(997);
        amountIn = (numerator / denominator).add(1);// +1 防止舍入误差
    }

    // performs chained getAmountOut calculations on any number of pairs
    //计算每一跳的输入输出数量
    function getAmountsOut(address factory, uint amountIn, address[] memory path) internal view returns (uint[] memory amounts) {
        // 路径必须至少2个代币（一次交换）
        require(path.length >= 2, 'UniswapV2Library: INVALID_PATH');
        // 创建返回数组，长度 = 路径长度
        amounts = new uint[](path.length);
        // 第一个元素是输入数量
        amounts[0] = amountIn;
        // 正向循环：从第1个到倒数第2个
        for (uint i; i < path.length - 1; i++) {
            // 获取当前交易对的储备量
            (uint reserveIn, uint reserveOut) = getReserves(factory, path[i], path[i + 1]);
            // 计算输出数量（考虑0.3%手续费）
            amounts[i + 1] = getAmountOut(amounts[i], reserveIn, reserveOut);
        }
    }

    // performs chained getAmountIn calculations on any number of pairs
    
    //反向计算需要的输入数量
    function getAmountsIn(address factory, uint amountOut, address[] memory path) internal view returns (uint[] memory amounts) {
        // 路径必须至少2个代币（一次交换）
        require(path.length >= 2, 'UniswapV2Library: INVALID_PATH');
        // 创建返回数组，长度 = 路径长度
        amounts = new uint[](path.length);
        // 最后一个元素是输出数量
        amounts[amounts.length - 1] = amountOut;
        // 反向循环：从倒数第2个到第1个
        for (uint i = path.length - 1; i > 0; i--) {
            // 获取储备量
            (uint reserveIn, uint reserveOut) = getReserves(factory, path[i - 1], path[i]);
            // 计算输入数量
            amounts[i - 1] = getAmountIn(amounts[i], reserveIn, reserveOut);
        }
    }
}

// helper methods for interacting with ERC20 tokens and sending ETH that do not consistently return true/false
library TransferHelper {
    function safeApprove(address token, address to, uint value) internal {
        // bytes4(keccak256(bytes('approve(address,uint256)')));
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0x095ea7b3, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'TransferHelper: APPROVE_FAILED');
    }

    function safeTransfer(address token, address to, uint value) internal {
        // bytes4(keccak256(bytes('transfer(address,uint256)')));
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0xa9059cbb, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'TransferHelper: TRANSFER_FAILED');
    }

    function safeTransferFrom(address token, address from, address to, uint value) internal {
        // bytes4(keccak256(bytes('transferFrom(address,address,uint256)')));
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0x23b872dd, from, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'TransferHelper: TRANSFER_FROM_FAILED');
    }

    function safeTransferETH(address to, uint value) internal {
        (bool success,) = to.call{value:value}(new bytes(0));
        require(success, 'TransferHelper: ETH_TRANSFER_FAILED');
    }
}