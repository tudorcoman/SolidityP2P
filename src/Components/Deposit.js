import React, { useState } from "react";
import { ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle, Input, InputGroup, InputGroupText, Button } from "reactstrap";

import '../Styles/Deposit.css';

const Deposit = () => {

    const currencies = [
        'PRC',
        'BTC',
        'ETH',
        'USDT',
        'BNB',
    ];

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState('PRC');

    const toggle = () => setDropdownOpen(!dropdownOpen);
    
    return (
        <div className="input-container">
            <Button className="submit-button"
                color="primary"
                // size="lg"
            >
                Deposit
            </Button>
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

export default Deposit;
