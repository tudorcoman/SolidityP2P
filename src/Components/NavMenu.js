import React from "react";
import { Nav, NavItem, NavbarBrand } from "reactstrap";
import { NavLink } from 'react-router-dom'; // Import from 'react-router-dom'

import { HomeRoute, DepositRoute, LoanRoute } from '../RouteNames'; // Import the route names

import '../Styles/NavMenu.css';

const NavMenu = (props) => {

    const imagePath = "/p2p.png";

    return (
        <Nav className="navmenu">
            <NavbarBrand className="navbrand" href="/">
            <img
                className="brand-image"
                alt="logo"
                src={imagePath}
                style={{
                height: 40,
                width: 40
                }}
            />
            Principal2Principal
            </NavbarBrand>
            <div className="navitems-container">
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
            </div>
        </Nav>
    );
}
export default NavMenu;
