import React from "react";

import Modal from 'react-modal';

import TokenInput from "./TokenInput";

import '../Styles/PayModal.css';
import { Button } from "reactstrap";

Modal.setAppElement('#root');

const PayModal = (props) => {
    return (
        <Modal className="modal-content"
            isOpen={props.isOpen}
            onRequestClose={props.onRequestClose}
            style={props.style}
            contentLabel="Pay Modal"
            contentOverlayClassName="modal-overlay"
        >
            <TokenInput />
            <Button className="close-button" onClick={props.onRequestClose}>Close</Button>
        </Modal>
    );
}
export default PayModal;