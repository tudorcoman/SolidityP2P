// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface MyOracle {
    function getLatestInterestRate() external view returns (int);
}