import React, { useState } from 'react';
import { alpha, styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import { Row, Col } from 'react-bootstrap';

import { Link } from 'react-router-dom';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import BitlockImg from 'assets/img/vesting/Bitlock Img.svg';
import Symbol1 from 'assets/img/vesting/Symbol for Locked Token Value.png';
import Symbol2 from 'assets/img/vesting/Symbol for Locked Tokens.png';
import Symbol3 from 'assets/img/vesting/Symbol for Lockers.png';

import { routeNames } from 'routes';

import * as data from './data';

const GreenSwitch = styled(Switch)(({ theme }) => ({
    '& .MuiSwitch-switchBase': {
        color: '#05AB76',
        '&:hover': {
            backgroundColor: alpha('#05AB76', theme.palette.action.hoverOpacity),
        },

        '& .Mui-checked': {
            backgroundColor: '#05AB76',

        }
    },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
        backgroundColor: '#5D5D5D',
    },

    '& .MuiSwitch-track': {
        backgroundColor: '#5D5D5D',
    },
    '& .MuiSwitch-thumb': {
        backgroundColor: '#05AB76',
    }
}));

const BitLock = () => {

    const [switchViewType, setSwitchViewType] = React.useState(true);
    const handleSwitchViewType = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSwitchViewType(event.target.checked);
    };

    return (
        <div className="home-container">
            <Row>
                <Col sm="6" className="d-flex justify-content-center align-items-center">
                    <img className="w-75" src={BitlockImg} alt="Bit Lock" />
                </Col>

                <Col sm="6" className="d-flex text-center align-items-center">
                    <div>
                        <div>
                            <p className="description-title">{"BitLock"}</p>
                            <p className="description-body">{"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eu nibh bibendum, dictum nibh eu, ultricies lectus. Nullam metus eros, lacinia quis condimentum at, sagittis eu sapien. Suspendisse suscipit orci nec eros elementum"}</p>
                        </div>

                        <Row className="mt-5">
                            <Col xs="4">
                                <div className="">
                                    <img className="w-75" src={Symbol1} alt="Locked Token Value" />
                                    <p className="mt-3 mb-1" style={{ color: "#D1D1D1" }}>$730,418</p>
                                    <span style={{ color: "#D1D1D1" }}>Locked Token Value</span>
                                </div>
                            </Col>
                            <Col xs="4">
                                <div className="">
                                    <img className="w-75" src={Symbol2} alt="Locked Token Value" />
                                    <p className="mt-3 mb-1" style={{ color: "#D1D1D1" }}>25</p>
                                    <span style={{ color: "#D1D1D1" }}>Locked Tokens</span>
                                </div>
                            </Col>
                            <Col xs="4">
                                <div className="">
                                    <img className="w-75" src={Symbol3} alt="Locked Token Value" />
                                    <p className="mt-3 mb-1" style={{ color: "#D1D1D1" }}>225</p>
                                    <span style={{ color: "#D1D1D1" }}>Lockers</span>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Col>
            </Row>

            <div className="bitlock-vesting-list-box mt-5 mb-5">
                <p className="text-center" style={{ fontSize: "20px", fontWeight: "500", color: "#D3D3D3" }}>Search A Smart Lock Address</p>

                <Row className="text-center justify-content-center">
                    <input className='bitx-input w-75' style={{ background: "#191A1E", borderRadius: "5px" }} placeholder="Search a smart lock by name/contract address" />
                    <Link to={routeNames.createvesting}>
                        <div className="create-vesting-but ml-3">Create Vesting</div>
                    </Link>
                </Row>

                <div className="text-center mt-3">
                    <span className={!switchViewType ? "text-primary-color" : "text-dark-color"}> Track All Locks </span>
                    <GreenSwitch
                        checked={switchViewType}
                        onChange={handleSwitchViewType}
                        inputProps={{ 'aria-label': 'controlled' }}
                    />
                    <span className={switchViewType ? "text-primary-color" : "text-dark-color"}> Track My Locks </span>
                </div>

                <Table className="text-center mt-3" style={{ color: "#ACACAC" }}>
                    <Thead>
                        <Tr>
                            {
                                data.vestingListHeader.map((row, index) => {
                                    return (
                                        <Th key={index}>{row}</Th>
                                    );
                                })
                            }
                        </Tr>
                    </Thead>
                    <Tbody>

                        {
                            data.vestingList.map((row, index) => {
                                return (
                                    <Tr key={index}>
                                        <Td>{row.Name}</Td>
                                        <Td>{row.Token_Identifier}</Td>
                                        <Td>{row.Token_Amount}</Td>
                                        <Td>{row.Token_Value}</Td>
                                        <Td>{row.Total_Value}</Td>
                                        <Td>{row.Next_Relase}</Td>
                                        <Td><div className="view-but">view</div></Td>
                                    </Tr>
                                );
                            })
                        }
                    </Tbody>
                </Table>
            </div>
        </div>
    );
};

export default BitLock;