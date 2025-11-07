// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { Counter } from "../contracts/examples/Counter.sol";

contract CounterTest is Test {
    Counter public counter;

    function setUp() public {
        counter = new Counter();
    }

    function test_Increment() public {
        counter.inc();
        assertEq(counter.x(), 1);
    }

    function test_IncrementBy() public {
        counter.incBy(5);
        assertEq(counter.x(), 5);
    }

    function test_IncrementByZeroReverts() public {
        vm.expectRevert("incBy: increment should be positive");
        counter.incBy(0);
    }
}

