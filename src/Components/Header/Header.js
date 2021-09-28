import React, { Component } from 'react';
import { connect } from "react-redux";
import { Nav, NavDropdown } from 'react-bootstrap'
import Logo from './Logo';
import ProfileMini from './ProfileMini';
import LeftMenu from './LeftMenu';

class Header extends Component{
  hoverMenu = () => {
    this.props.dispatch({ type: 'hoverMenu', value: "active" })
  }

  hoverOutMenu = () => {
    this.props.dispatch({ type: 'hoverMenu', value: "" })
  }

  logout = () => {
    this.props.dispatch({ type: 'Token', value: "" });
    this.props.dispatch({ type: 'userType', value: "" });
    this.props.dispatch({ type: 'userName', value: "" });
  }

  render(){
    
    return (
      <>
      <Nav className="navbar navbar-expand-md navbar-light fixed-top bg-light navbar-custom" id="non-printable">
          <Logo/>
          <ProfileMini/>
      </Nav> 
      <div className={`sidebar ${this.props.menuVisibility} ${this.props.menuStatusHeader}`} onMouseEnter={this.hoverMenu} onMouseLeave={this.hoverOutMenu} id="non-printable">
      {/* <div className={`sidebar active`} > */}
        <ul className="menu-lists">
        <Nav className="navbar-nav ml-auto d-block d-sm-none mobile-profile-view">
            <NavDropdown title={
                <button id="navbardrop" className="button-link">
                <span className=""> {this.props.userName}</span>
              <div className=""> <span className="f-s-12"> ({this.props.userType}) </span> </div>
                </button>
            } id="basic-nav-dropdown">
                <NavDropdown.Item href="#" className="dropdown-item">About me</NavDropdown.Item>
                <NavDropdown.Item href="#" className="dropdown-item" onClick={this.logout}>Sign in as different user</NavDropdown.Item>
                <NavDropdown.Item href="#" className="dropdown-item" onClick={this.logout}>Logout</NavDropdown.Item>
            </NavDropdown>
            </Nav>
            
          <LeftMenu /> 
          <li className="collapsed mouse-pointer main-li Left-menu-Create-Request ">
            <a href={process.env.REACT_APP_ENV +"/createrequest"}>
              <i className="fa fa-plus p_5 createIcon"></i>
              <span className="cr-text">&nbsp;Create Request </span>
            </a>
          </li>
        </ul>
      </div>
      </>
    );
  }
};

const mapStateToProps = state => {
  return {
    menuVisibility: state.menuVisibility,
    menuStatusHeader: state.menuStatusHeader,
    getToken: state.token,
    userType: state.userType,
    userName: state.userName,
    UserId: state.UserId,
  };
}

export default connect(mapStateToProps)(Header);
