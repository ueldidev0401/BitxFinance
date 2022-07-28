import React from 'react';
import { logout, useGetAccountInfo } from '@elrondnetwork/dapp-core';
import { Navbar as BsNavbar, NavItem, Nav, NavDropdown } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { routeNames } from 'routes';
import logo from '../../../assets/img/BTX.png';
import './index.scss';


const Navbar = () => {
  const { address } = useGetAccountInfo();
  const location = useLocation();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout(`${window.location.origin}/unlock`);
  };


  const isLoggedIn = Boolean(address);

  return (
    <BsNavbar className='px-4 py-3' expand='md' collapseOnSelect style={{ background: "#141414", borderBottom: "1px solid #707070" }}>
      <div className='container-fluid'>
        <Link
          className='d-flex align-items-center navbar-brand mr-0 c-logo-container'
          to={routeNames.home}
        >
          <img src={logo} />
          <span>{"BitX Finance"}</span>
        </Link>

        <BsNavbar.Toggle aria-controls='responsive-navbar-nav' style={{ background: "#D8D3D3" }} />
        <BsNavbar.Collapse id='responsive-navbar-nav' className='nav-menu-wrap'>
          <Nav className='ml-auto'>

            <NavDropdown
              id="nav-dropdown-dark-example"
              title="Staking"
              className='custom-navbar-button custom-navbar-normal-button'
            >
              <NavDropdown.Item id="nav-dropdown-dark-example" onClick={() => { navigate(routeNames.staking); }}>
                Home
              </NavDropdown.Item>
              <NavDropdown.Item id="nav-dropdown-dark-example" onClick={() => { navigate(routeNames.bitxstaking); }}>
                BTX Pool
              </NavDropdown.Item>
              <NavDropdown.Item id="nav-dropdown-dark-example" onClick={() => { navigate(routeNames.dicestaking); }}>
                Dice Pool
              </NavDropdown.Item>
              <NavDropdown.Item onClick={() => { navigate(routeNames.marestaking); }}>
                Mare Pool
              </NavDropdown.Item>
              <NavDropdown.Item onClick={() => { navigate(routeNames.hetostaking); }}>
                Heto Pool
              </NavDropdown.Item>
            </NavDropdown>

            <Link to={routeNames.presale} className='custom-navbar-button custom-navbar-normal-button'>
              Presale
            </Link>
            <Link to={routeNames.nftmint} className='custom-navbar-button custom-navbar-normal-button'>
              NFT Mint
            </Link>
            <Link to={routeNames.bitlock} className='custom-navbar-button custom-navbar-normal-button'>
              Bitlock
            </Link>

            {isLoggedIn ? (
              <NavItem className='custom-navbar-button auth-button' onClick={handleLogout}>
                Disconnect
              </NavItem>
            ) : (
              <Link to={{ pathname: routeNames.unlock }} state={{ pastURL: location.pathname }} className='custom-navbar-button auth-button'>
                Connect Wallet
              </Link>
            )}
          </Nav>
        </BsNavbar.Collapse>
      </div>
    </BsNavbar>
  );
};

export default Navbar;
