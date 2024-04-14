import React from "react";
import { Nav, NavItem } from "reactstrap";
import { NavLink } from 'react-router-dom'; // Import from 'react-router-dom'

import { HomeRoute, DepositRoute, LoanRoute } from '../RouteNames'; // Import the route names

import '../Styles/NavMenu.css';

const NavMenu = (props) => {
    return (
        <Nav className="navmenu">
            <NavItem>
                <NavLink
                    to={HomeRoute.path}
                    className="nav-link"
                    activeClassName="active"
                >
                    Home
                </NavLink>
            </NavItem>
            <NavItem>
                <NavLink 
                    to={DepositRoute.path}
                    className="nav-link"
                    activeClassName="active"
                >
                    Deposit
                </NavLink>
            </NavItem>
            <NavItem>
                <NavLink 
                    to={LoanRoute.path}
                    className="nav-link"
                    activeClassName="active"
                >
                    Loan
                </NavLink>
            </NavItem>
        </Nav>
    );
}
export default NavMenu;
