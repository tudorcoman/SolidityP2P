
const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("LendingPlatform", async () => {
    let lendingPlatform, owner, addr1, addr2, principalCoin, mockOracle;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        const MockOracle = await ethers.getContractFactory("MockOracle");
        mockOracle = await MockOracle.deploy();
        await mockOracle.waitForDeployment();

        const PrincipalCoin = await ethers.getContractFactory("PrincipalCoin");
        principalCoin = await upgrades.deployProxy(PrincipalCoin, [owner.address], { initializer: 'initialize' });
        await principalCoin.waitForDeployment();

        const LendingPlatform = await ethers.getContractFactory("LendingPlatform");
        lendingPlatform = await upgrades.deployProxy(LendingPlatform, [owner.address, principalCoin.target, mockOracle.target], { initializer: 'initialize' });
        await lendingPlatform.waitForDeployment();

        // add some coins to addr1
        await principalCoin.transfer(addr1.address, ethers.parseEther("1000"));
        
        // add some coins to addr2
        await principalCoin.transfer(addr2.address, ethers.parseEther("1000"));

        // deposit coins into lendingPlatform by owner and addr1
        await principalCoin.approve(lendingPlatform.target, ethers.parseEther("10000"));
        await lendingPlatform.deposit(ethers.parseEther("100"));
        await principalCoin.connect(addr1).approve(lendingPlatform.target, ethers.parseEther("10000"));
        await lendingPlatform.connect(addr1).deposit(ethers.parseEther("100"));
    });

    describe("Initialization", async () => {
        it("Should initialize the contract with the correct values", async function() {
            expect(await lendingPlatform.owner()).to.equal(owner.address);
            expect(await lendingPlatform.utilizationRate()).to.equal(0);
            expect(await lendingPlatform.oracleInterestRate()).to.equal(365); // 1% daily interest
        });

        it("Should have the tokens deposited", async function() {
            expect(await principalCoin.balanceOf(lendingPlatform.target)).to.equal(ethers.parseEther("200"));
        });
    });

    describe("Deposits", async () => {
        it("Should deposit coins into the contract", async function() {
            await principalCoin.approve(lendingPlatform.target, ethers.parseEther("100"));
            await lendingPlatform.deposit(ethers.parseEther("100"));
            expect(await lendingPlatform.depositBalance(owner.address)).to.equal(ethers.parseEther("200"));
            expect(await principalCoin.balanceOf(owner.address)).to.equal(ethers.parseEther("7800"));
        });

        it("Should fail if the user doesn't have enough coins", async function() {
            await expect(principalCoin.connect(addr1).transfer(lendingPlatform.target, ethers.parseEther("100000"))).to.be.revertedWithCustomError(principalCoin, `ERC20InsufficientBalance`);
        });

        it("Should update balances after deposit", async function() {
            expect(await principalCoin.balanceOf(addr1.address)).to.equal(ethers.parseEther("900"));
            expect(await lendingPlatform.connect(addr1).depositBalance(addr1.address)).to.equal(ethers.parseEther("100"));
            await lendingPlatform.connect(addr1).deposit(ethers.parseEther("100"));
            expect(await lendingPlatform.connect(addr1).depositBalance(addr1.address)).to.equal(ethers.parseEther("200"));
            expect(await principalCoin.balanceOf(addr1.address)).to.equal(ethers.parseEther("800"));
        });

        it("Should fail if the contract is paused", async function() {
            await lendingPlatform.pause();
            await expect(lendingPlatform.deposit(ethers.parseEther("100"))).to.be.revertedWith("Pausable: Contract paused");
        });
    });

    describe("Withdrawals", async () => {
        it("Should withdraw coins from the contract", async function() {
            await lendingPlatform.withdraw(ethers.parseEther("50"));
            expect(await lendingPlatform.depositBalance(owner.address)).to.equal(ethers.parseEther("50"));
        });

        it("Should fail if the user doesn't have enough coins", async function() {
            await expect(lendingPlatform.withdraw(ethers.parseEther("100000"))).to.be.revertedWith("Insufficient balance");
        });

        it("Should update balances after withdrawal", async function() {
            expect(await principalCoin.balanceOf(addr1.address)).to.equal(ethers.parseEther("900"));
            expect(await lendingPlatform.connect(addr1).depositBalance(addr1.address)).to.equal(ethers.parseEther("100"));
            await lendingPlatform.connect(addr1).withdraw(ethers.parseEther("50"));
            expect(await lendingPlatform.connect(addr1).depositBalance(addr1.address)).to.equal(ethers.parseEther("50"));
        });

        it("Should fail if the contract is paused", async function() {
            await lendingPlatform.pause();
            await expect(lendingPlatform.withdraw(ethers.parseEther("50"))).to.be.revertedWith("Pausable: Contract paused");
        });
    });

    describe("Loans", async() => {
        it("Should update utilization rate and interest after loans", async function() {
            expect(await lendingPlatform.utilizationRate()).to.equal(BigInt("0"));
            
            const baseInterestRate = await lendingPlatform.calculateInterestRate();

            // get a loan
            await lendingPlatform.connect(addr1).borrow(ethers.parseEther("50"), 15);
            expect(await lendingPlatform.utilizationRate()).to.equal(25);

            // get another loan
            await lendingPlatform.connect(addr1).borrow(ethers.parseEther("50"), 15);
            expect(await lendingPlatform.utilizationRate()).to.equal(50);

            expect(await lendingPlatform.calculateInterestRate()).to.equal(baseInterestRate + BigInt(200000));

            // get another loan
            await lendingPlatform.connect(addr1).borrow(ethers.parseEther("70"), 15);
            expect(await lendingPlatform.utilizationRate()).to.equal(85);

            expect(await lendingPlatform.calculateInterestRate()).to.equal(baseInterestRate + BigInt(500000));

        });

        it("A user should not be able to borrow more than the deposit balance", async function() {
            await expect(lendingPlatform.connect(addr1).borrow(ethers.parseEther("500"), 15)).to.be.revertedWith("Insufficient funds in platform");
        });

        it("Should fail if the contract is paused", async function() {
            await lendingPlatform.pause();
            await expect(lendingPlatform.connect(addr1).borrow(ethers.parseEther("50"), 15)).to.be.revertedWith("Pausable: Contract paused");
        });

        it("Should not penalize the user if the loan is paid back before the due date", async function() {
            expect(await principalCoin.balanceOf(addr1.address)).to.equal(ethers.parseEther("900"));
            await lendingPlatform.connect(addr1).borrow(ethers.parseEther("100"), 15);
            expect(await lendingPlatform.connect(addr1).loanBalance(addr1.address)).to.equal(ethers.parseEther("100.00015"));
            expect(await principalCoin.balanceOf(addr1.address)).to.equal(ethers.parseEther("1000"));


            await ethers.provider.send("evm_increaseTime", [10 * 86400]); // increase time by 10 days
            await ethers.provider.send("evm_mine");

            await lendingPlatform.connect(addr1).repay(ethers.parseEther("100.00015"));
            expect(await lendingPlatform.connect(addr1).loanBalance(addr1.address)).to.equal(ethers.parseEther("0"));
        });

        it("Should penalize the user if the loan is paid back after the due date", async function() {
            expect(await principalCoin.balanceOf(addr1.address)).to.equal(ethers.parseEther("900"));
            await lendingPlatform.connect(addr1).borrow(ethers.parseEther("50"), 10);
            expect(await principalCoin.balanceOf(addr1.address)).to.equal(ethers.parseEther("950"));
            await ethers.provider.send("evm_increaseTime", [50 * 86400]); // increase time by 50 days
            await ethers.provider.send("evm_mine");

            await lendingPlatform.connect(addr1).repay(ethers.parseEther("30"));
            expect(await principalCoin.balanceOf(addr1.address)).to.equal(ethers.parseEther("920"));
            expect(await lendingPlatform.loanBalance(addr1.address)).to.greaterThan(ethers.parseEther("20"));
            await lendingPlatform.connect(addr1).repay(ethers.parseEther("21"));
            expect(await principalCoin.balanceOf(addr1.address)).to.lessThan(ethers.parseEther("900"));
        });
    });

    describe("Proxy Pattern Upgradability", async () => {
        it("should upgrade the contract with owner", async function() {
            const LendingPlatformV2 = await ethers.getContractFactory("LendingPlatform");
            upgradedContract = await upgrades.upgradeProxy(lendingPlatform.target, LendingPlatformV2);
            await expect(upgradedContract).to.not.be.reverted;
        });
    
        it("should fail to upgrade the contract with non-owner", async function() {
            const LendingPlatformV2 = await ethers.getContractFactory("LendingPlatform", addr1);
            await expect(
              upgrades.upgradeProxy(lendingPlatform.target, LendingPlatformV2)
            ).to.be.revertedWithCustomError(lendingPlatform, "OwnableUnauthorizedAccount");
        });
    });

    describe("Pausability", async () => {
        it("Should be pausable only by the owner", async function() {
            await expect(lendingPlatform.connect(addr1).pause()).to.be.revertedWithCustomError(lendingPlatform, "OwnableUnauthorizedAccount");
        });
    
        it("Should be unpausable only by the owner", async function() {
            lendingPlatform.pause();
            await expect(lendingPlatform.connect(addr1).unpause()).to.be.revertedWithCustomError(lendingPlatform, "OwnableUnauthorizedAccount");
        });

        it("Should not be unpausable if it is not paused", async function() {
            await expect(lendingPlatform.unpause()).to.be.revertedWith("Pausable: Contract not paused");
        });
    
        it("Should be paused when the owner calls pause", async function() {
            await lendingPlatform.pause();
            expect(await lendingPlatform.paused()).to.equal(true);
        });
    
        it("Should be unpaused when the owner calls unpause", async function() {
            await lendingPlatform.pause();
            await lendingPlatform.unpause();
            expect(await lendingPlatform.paused()).to.equal(false);
        });
    });

});