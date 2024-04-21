// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MyOracle.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract APROracle is MyOracle {
    AggregatorV3Interface internal rateFeed;

    constructor(address _rateFeed) {
        rateFeed = AggregatorV3Interface(_rateFeed);
    }

    function getLatestInterestRate() public view returns (int) {
        (
            /*uint80 roundID*/,
            int rate,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = rateFeed.latestRoundData();
        return rate;
    }
}