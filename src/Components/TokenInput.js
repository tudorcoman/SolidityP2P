import React from "react";
import { useState } from "react";

import { Button, Input, InputGroup, InputGroupText, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";

import '../Styles/Deposit.css';
import { repay } from "../Blockchain/Service";

const { ethers } = require("ethers");

const provider = new ethers.BrowserProvider(window.ethereum);

const TokenInput = (props) => {

    const currencies = [
        'PRC',
        'BTC',
        'ETH',
        'USDT',
        'BNB',
    ];

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState('PRC');

    const [payDropdownOpen, setPayDropdownOpen] = useState(false);

    const [inputAmount, setInputAmount] = useState(0);

    const payToggle = () => setPayDropdownOpen(!payDropdownOpen);

    const toggle = () => setDropdownOpen(!dropdownOpen);



    // const handlePayDeposit = () => {
    //     console.log("Pay Deposit");
    // }

    const handlePayLoan = async () => {
        if(inputAmount > 0){
            const signer = await provider.getSigner();
            repay(signer, inputAmount).then(() => {
                props.updateLoanedAmount();
            });
           
        }
        
    }
    
    return (
        <div className="input-container">
            
            <InputGroup className="token-input-group">
                {/* <ButtonDropdown isOpen={payDropdownOpen} toggle={payToggle}>
                    <DropdownToggle className="submit-button"
                        color="primary"
                        caret
                        // size="lg"
                    >
                        Pay
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem onClick={handlePayDeposit}>Deposit</DropdownItem>
                        <DropdownItem onClick={handlePayLoan}>Loan</DropdownItem>
                    </DropdownMenu>
                </ButtonDropdown> */}
                <Button className="submit-button"
                        color="primary"
                        // size="lg"
                        onClick={handlePayLoan}
                    >
                        Pay
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
    );
}

export default TokenInput;