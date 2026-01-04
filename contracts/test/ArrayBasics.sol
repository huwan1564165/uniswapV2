// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// 练习1：声明和基本操作
contract ArrayBasics {
    
    uint[] public numbers;
    
    // 添加数字到数组
    function addNumber(uint _number) public {
        numbers.push(_number);
    }
    
    // 获取数组长度
    function getLength() public view returns (uint) {
        return numbers.length;
    }
    
    // 获取指定索引的元素
    function getNumber(uint _index) public view returns (uint) {
        require(_index < numbers.length, "Index out of bounds");
        return numbers[_index];
    }
    
    // 删除最后一个元素
    function removeLast() public {
        numbers.pop();
    }
}