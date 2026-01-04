// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


// 练习3：状态管理与数组
contract TodoList {
    struct Todo {
        string task;
        bool completed;
    }
    
    Todo[] public todos;
    
    // 添加待办事项
    function addTodo(string memory _task) public {
        todos.push(Todo(_task, false));
    }
    
    // 标记完成
    function completeTodo(uint _index) public {
        require(_index < todos.length, "Invalid index");
        todos[_index].completed = true;
    }
    
    // 获取未完成的任务数量
    function getPendingCount() public view returns (uint) {
        uint count = 0;
        for(uint i = 0; i < todos.length; i++) {
            if(!todos[i].completed) {
                count++;
            }
        }
        return count;
    }
}