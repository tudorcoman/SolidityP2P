// In Service.js
const { ethers } = require("ethers");

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
