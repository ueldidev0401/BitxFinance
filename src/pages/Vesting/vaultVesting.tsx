import React, { useState } from 'react';
import Box from '@mui/material/Box';
import CircularProgress, { CircularProgressProps } from '@mui/material/CircularProgress';
import { alpha, styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

import { Row, Col, ProgressBar } from 'react-bootstrap';
import BTX from 'assets/img/token logos/BTX.png';

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

function CircularProgressWithLabel(
    props: CircularProgressProps & { value: number },
) {
    return (
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress variant="determinate" {...props} />
            <Box
                sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Typography
                    variant="caption"
                    component="div"
                    color="white"
                >{`${Math.round(props.value)}%`}</Typography>
            </Box>
        </Box>
    );
}

const VaultVesting = () => {
    const [switchViewType, setSwitchViewType] = React.useState(false);
    const handleSwitchViewType = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSwitchViewType(event.target.checked);
    };

    return (
        <div className="home-container">
            <p className='lock-process text-center'>Vault Explorer</p>

            <Row>
                <Col lg="4">
                    <div className="vesting-info-box text-center">
                        <img src={BTX} alt="BTX" />
                        <p className="mt-3 mb-2" style={{ fontSize: "22px", fontWeight: "700", color: "#D6D6D6" }}>BTX</p>
                        <p className="text-address" style={{ color: '#05AB76' }}> 0xd5e950837Ad48D08baD2f87bFcF8eD7167bB44BC</p>

                        <ProgressBar style={{ marginTop: "35px" }} now={25} />

                        <div className="d-flex justify-content-between mt-4">
                            <span style={{ color: "#B5B5B5" }}>BTX Locked</span>
                            <span style={{ color: "#05AB76" }}>128,000,000</span>
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                            <span style={{ color: "#B5B5B5" }}>Total Supply</span>
                            <span style={{ color: "#05AB76" }}>1,000,000,000</span>
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                            <span style={{ color: "#B5B5B5" }}>Total Value Locked</span>
                            <span style={{ color: "#05AB76" }}>$ 234,567</span>
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                            <span style={{ color: "#B5B5B5" }}>Next Release</span>
                            <span style={{ color: "#05AB76" }}>5 Days</span>
                        </div>

                        <div className="mt-4">
                            <span className={!switchViewType ? "text-primary-color" : "text-dark-color"}> View All Locks </span>
                            <GreenSwitch
                                checked={switchViewType}
                                onChange={handleSwitchViewType}
                                inputProps={{ 'aria-label': 'controlled' }}
                            />
                            <span className={switchViewType ? "text-primary-color" : "text-dark-color"}> Track My Locks </span>
                        </div>
                    </div>
                </Col>

                <Col lg="8">
                    <input className="bitx-input w-100" placeholder='Search a smart lock by name/contract address' />

                    <Row className="mt-4">
                        <Col sm="6">
                            <div className="lock-box justify-content-between">
                                <div className="d-flex flex-column">
                                    <div>
                                        <span style={{ color: "#B5B5B5" }}>Locked BTX: </span>
                                        <span className="ml-2">41666.666</span>
                                    </div>
                                    <div className="mt-2">
                                        <span style={{ color: "#B5B5B5" }}>Purpose: </span>
                                        <span className="ml-2">Ecosystem</span>
                                    </div>
                                    <div className="mt-2">
                                        <span style={{ color: "#B5B5B5" }}>Period: </span>
                                        <span>3/28/2022 ~ 5/28/2022</span>
                                    </div>
                                </div>
                                <div className="d-flex flex-column justify-content-center align-items-center text-center">
                                    <CircularProgressWithLabel value={90} color="secondary" />
                                    <span className="mt-1" style={{ color: "#B5B5B5", fontSize: "12px" }}>Remain : 5days</span>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </div>
    );
};

export default VaultVesting;