// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./MyOracle.sol";

contract MockOracle is MyOracle {
    constructor() { }

    function getLatestInterestRate() public view returns (int) {
        return 365; 
    }
}