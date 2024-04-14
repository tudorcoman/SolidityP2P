import React, { useState } from "react";
import { ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle, Input, InputGroup, InputGroupText, Button } from "reactstrap";

import '../Styles/Deposit.css';

const Loan = () => {
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
                Loan
            </Button>
            <InputGroup className="token-input-group">
                <Input type="number" min={1} placeholder="Amount" className="token-input" />
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
        </div>
    );
}
export default Loan;