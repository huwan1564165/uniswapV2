// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FeeTokens is ERC20 {
    uint256 public feePercentage; // 手续费百分比（如 5 表示 5%）
    address public feeReceiver;   // 手续费接收地址
    address public owner;


    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply,
        uint256 _feePercentage,
        address _feeReceiver
    ) ERC20(name_, symbol_) {
        _mint(msg.sender, initialSupply);
        feePercentage = _feePercentage;
        feeReceiver = _feeReceiver;
        owner = msg.sender;
    }

    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        address sender = _msgSender();
        
        // 检查发送者余额是否足够
        uint256 senderBalance = balanceOf(sender);
        require(senderBalance >= amount, "ERC20: transfer amount exceeds balance");
        
        // 计算手续费
        uint256 fee = amount * feePercentage / 100;
        // 防止下溢
        require(amount >= fee, "Amount too small for fee");
        uint256 transferAmount = amount - fee;

        // 收取手续费
        if (fee > 0) {
            _transfer(sender, feeReceiver, fee);
        }

        // 转账剩余金额
        _transfer(sender, to, transferAmount);

        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public virtual override returns (bool) {
        address spender = _msgSender();
        
        // 检查发送者余额是否足够
        uint256 fromBalance = balanceOf(from);
        require(fromBalance >= amount, "ERC20: transfer amount exceeds balance");
        
        // 检查并更新授权
        _spendAllowance(from, spender, amount);

        // 计算手续费
        uint256 fee = amount * feePercentage / 100;
        // 防止下溢
        require(amount >= fee, "Amount too small for fee");
        uint256 transferAmount = amount - fee;

        // 收取手续费
        if (fee > 0) {
            _transfer(from, feeReceiver, fee);
        }
        
        // 转账剩余金额
        _transfer(from, to, transferAmount);

        return true;
    }

    //设置手续费
    function setfeePercentage(uint256 newFeePercentage) external  {
        require(owner==msg.sender ,unicode"权限不足");
        require(newFeePercentage <= 10,unicode"超过手续费上限");
        feePercentage = newFeePercentage;
    }

    //设置收费地址
    function setfeeReceiver(address newFeeReceiver) external  {
        require(owner==msg.sender,unicode"权限不足");
        feeReceiver = newFeeReceiver;
    }





}