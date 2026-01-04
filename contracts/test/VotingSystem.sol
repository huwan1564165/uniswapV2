// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// 练习4：动态数组和映射结合
contract VotingSystem {
    
    string[] public candidates;
    mapping(string => uint) public votes;
    
    // 添加候选人
    function addCandidate(string memory _name) public {
        candidates.push(_name);
    }
    
    // 投票
    function vote(uint _candidateIndex) public {
        require(_candidateIndex < candidates.length, "Invalid candidate");
        votes[candidates[_candidateIndex]]++;
    }
    
    // 获取所有候选人票数
    function getAllVotes() public view returns (string[] memory, uint[] memory) {
        string[] memory names = new string[](candidates.length);
        uint[] memory voteCounts = new uint[](candidates.length);
        
        for(uint i = 0; i < candidates.length; i++) {
            names[i] = candidates[i];
            voteCounts[i] = votes[candidates[i]];
        }
        
        return (names, voteCounts);
    }
}