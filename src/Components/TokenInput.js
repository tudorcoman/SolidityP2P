import React from "react";
import { useState } from "react";

import { Button, Input, InputGroup, InputGroupText, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";

import '../Styles/Deposit.css';

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

    const payToggle = () => setPayDropdownOpen(!payDropdownOpen);

    const toggle = () => setDropdownOpen(!dropdownOpen);

    const handlePayDeposit = () => {
        console.log("Pay Deposit");
    }

    const handlePayLoan = () => {
        console.log("Pay Loan");
    }
    
    return (
        <div className="input-container">
            <ButtonDropdown isOpen={payDropdownOpen} toggle={payToggle}>
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
            </ButtonDropdown>
            <InputGroup className="token-input-group">
                <Input type="number" min={1} placeholder="Amount" className="token-input"/>
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