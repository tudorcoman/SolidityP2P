// In Service.js

import aprOracleAbi from "../Contracts/APROracleABI.json";
import lendingPlatformAbi from "../Contracts/LendingPlatformABI.json";
import principalCoinAbi from "../Contracts/PrincipalCoinABI.json";

import Web3 from 'web3';

import testAbi from "../Contracts/TestABI.json";



const { ethers } = require("ethers");

// const Web3 = require('web3');

const web3 = new Web3(window.ethereum);

const oracleContractAddress = "0xd10b7fa0ecdc37abd6e4e8100bbf96c2e3073346"
const principalCoinContractAddress = "0x0a23f12d5199ea81d126136d67f5df67f6a28c81"
const lendingPlatformContractAddress = "0x2812431621b5885370c07642B86b728449F66F3D"

const testContractAddress = "0x358AA13c52544ECCEF6B0ADD0f801012ADAD5eE3"

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

const getTestContract = (provider) => {
    return new ethers.Contract(testContractAddress, testAbi, provider);
}

export const deposit = async (provider, amount) => {
    const lendingPlatformContract = getLendingPlatformContract(provider);
    // const lendingPlatformContract = getTestContract(provider);

    const principalCoinContract = getPrincipalCoinContract(provider);

    try{
        const digits = await principalCoinContract.decimals();
        const convertedAmount = BigInt(amount);
        console.log("CONVERTED AMOUNT:", convertedAmount);
        const tx1 = await principalCoinContract.approve(lendingPlatformContractAddress, convertedAmount * BigInt(10) ** digits);
        await tx1.wait();
        const tx2 = await lendingPlatformContract.deposit(convertedAmount);
        await tx2.wait();
        return tx2;
    }
    catch(err){
        console.log(err);
    }
}

export const withdraw = async (provider, amount) => {
    const lendingPlatformContract = getLendingPlatformContract(provider);
    try{
        const convertedAmount = BigInt(amount);
        console.log("CONVERTED AMOUNT:", convertedAmount);
        const tx = await lendingPlatformContract.withdraw(convertedAmount);
        await tx.wait();
        return tx;
    }
    catch(err){
        console.log(err);
    }
}

export const borrow = async (provider, amount, days) => {
    const lendingPlatformContract = getLendingPlatformContract(provider);
    // const lendingPlatformContract = getTestContract(provider);
    try{
        const convertedAmount = BigInt(amount);
        console.log("CONVERTED AMOUNT:", convertedAmount);
        const tx = await lendingPlatformContract.borrow(convertedAmount, days);
        await tx.wait();
        return tx;
    }
    catch(err){
        console.log(err);
    }
}

export const repay = async (provider, amount) => {
    const lendingPlatformContract = getLendingPlatformContract(provider);
    const principalCoinContract = getPrincipalCoinContract(provider);
    try{
        const digits = await principalCoinContract.decimals();
        const convertedAmount = BigInt(amount);
        console.log("CONVERTED AMOUNT:", convertedAmount * BigInt(1000));
        const tx1 = await principalCoinContract.approve(lendingPlatformContractAddress, convertedAmount * BigInt(10) ** digits);
        await tx1.wait();
        const tx = await lendingPlatformContract.repay(convertedAmount * BigInt(1000));
        await tx.wait();
        return tx;
    }
    catch(err){
        console.log(err);
    }
}

export const getDepositBalance = async (provider, user) => {
    
    const lendingPlatformContract = getLendingPlatformContract(provider);
    try{
        console.log(provider.address);
        const balance = await lendingPlatformContract.depositBalance(user);
        console.log(balance);
        return balance;
    }
    catch(err){
        console.log(err);
    }

    // const testContract = getTestContract(signer);
    // console.log("SIGNER:", signer);
    // const address = await signer.getAddress();
    // console.log("ADRESAAA:", address);

    // try{
    //     const balance = await testContract.depositBalance(address);
    //     console.log(balance);
    //     return balance;
    // }
    // catch(err){
    //     console.log(err);
    // }

}


// export const getDepositBalance = async (account) => {
//     const lendingPlatformContract = new web3.eth.Contract(lendingPlatformAbi, lendingPlatformContractAddress);

//     try {
//         const balance = await lendingPlatformContract.methods.depositBalance().call({ from: account });
//         //console.log("Balance", balance);
//         return balance;
//     } catch (err) {
//         console.error('Error getting deposit balance:', err);
//     }
// };

export const getLoanBalance = async (provider, user) => {
    const lendingPlatformContract = getLendingPlatformContract(provider);
    try{
        const balance = await lendingPlatformContract.loanBalance(user);
        console.log(balance);
        return balance;
    }
    catch(err){
        console.log(err);
    }
}
