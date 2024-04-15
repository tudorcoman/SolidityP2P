// In Service.js

import aprOracleAbi from "../Contracts/APROracleABI.json";
import lendingPlatformAbi from "../Contracts/LendingPlatformABI.json";
import principalCoinAbi from "../Contracts/PrincipalCoinABI.json";

const { ethers } = require("ethers");

const oracleContractAddress = "0xd9145CCE52D386f254917e481eB44e9943F39138"
const lendingPlatformContractAddress = "0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8"
const principalCoinContractAddress = "0xf8e81D47203A594245E36C48e151709F0C19fBe8"

export const connectWalletMetamask = async (accountChangedHandler) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    if (window.ethereum) {
        provider.send("eth_requestAccounts", []).then(async () => {
          provider.getSigner().then(async (account) => {
            accountChangedHandler(account);
          });
        }
        ).catch(async () => { console.log("err"); });
      } else {
        console.log("err");
      }
};

const getOracleContract = (provider) => {
    return new ethers.Contract(oracleContractAddress, aprOracleAbi, provider);
}

const getLendingPlatformContract = (provider) => {
    return new ethers.Contract(lendingPlatformContractAddress, lendingPlatformAbi, provider);
}

const getPrincipalCoinContract = (provider) => {
    return new ethers.Contract(principalCoinContractAddress, principalCoinAbi, provider);
}

export const deposit = async (provider, amount) => {
    const lendingPlatformContract = getLendingPlatformContract(provider);
    try{
        const depositAmount = ethers.parseEther(amount.toString());
        const tx = await lendingPlatformContract.deposit({value: depositAmount});
        await tx.wait();
        return tx;
    }
    catch(err){
        console.log(err);
    }
}

export const withdraw = async (provider, amount) => {
    const lendingPlatformContract = getLendingPlatformContract(provider);
    try{
        const tx = await lendingPlatformContract.withdraw(amount);
        await tx.wait();
        return tx;
    }
    catch(err){
        console.log(err);
    }
}

export const borrow = async (provider, amount, days) => {
    const lendingPlatformContract = getLendingPlatformContract(provider);
    try{
        const tx = await lendingPlatformContract.borrow(amount, days);
        await tx.wait();
        return tx;
    }
    catch(err){
        console.log(err);
    }
}

export const repay = async (provider, amount, loanIndex) => {
    const lendingPlatformContract = getLendingPlatformContract(provider);
    try{
        const tx = await lendingPlatformContract.repay(amount, loanIndex);
        await tx.wait();
        return tx;
    }
    catch(err){
        console.log(err);
    }
}

export const getDepositBalance = async (provider) => {
    const lendingPlatformContract = getLendingPlatformContract(provider);
    try{
        const balance = await lendingPlatformContract.depositBalance();
        console.log("balance: ", balance);
        return balance;
    }
    catch(err){
        console.log(err);
    }
}

export const getLoanBalance = async (provider) => {
    const lendingPlatformContract = getLendingPlatformContract(provider);
    try{
        const balance = await lendingPlatformContract.loanBalance();
        console.log(balance);
        return balance;
    }
    catch(err){
        console.log(err);
    }
}
