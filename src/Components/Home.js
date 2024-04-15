import React, { useEffect } from "react";

import { useWallet } from "../Blockchain/Context";

import { connectWalletMetamask } from "../Blockchain/Service";

import '../Styles/Home.css';

import { Button } from "reactstrap";

import { ReactTyped } from "react-typed";

import PayModal from "./PayModal";

const Home = () => {

    const [depositedAmount, setDepositedAmount] = React.useState(0);
    const [loanAmount, setLoanAmount] = React.useState(0);

    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const [isUserLoggedIn, setIsUserLoggedIn] = React.useState(false);

    const { wallet, initializeWallet } = useWallet();

    const accountChangedHandler = (address) => {
        initializeWallet(address);
        localStorage.setItem('walletAddress', address);
    }
      

    const handleLogin = () => {
        connectWalletMetamask(accountChangedHandler);
    }

    const openModal = (e) => {
        e.preventDefault();
        setIsModalOpen(true);
    }

    const closeModal = (e) => {
        e.preventDefault();
        setIsModalOpen(false);
    }

    // const handleLogin = (e) => {
    //     e.preventDefault();
    //     setIsUserLoggedIn(true);
    // }

    const handleLogout = (e) => {
        e.preventDefault();
        setIsUserLoggedIn(false);
        localStorage.removeItem('walletAddress');
        initializeWallet(null);
      }
      

    useEffect(() => {
        const savedAddress = localStorage.getItem('walletAddress');
        if (savedAddress) {
          initializeWallet(savedAddress);
          setIsUserLoggedIn(true);
        }
      }, []);
      

    useEffect(() => {
        if (wallet) {
            console.log(wallet.address);
            setIsUserLoggedIn(true);
        }

    }, [wallet]);

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
                            <PayModal isOpen={isModalOpen} onRequestClose={closeModal} />
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