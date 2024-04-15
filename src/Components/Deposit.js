import React, { useState } from "react";
import { ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle, Input, InputGroup, InputGroupText, Button } from "reactstrap";

import '../Styles/Deposit.css';

import { useWallet } from '../Blockchain/Context';

import { deposit } from "../Blockchain/Service";

const { ethers } = require("ethers");

const Deposit = () => {

    const currencies = [
        'PRC',
        'BTC',
        'ETH',
        'USDT',
        'BNB',
    ];

    const { wallet } = useWallet();

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState('PRC');

    const [inputAmount, setInputAmount] = useState(0);

    const toggle = () => setDropdownOpen(!dropdownOpen);

    const handleDeposit = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        
        if(wallet){
            if(inputAmount > 0)
                deposit(signer, inputAmount);
            else
                alert("Please enter a valid amount");
        }
        else{
            alert("Please connect your wallet");
        }
    }
    
    return (
        <div className="input-container">
            <Button className="submit-button"
                color="primary"
                // size="lg"
                onClick={handleDeposit}
            >
                Deposit
            </Button>
            <InputGroup className="token-input-group">
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
    );
}

export default Deposit;
