import React from "react";

import NavMenu from "./NavMenu";

import { Container } from "reactstrap";

const Layout = (props) => {

    return (
        <div>
            <NavMenu expand="sm" fixed="top"/>
            <Container className="main-content" tag="menu">
                {props.children}
            </Container>
        </div>
    );

};

export default Layout;