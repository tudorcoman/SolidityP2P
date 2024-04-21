import React, { useState, useEffect } from "react";
import { ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle, Input, InputGroup, InputGroupText, Button } from "reactstrap";

import { useWallet } from '../Blockchain/Context';

import '../Styles/Deposit.css';
import { borrow, getLoanBalance } from "../Blockchain/Service";

import { useNavigate } from "react-router-dom";

const { ethers } = require("ethers");

const provider = new ethers.BrowserProvider(window.ethereum);

const Loan = () => {
    const currencies = [
        'PRC',
        'BTC',
        'ETH',
        'USDT',
        'BNB',
    ];

    const [isUserLoggedIn, setIsUserLoggedIn] = React.useState(false);

    const [loanedAmount, setLoanedAmount] = React.useState(0);

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState('PRC');

    const [inputAmount, setInputAmount] = useState(0);

    const [inputDays, setInputDays] = useState(1);

    const toggle = () => setDropdownOpen(!dropdownOpen);

    const { wallet } = useWallet();

    const navigate = useNavigate();

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
          getLoanBalance(provider, wallet).then((balance) => {
            setLoanedAmount(balance);
          });                                                   
            
        
        }

        
        
      }, []);
      

    useEffect(() => {
        if (wallet) {
            console.log(wallet.address);
            setIsUserLoggedIn(true);
            getLoanBalance(provider, wallet).then((balance) => {
                setLoanedAmount(balance.toString());
            });   
        }

    }, [wallet]);

    const handleLoan = async () => {
        
        const signer = await provider.getSigner();
        
        if(wallet) {
            if(inputAmount > 0 && inputDays > 0) {
                
                borrow(signer, inputAmount, inputDays).then(() => {
                    setInputAmount(0);
                    setInputDays(1);
                })
                .then(() => {
                    getLoanBalance(provider, wallet).then((balance) => {
                        setLoanedAmount(balance.toString());
                    });
                });
            } else {
                alert("Please enter a valid amount and number of days");
            }
        } else {
            alert("Please connect your wallet");
        }
    };
    

    return (
        <div className="input-container">
            <div className="dashboard-item">
                <h2>Loaned Amount: {loanedAmount}</h2>
            </div>
            <InputGroup className="token-input-group">
                <Button className="submit-button"
                        color="primary"
                        // size="lg"
                        onClick={handleLoan}
                    >
                        Loan
                </Button>
                <Input type="number" min={1} placeholder="Amount" className="token-input" onChange={(e) => setInputAmount(e.target.value)} />
                <ButtonDropdown isOpen={dropdownOpen} toggle={toggle}>
                    
                    <InputGroupText>{selectedItem}</InputGroupText>
                    <DropdownToggle caret>
                        
                    </DropdownToggle>
                    <DropdownMenu>
                        {currencies.map((currency, index) => (
                            <DropdownItem key={index} onClick={() => setSelectedItem(currency)}>{currency}</DropdownItem>
                        ))}
                    </DropdownMenu>
                </ButtonDropdown>
            </InputGroup>
            <InputGroup className="days-input-group">
                <Input type="number" min={1} placeholder="No. of Days" className="days-input" onChange={(e) => setInputDays(e.target.value)} />

            </InputGroup>
        </div>
    );
}
export default Loan;