import React from "react";

import '../Styles/Home.css';

import { Button } from "reactstrap";

import PayModal from "./PayModal";

const Home = () => {

    const [depositedAmount, setDepositedAmount] = React.useState(0);
    const [loanAmount, setLoanAmount] = React.useState(0);

    const [isModalOpen, setIsModalOpen] = React.useState(false);


    const openModal = (e) => {
        e.preventDefault();
        setIsModalOpen(true);
    }

    const closeModal = (e) => {
        e.preventDefault();
        setIsModalOpen(false);
    }

    return (
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
        
    );
}
export default Home;