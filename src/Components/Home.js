import React, { useEffect } from "react";

import { useWallet } from "../Blockchain/Context";

import { connectWalletMetamask, getDepositBalance, getLoanBalance, deposit } from "../Blockchain/Service";

import '../Styles/Home.css';

import { Button } from "reactstrap";

import { ReactTyped } from "react-typed";

import PayModal from "./PayModal";

const { ethers } = require("ethers");

const Home = () => {

    const [depositedAmount, setDepositedAmount] = React.useState(0);
    const [loanAmount, setLoanAmount] = React.useState(0);

    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const [isUserLoggedIn, setIsUserLoggedIn] = React.useState(false);

    const { wallet, initializeWallet } = useWallet();

    const provider = new ethers.BrowserProvider(window.ethereum);

    const accountChangedHandler = (address) => {
        initializeWallet(address);
    }
      

    const handleLogin = async () => {
        connectWalletMetamask(accountChangedHandler).then(() => {
            //setIsUserLoggedIn(true);
        });
    }

    const openModal = (e) => {
        e.preventDefault();
        setIsModalOpen(true);
    }

    const closeModal = (e) => {
        e.preventDefault();
        setIsModalOpen(false);
    }

    const handleLogout = (e) => {
        e.preventDefault();
        setIsUserLoggedIn(false);
        initializeWallet(null);
      }
      

    useEffect(() => {
        if (wallet) {
          setIsUserLoggedIn(true);
          console.log(provider);
          console.log(wallet.address);
          getDepositBalance(provider, wallet).then((balance) => {
            setDepositedAmount((Number(balance) / 100).toFixed(2));
          });
          getLoanBalance(provider, wallet).then((balance) => {
            setLoanAmount((Number(balance) / 100).toFixed(2));
          });                                                   
            
      
        }

        
      }, []);
      

    useEffect(() => {
        if (wallet) {
            console.log(wallet.address);
            setIsUserLoggedIn(true);
            getDepositBalance(provider, wallet).then((balance) => {
                setDepositedAmount((Number(balance) / 100).toFixed(2));
            }); 
            getLoanBalance(provider, wallet).then((balance) => {
                setLoanAmount((Number(balance) / 100).toFixed(2));
            });  
        }

    }, [wallet]);

    const handleUpdateLoanedAmount = async () => {
        const newLoanBalance = await getLoanBalance(provider, wallet);
        console.log("LOAN AMOUNT!!!: ", newLoanBalance);
        setLoanAmount((Number(newLoanBalance) / 100).toFixed(2));
    }

    return (

        <>
            {!isUserLoggedIn ? (
                <div className="login-container">
                    <ReactTyped
                        strings={["Welcome to Principal2Principal!"]}
                        typeSpeed={40}
                        backSpeed={50}
                        className="typed-text"
                        loop
                    />
                    <Button className="login-button" onClick={handleLogin}>
                        Log In
                    </Button>
                </div>
            ) : 
        
            (
            <>
                <div className="dashboard-container">
                    <div className="dashboard">
                        <h1 className="dashboard-title">Dashboard</h1>
                        <div className="dashboard-content">
                            <div className="dashboard-item">
                                <h2>Deposited Amount: {depositedAmount}</h2>
                            </div>
                            <div className="dashboard-item">
                                <h2>Loaned Amount: {loanAmount}</h2>
                            </div>
                            
                            <div>
                            <Button className="pay-button" onClick={openModal}>
                                Pay
                            </Button>
                            <PayModal updateLoanedAmount={handleUpdateLoanedAmount} isOpen={isModalOpen} onRequestClose={closeModal} />
                            </div>

                        </div>

                    </div>
                </div>
                
                <div className="logout-container">
                    <Button className="logout-button" onClick={handleLogout}>
                        Log Out
                    </Button>
                </div>
            </>
        
        )
    }
      </>  
    );
}
export default Home;