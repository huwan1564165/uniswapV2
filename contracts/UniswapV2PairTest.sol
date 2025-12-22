pragma solidity ^0.8.0;

import './interfaces/IUniswapV2Pair.sol';
import './interfaces/IUniswapV2Factory.sol';
import './interfaces/IUniswapV2Callee.sol';
import './MyTokens.sol';
import './libraries/Math1.sol';
contract UniswapV2PairTest{
    
    IUniswapV2Factory public factory;
    MyTokens public token0;
    MyTokens public token1;
    IUniswapV2Pair public pair;

    address public owner;
    address public add1 = address(1);
    uint256 constant initialSupply=10000*10**18;
    address public token0address;
    address public token1address;
    address public pairadd;


    constructor(address _factory) {
        owner = msg.sender;
        factory = IUniswapV2Factory(_factory);
  
    }
    function before() public {
        //部署工厂合约
        //部署测试代币
        token0 = new MyTokens("Token 0","TK0",initialSupply);
        token1 = new MyTokens("Token 1","TK1",initialSupply);
        token0address = address(token0);
        token1address = address(token1);
        //创建池子
        factory.createPair(token0address,token1address);
        pairadd = factory.getPair(token0address,token1address);
        pair = IUniswapV2Pair(pairadd);

        //排序
        MyTokens tokenA=token0address<token1address?token0:token1;
        MyTokens tokenB=token0address>token1address?token0:token1;
        token0=tokenA;
        token1=tokenB;
        token0address = address(token0);
        token1address = address(token1);
    }
    //初始化测试
    function init() public{
        require(pair.factory() == address(factory),"no factory");
        require(pair.token0() == token0address,"no token0");
        require(pair.token1() == token1address,"no token1");
    }
    //返回储备量测试
    function getReservesTest() public{
        (uint112 reserve0, uint112 reserve1,uint32 blockTimestampLast) = pair.getReserves();
        require(reserve0 == 0,"no reserve0");
        require(reserve1 == 0,"no reserve1");
        require(blockTimestampLast == 0,"no blockTimestampLast");
    }
    //LPtoken初始化测试
    function LPTokenInit() public{
        //知识点：在solidity字符串只能通过哈希进行比较
        require(keccak256(abi.encodePacked(pair.name()))  == keccak256(abi.encodePacked("Uniswap V2")) 
        ,"no name");
        require(keccak256(abi.encodePacked(pair.symbol()))  == keccak256(abi.encodePacked("UNI-V2")) 
        ,"no symbol");
        require(pair.decimals() == 18,"no decimals");
        require(pair.totalSupply() == 0,"no totalSupply");
    }
    //首次添加流动性测试
    function mintTest() public {
        //给Pair合约转账，增加余额
        uint256 value0 = 100*10**18;
        uint256 value1 = 100*10**18;
        token0.transfer(pairadd,value0);
        token1.transfer(pairadd,value1);

        uint256 balance0=token0.balanceOf(pairadd);
        uint256 balance1=token1.balanceOf(pairadd);
        pair.mint(owner);

        //检查LPToken数量是否正确
        uint256 liquidityA=pair.balanceOf(owner);
        uint256 liquidityB=Math1.sqrt(value0*value1)-1000;
        require(liquidityA==liquidityB,unicode"LPToken返回数量不对");
        //首次添加流动性LPToken总量应大于获得的LPToken
        require(pair.totalSupply() > liquidityA,unicode"LPToken返回数量不对");
        //检查储备量是否正确更新
        (uint112 reserve0, uint112 reserve1,) = pair.getReserves();
        require(reserve0==balance0,"no reserve0");
        require(reserve1==balance1,"no reserve1");


    }
    //移除流动性测试
    function burnTest()public{
        //给Pair合约转账，增加余额
        uint256 value0 = 100*10**18;
        uint256 value1 = 100*10**18;
        token0.transfer(pairadd,value0);
        token1.transfer(pairadd,value1);

        pair.mint(address(this));
        uint256 balance0 = token0.balanceOf(address(this));
        uint256 balance1 = token1.balanceOf(address(this));
        uint256 pairBalance0 = token0.balanceOf(pairadd);
        uint256 pairBalance1 = token1.balanceOf(pairadd);
        uint256 liquidity = pair.balanceOf(address(this));
        uint256 totalSupply = pair.totalSupply();
        //根据公式计算返还代币数量
        uint256 return0 = (liquidity*pairBalance0) / totalSupply;
        uint256 return1 = (liquidity*pairBalance1) / totalSupply;

        pair.transfer(pairadd,liquidity);
        pair.burn(address(this));
        //检查token0，token1返还数量是否正确
        uint256 afterBalance0 = token0.balanceOf(address(this));
        uint256 afterBalance1 = token1.balanceOf(address(this));
        uint256 balance0Sub = afterBalance0-balance0;
        uint256 balance1Sub = afterBalance1-balance1;
        require(balance0Sub==return0,unicode"token0代币返回数量有误");
        require(balance1Sub==return1,unicode"token1代币返回数量有误");

        //检查LPtoken是否销毁
        require(pair.balanceOf(address(this))==0,unicode"当前账户LPToken没有全部销毁");
        // 检查储备量更新
        (uint112 reserve0, uint112 reserve1,) = pair.getReserves();
        require(reserve0==token0.balanceOf(pairadd),"no reserve0");
        require(reserve1==token1.balanceOf(pairadd),"no reserve1");
    }
    //测试交易函数
    function swapTest()public{
        //给Pair合约转账，增加余额
        uint256 value0 = 1000*10**18;
        uint256 value1 = 1000*10**18;
        token0.transfer(pairadd,value0);
        token1.transfer(pairadd,value1);
        //添加流动性
        pair.mint(owner);
        //用来交易的代币
        token0.transfer(pairadd,50*10**18);
        //要输出的代币
        uint256 amount1Out=1*10**18;
        uint256 amount0Out=0;
        //交易前账户上token1的代币数量
        uint256 balanceBefore=token1.balanceOf(owner);
        //接收地址
        address to = owner;
        (uint112 _reserve0, uint112 _reserve1,) = pair.getReserves();
        //测试两种代币输出都是0是否正确拒绝
        require(amount0Out > 0 || amount1Out > 0, 'UniswapV2: INSUFFICIENT_OUTPUT_AMOUNT');
        //测试输出量大于储备量时是否正确拒绝
        require(amount0Out < _reserve0 && amount1Out < _reserve1, 'UniswapV2: INSUFFICIENT_LIQUIDITY');
        //测试接收地址是代币合约本身是否正确拒绝
        require(to != address(token0) && to != address(token1), 'UniswapV2: INVALID_TO');
        //执行交易函数（空数据避免触发闪电贷回调）
        pair.swap(0, amount1Out, owner, new bytes(0));
        //交易后账户上token1的代币数量
        uint256 balanceAfter=token1.balanceOf(owner);
        //验证交易前后账户上增加的token1代币数量，是否等于要输出的代币数量
        require(balanceAfter-balanceBefore==amount1Out,unicode"账户上增加的token1代币数量与预期数量不符");
        // 检查储备量更新
        (uint112 reserve0, uint112 reserve1,) = pair.getReserves();
        require(reserve0==token0.balanceOf(pairadd),"no reserve0");
        require(reserve1==token1.balanceOf(pairadd),"no reserve1");
    }
    
    //测试UniswapV2Factory合约
    //测试allPairsLength函数
    function allPairsLengthTest() public {
        require(factory.allPairsLength()==1,"no allPairsLength");
    }
    //测试creat函数
    function createPair() public {
        //测试两个 token 地址相同是否正确拒绝
        require(token0address != token1address, 'UniswapV2: IDENTICAL_ADDRESSES');
        //测试 token 地址为零地址是否正确拒绝
        require(token0address != address(0), 'UniswapV2: ZERO_ADDRESS');
        //测试双向记录是否正常工作
        require(factory.getPair(token0address,token1address)==pairadd,unicode"双向记录失败");
        require(factory.getPair(token1address,token0address)==pairadd,unicode"双向记录失败");
        //测试新配对合约地址是否正确添加到数组中
        require(factory.allPairs(0)==pairadd,unicode"新配对合约地址未正确添加到数组中");
        //测试该交易对已存在是否正确拒绝
        bool success=true;
        if(factory.getPair(token0address,token1address) == address(0)){
            success=true;
        }else {
            success=false;
        }
        require(!success, unicode'创建相同交易对应该失败');
    }
    //token测试
    function tokenTest() public {
        
        require(token0.balanceOf(address(this)) == initialSupply,"no token0 balanceOf");
        require(token1.balanceOf(address(this)) == initialSupply,"no token1 balanceOf");
    }

    //测试FeeTo地址
    function FeeToTest()public{
        factory.setFeeTo(add1);
        require(factory.feeTo()  == add1,unicode"你不是FeeToSetter，没有权限修改FeeTo");
    }
    //测试FeeToSetter地址
    function FeeToSetterTest()public{
        factory.setFeeToSetter(add1);
        require(factory.feeToSetter()  == add1,unicode"你不是FeeToSetter，没有权限修改FeeToSetter");
    }



}

