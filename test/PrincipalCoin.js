
const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("PrincipalCoin", async () => {
    let principalCoin, owner, addr1, addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        const PrincipalCoin = await ethers.getContractFactory("PrincipalCoin");
        principalCoin = await upgrades.deployProxy(PrincipalCoin, [owner.address], { initializer: 'initialize' });
        await principalCoin.waitForDeployment();
    });

    describe("Initialization", async () => {
        it("Should initialize the contract with the correct values", async function() {
            expect(await principalCoin.name()).to.equal("PrincipalCoin");
            expect(await principalCoin.symbol()).to.equal("PRC");
            expect(await principalCoin.decimals()).to.equal(18);
    
            expect(await principalCoin.totalSupply()).to.equal(ethers.parseEther("10000"));
            expect(await principalCoin.owner()).to.equal(owner.address);
        });
    });

    describe("Transfers", async() => {
        it("Should transfer coins between accounts", async function() {
            await principalCoin.transfer(addr1.address, 100);
            expect(await principalCoin.balanceOf(addr1.address)).to.equal(100);
    
            await principalCoin.connect(addr1).transfer(addr2.address, 50);
            expect(await principalCoin.balanceOf(addr2.address)).to.equal(50);
        });
    
        it("Should fail if sender doesn't have enough coins", async function() {
            await expect(principalCoin.connect(addr1).transfer(addr2.address, 1000)).to.be.revertedWithCustomError(principalCoin, `ERC20InsufficientBalance`);
        });
    
        it("Should update balances after transfer", async function() {
            await principalCoin.transfer(addr1.address, ethers.parseEther("1000"));
            await principalCoin.connect(addr1).transfer(addr2.address, ethers.parseEther("100"));
    
            expect(await principalCoin.balanceOf(addr1.address)).to.equal(ethers.parseEther("900"));
            expect(await principalCoin.balanceOf(addr2.address)).to.equal(ethers.parseEther("100"));
        });
    
        it("Should update balances after transferFrom", async function() {
            await principalCoin.transfer(addr1.address, ethers.parseEther("1000"));
            await principalCoin.approve(addr2.address, ethers.parseEther("100"));
            await principalCoin.connect(addr2).transferFrom(owner.address, addr1.address, ethers.parseEther("100"));
    
            expect(await principalCoin.balanceOf(owner.address)).to.equal(ethers.parseEther("8900"));
            expect(await principalCoin.balanceOf(addr1.address)).to.equal(ethers.parseEther("1100"));
        });

        it("Should fail if sender doesn't have enough allowance", async function() {
            await principalCoin.transfer(addr1.address, ethers.parseEther("1000"));
            await principalCoin.approve(addr2.address, ethers.parseEther("100"));
            await expect(principalCoin.connect(addr2).transferFrom(owner.address, addr1.address, ethers.parseEther("1000"))).to.be.revertedWithCustomError(principalCoin, `ERC20InsufficientAllowance`);
        });
    }); 

    describe("Proxy Pattern Upgradability", async () => {
        it("should upgrade the contract with owner", async function() {
            const PrincipalCoinV2 = await ethers.getContractFactory("PrincipalCoin");
            upgradedContract = await upgrades.upgradeProxy(principalCoin.target, PrincipalCoinV2);
            await expect(upgradedContract).to.not.be.reverted;
        });
    
        it("should fail to upgrade the contract with non-owner", async function() {
            const PrincipalCoinV2 = await ethers.getContractFactory("PrincipalCoin", addr1);
            await expect(
              upgrades.upgradeProxy(principalCoin.target, PrincipalCoinV2)
            ).to.be.revertedWithCustomError(principalCoin, "OwnableUnauthorizedAccount");
        });
    });

    describe("Pausability", async () => {
        it("Should be pausable only by the owner", async function() {
            await expect(principalCoin.connect(addr1).pause()).to.be.revertedWithCustomError(principalCoin, "OwnableUnauthorizedAccount");
        });
    
        it("Should be unpausable only by the owner", async function() {
            await expect(principalCoin.connect(addr1).unpause()).to.be.revertedWithCustomError(principalCoin, "OwnableUnauthorizedAccount");
        });

        it("Should not be unpausable if it is not paused", async function() {
            await expect(principalCoin.unpause()).to.be.revertedWithCustomError(principalCoin, "ExpectedPause()");
        });
    
        it("Should be paused when the owner calls pause", async function() {
            await principalCoin.pause();
            expect(await principalCoin.paused()).to.equal(true);
        });
    
        it("Should be unpaused when the owner calls unpause", async function() {
            await principalCoin.pause();
            await principalCoin.unpause();
            expect(await principalCoin.paused()).to.equal(false);
        });
    });

});