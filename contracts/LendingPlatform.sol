// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./PrincipalCoin.sol";
import "./APROracle.sol";
import "./Pausable.sol";

contract LendingPlatform is Initializable, OwnableUpgradeable, Pausable, UUPSUpgradeable {
    PrincipalCoin private token; 
    APROracle private rateOracle; 

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address owner, address _token, address _oracle) initializer public {
        __Ownable_init(owner);
        token = PrincipalCoin(_token);
        rateOracle = APROracle(_oracle);
    }

    struct DepositTx {
        uint256 amount;
        uint256 timestamp;
    }

    // Stores user balances
    mapping(address => DepositTx[]) private balances;

    uint256 public totalSupply; // Total PRC deposited into the platform
    uint256 public totalBorrowed; // Total PRC currently loaned out

    struct Loan {
        uint256 principal;
        int256 interestRate; // This could be a percentage (e.g., 5 for 5%)
        int256 interestAmount;
        uint256 startTime;
        uint256 endTime;
        bool repaid;
    }

    mapping(address => Loan[]) public loans;


    // Event declarations
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event Borrow(address indexed user, uint256 amount);
    event Repay(address indexed user, uint256 amount);

    function utilizationRate() public view returns (uint256) {
        if (totalSupply == 0) return 0.0; // Prevent division by zero
        return (totalBorrowed * 100.0) / totalSupply; // Multiply by 100 for percentage
    }

    function oracleInterestRate() public view returns (int256) {
        return rateOracle.getLatestInterestRate();
    }

    function depositBalance(address user) public view returns (int256) {
        int256 balance = 0;
        for (uint256 i = 0; i < balances[user].length; i++) {
            balance += int256(balances[user][i].amount);
            balance += calculateInterest(balances[user][i].amount, oracleInterestRate()/2, uint256(block.timestamp - balances[user][i].timestamp) / (60 * 60 * 24));
        }
        return balance;
    }

    function loanBalance(address user) public view returns (uint256) {
        uint256 totalLoans = 0;
        for (uint256 i = 0; i < loans[user].length; i++) {
            totalLoans += (loans[user][i].principal + uint256(loans[user][i].interestAmount)) * (loans[user][i].repaid ? 0 : 1);
        }
        return totalLoans;
    }

    function calculateInterestRate() public view returns (int256) {
        uint256 utilization = utilizationRate();
        int256 baseInterestRate = oracleInterestRate();
        if (utilization < 50) {
            return baseInterestRate; // Low demand, keep interest low
        } else if (utilization < 80) {
            return baseInterestRate + 200000; // Increasing demand, raise interest slightly
        } else {
            return baseInterestRate + 500000; // High demand, significantly raise interest
        }
    }

    function deposit(uint256 _amount) whenNotPaused public {
        require(_amount > 0, "Deposit amount must be greater than 0");

        uint256 allowance = token.allowance(msg.sender, address(this));
        require(allowance >= _amount, "Check the token allowance");
        
        token.transferFrom(msg.sender, address(this), _amount);

        balances[msg.sender].push(DepositTx({
            amount: _amount,
            timestamp: block.timestamp
        }));
        totalSupply += _amount;

        emit Deposit(msg.sender, _amount);
    }

    function withdraw(uint256 _amount) whenNotPaused public {
        require(depositBalance(msg.sender) >= int(_amount), "Insufficient balance");
        require(loans[msg.sender].length == 0, "Cannot withdraw while loan is active");

        int256 amm = int256(_amount);
        for (uint256 i = 0; i < balances[msg.sender].length; i++) {
            if (balances[msg.sender][i].amount >= _amount) {
                balances[msg.sender][i].amount -= _amount;
                amm += calculateInterest(_amount, oracleInterestRate()/2, uint256(block.timestamp - balances[msg.sender][i].timestamp) / (60 * 60 * 24));
                break;
            } else {
                amm -= int256(balances[msg.sender][i].amount);
                amm += calculateInterest(balances[msg.sender][i].amount, oracleInterestRate()/2, uint256(block.timestamp - balances[msg.sender][i].timestamp) / (60 * 60 * 24));
                balances[msg.sender][i].amount = 0;
            }
        }

        _amount = uint256(amm);
        totalSupply -= _amount;
        token.transfer(msg.sender, _amount);

        emit Withdraw(msg.sender, _amount);
    }

    function calculateInterest(uint256 _principal, int256 _interestRate, uint256 _timeInDays) public pure returns (int256) {
        return (int256(_principal) * _interestRate * int256(_timeInDays)) / 3650000000;
    }

    function borrow(uint256 _amount, uint256 _days) whenNotPaused public {
        require(totalSupply - totalBorrowed >= _amount, "Insufficient funds in platform");
        require(_days > 0, "Borrowing duration must be at least 1 day");

        int256 interestRate = calculateInterestRate();
        int256 interestAmount = calculateInterest(_amount, interestRate, _days);

        loans[msg.sender].push(Loan({
            principal: _amount,
            interestRate: interestRate,
            interestAmount: interestAmount,
            startTime: block.timestamp,
            endTime: block.timestamp + (_days * 1 days),
            repaid: false
        }));

        token.transfer(msg.sender, _amount);

        totalBorrowed += _amount;
        emit Borrow(msg.sender, _amount);
    }

    function repay(uint256 _amount) public {
        int256 _loanIndex = -1;
        for (uint256 i = 0; i < loans[msg.sender].length; i++) {
            if (!loans[msg.sender][i].repaid) {
                _loanIndex = int256(i);
                break;
            }
        }
        require(_loanIndex != -1, "No loans to repay");
        Loan storage loan = loans[msg.sender][uint256(_loanIndex)];
        require(!loan.repaid, "Loan already repaid");
        int256 penalties = 0;
        if (block.timestamp > loan.endTime) {
            penalties = calculateInterest(uint256(loan.principal), loan.interestRate, uint256(block.timestamp - loan.endTime) / (60 * 60 * 24));
        }
        uint256 totalRepaymentAmount = loan.principal + uint256(loan.interestAmount + penalties);

        if (_amount < totalRepaymentAmount) {
            // Handle partial repayment logic here
            // pay as much of the principal as possible
            // then pay as much of the interest as possible
            // then pay as much of the penalties as possible

            // update the loan details
            uint256 payment = _amount;
            if (payment >= loan.principal) {
                payment -= loan.principal;
                totalBorrowed -= loan.principal;
                loan.principal = 0;
            } else {
                loan.principal -= _amount;
                totalBorrowed -= _amount;
                payment = 0;
            }

            if (loan.interestAmount > 0 && payment < uint256(loan.interestAmount)) {
                loan.interestAmount -= int256(payment);
                payment = 0;
            }
            token.transferFrom(msg.sender, address(this), _amount); // User repays the loan with tokens
            loans[msg.sender][uint256(_loanIndex)] = loan;
            emit Repay(msg.sender, _amount);

        } else {
            totalBorrowed -= loan.principal;
        
            // Handle exact payment logic here
            // mark the loan as repaid
            loan.repaid = true;
            token.transferFrom(msg.sender, address(this), totalRepaymentAmount); // User repays the loan with tokens
            loans[msg.sender][uint256(_loanIndex)] = loan;
            emit Repay(msg.sender, totalRepaymentAmount);
        }
    }

    // Allow the owner to withdraw platform profits
    function ownerWithdraw(uint256 _amount) public onlyOwner {
        require(address(this).balance >= _amount, "Insufficient funds in platform");
        payable(owner()).transfer(_amount);
    }

    function pause() public virtual override whenNotPaused onlyOwner {
        paused = true;
        emit Paused();
    }

    function unpause() public virtual override whenPaused onlyOwner {
        paused = false;
        emit Unpaused();
    }

     function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {}
}
