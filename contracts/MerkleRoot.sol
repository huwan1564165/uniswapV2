// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './MyTokens.sol';
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleRoot is MyTokens{
    address public owner;
    bytes32 public root;
    mapping(address=>bool) public getRecord; 
    constructor(bytes32 _root,
        string memory name,
        string memory symbol,
        uint256 initialSupply
    )MyTokens(name,symbol,initialSupply){
        owner = msg.sender;
        root = _root;
    }
    
    

    //用户领取时转账并清零
    function claim(uint256 amount,bytes32[] calldata proof)public  {
        bool isClaim=getRecord[msg.sender];
        require(verify(msg.sender,proof,amount),unicode'验证未通过');
        require(!isClaim,unicode'你已经领取过了，请勿重复领取');

        getRecord[msg.sender]=true;
        _mint(msg.sender,amount);
        
    }

    function verify(address user,bytes32[] calldata proof,uint256 amount)public view returns(bool) {
        bytes32 leaf = keccak256(abi.encodePacked (user,amount));
        bool isValid = MerkleProof.verify(proof,root,leaf);
        return isValid;
    }

    function setRoot(bytes32 newRoot)public{
        require(msg.sender==owner,unicode'你没有权限修改');
        root=newRoot;
    }

 



}