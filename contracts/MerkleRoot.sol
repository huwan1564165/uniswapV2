// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './MyTokens.sol';
contract MerkleRoot {
    address owner;
    MyTokens myTokens;
    uint256 totalSupply;
    uint256 ownerBalance;
    bytes32 public root;
    mapping(address=>uint) public balances; 
    constructor(){
        owner = msg.sender;
        myTokens=new MyTokens("MyTokens","MTK",10000*10**18);
        totalSupply=myTokens.totalSupply();
        ownerBalance=myTokens.balanceOf(address(this));
    }
    function transferAll(address[] memory addrs,uint256 value)public{
        uint len = addrs.length;
        uint256 values=value*len;
        uint256 _ownerBalance=ownerBalance;
        require(values<ownerBalance,unicode"你的账户余额不足");
        for(uint i=0;i<len;i++){
            myTokens.transfer(addrs[i],value);
        }
    }

      function getUserToken(address[] memory addrs)public view returns(uint256[] memory value){
        uint len = addrs.length;
        value = new uint[](len);
        for(uint i=0;i<len;i++){
            value[i]=myTokens.balanceOf(addrs[i]);
        }
    }
    
    //为每个地址设置 mapping 余额
    function transferAll1(address[] memory addrs,uint256 value)public{
        uint len = addrs.length;
        uint256 values=value*len;
        uint256 _ownerBalance=ownerBalance;
        require(values<ownerBalance,unicode"你的账户余额不足");
        for(uint i=0;i<len;i++){
           balances[addrs[i]] = value;
        }
    }
    function getUserToken1(address[] memory addrs)public view returns(uint256[] memory value){
        uint len = addrs.length;
        value = new uint[](len);
        for(uint i=0;i<len;i++){
            value[i]=balances[addrs[i]];
        }
    }

    //用户领取时转账并清零
    function getUserToken2()public  {
        uint256 value=balances[msg.sender];
        balances[msg.sender]=0;
        myTokens.transfer(msg.sender,value);
        
    }

 



}