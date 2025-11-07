// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/// @custom:oz-upgrades-from contracts/CounterUUPS.sol:CounterUUPS
contract CounterUUPSV2 is OwnableUpgradeable, UUPSUpgradeable {
  uint public x;
  uint public y; // 新增状态变量

  event Increment(uint by);
  event YUpdated(uint newY);

  function initialize() public initializer {
    __Ownable_init(msg.sender);
    __UUPSUpgradeable_init();
    x = 1;
  }

  // UUPS upgrade authorization function - only allows contract owner to upgrade
  function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

  function inc() public {
    x++;
    emit Increment(1);
  }

  function incBy(uint by) public {
    require(by > 0, "incBy: increment should be positive");
    x += by;
    emit Increment(by);
  }

  // V2新增功能
  function setY(uint _y) public {
    y = _y;
    emit YUpdated(_y);
  }

  function getY() public view returns (uint) {
    return y;
  }
}

