import React, { useEffect, useState } from "react";
import { ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle, Input, InputGroup, InputGroupText, Button } from "reactstrap";

import '../Styles/Deposit.css';

import { useWallet } from '../Blockchain/Context';

import { getDepositBalance, withdraw } from "../Blockchain/Service";
import { useNavigate } from "react-router-dom";

const { ethers } = require("ethers");

const provider = new ethers.BrowserProvider(window.ethereum);

const Withdraw = () => {

    const currencies = [
        'PRC',
        'BTC',
        'ETH',
        'USDT',
        'BNB',
    ];

    const { wallet } = useWallet();

    const navigate = useNavigate();

    const [isUserLoggedIn, setIsUserLoggedIn] = React.useState(false);

    const [depositedAmount, setDepositedAmount] = React.useState(0);

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState('PRC');

    const [inputAmount, setInputAmount] = useState(0);

    const toggle = () => setDropdownOpen(!dropdownOpen);

    useEffect(() => {
        if(!wallet){
            navigate('/');
        }
    }
    , [wallet, navigate]);

    useEffect(() => {
        if (wallet) {
          setIsUserLoggedIn(true);
          console.log(provider);
          console.log(wallet.address);
          getDepositBalance(provider, wallet).then((balance) => {
            setDepositedAmount(balance);
          });                                                   
            
        //   provider.getSigner().then(async (signer) => {
        //     console.log(signer);
        //     const balance = await getDepositBalance(signer);
        //     const loanBalance = await getLoanBalance(signer);
        //     setDepositedAmount(balance);
        //     setLoanAmount(loanBalance);
        //     });
        }

        
        
      }, []);
      

    useEffect(() => {
        if (wallet) {
            console.log(wallet.address);
            setIsUserLoggedIn(true);
            getDepositBalance(provider, wallet).then((balance) => {
                setDepositedAmount(balance.toString());
            });   
        }

    }, [wallet]);

    const handleWithdraw = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        
        if(wallet){
            if(inputAmount > 0){
                const tx = await withdraw(signer, inputAmount, selectedItem);
                await tx.wait();
                getDepositBalance(provider, wallet).then((balance) => {
                    setDepositedAmount(balance.toString());
                });
            }
            else{
                alert("Please enter a valid amount");
            }
                
        }
        else{
            alert("Please connect your wallet");
        }
    }
    
    return (
        <>
            
            <div className="input-container">
                <div className="dashboard-item">
                    <h2>Deposited Amount: {depositedAmount}</h2>
                </div>
                <InputGroup className="token-input-group">
                    <Button className="submit-button"
                            color="primary"
                            // size="lg"
                            onClick={handleWithdraw}
                        >
                            Withdraw
                    </Button>
                    <Input type="number" min={1} placeholder="Amount" className="token-input" onChange={(e) => setInputAmount(e.target.value)} />
                    <ButtonDropdown isOpen={dropdownOpen} toggle={toggle}>
                        
                        <InputGroupText className="selected-item">{selectedItem}</InputGroupText>
                        <DropdownToggle caret>
                            
                        </DropdownToggle>
                        <DropdownMenu>
                            {currencies.map((currency, index) => (
                                <DropdownItem className="dropdown-item" key={index} onClick={() => setSelectedItem(currency)}>{currency}</DropdownItem>
                            ))}
                        </DropdownMenu>
                    </ButtonDropdown>
                </InputGroup>

            </div>
        </>
    );
}

export default Withdraw;
