// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// 练习2：结构体与数组结合
contract StudentGrades {
    
    struct Student {
        string name;
        uint score;
    }
    
    Student[] public students;
    
    // 添加学生
    function addStudent(string memory _name, uint _score) public {
        students.push(Student(_name, _score));
    }
    
    // 计算平均分
    function calculateAverage() public view returns (uint) {
        require(students.length > 0, "No students");
        uint total = 0;
        for(uint i = 0; i < students.length; i++) {
            //加总和
            total += students[i].score;
        }
        return total / students.length;
    }
    
    // 查找最高分
    function findHighest() public view returns (string memory, uint) {
        require(students.length > 0, "No students");
        uint highestIndex = 0;
        //擂台法
        for(uint i = 1; i < students.length; i++) {
            if(students[i].score > students[highestIndex].score) {
                highestIndex = i;
            }
        }
        return (students[highestIndex].name, students[highestIndex].score);
    }
}