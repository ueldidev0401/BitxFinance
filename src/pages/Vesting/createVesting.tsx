import React, { useState } from 'react';
import './index.scss';

import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Step from '@mui/material/Step';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';
import { StepIconProps } from '@mui/material/StepIcon';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import { alpha, styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import { Row, Col } from 'react-bootstrap';

import vestinglogo from 'assets/img/vesting/vesting logo.svg';

const ColorlibStepIconRoot = styled('div')<{
    ownerState: { completed?: boolean; active?: boolean };
}>(({ theme, ownerState }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
    // border: '1px solid gray',
    zIndex: 1,
    color: '#000',
    width: 50,
    height: 50,
    display: 'flex',
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: "20px",
    ...(ownerState.active && {

        backgroundImage:
            'linear-gradient( 136deg, rgb(53 220 158) 0%, rgb(23 149 85) 50%, rgb(2 86 68) 100%)',
        boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
        color: '#fff',
    }),
    ...(ownerState.completed && {
        backgroundImage:
            'linear-gradient( 136deg, rgb(53 220 158) 0%, rgb(23 149 85) 50%, rgb(2 86 68) 100%)',
        color: '#fff',
    }),
}));

function ColorlibStepIcon(props: StepIconProps) {
    const { active, completed, className } = props;

    const icons: { [index: string]: React.ReactElement } = {
        1: <div>1</div>,
        2: <div>2</div>,
        3: <div>3</div>,
        4: <div>4</div>,
    };

    return (
        <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
            {icons[String(props.icon)]}
        </ColorlibStepIconRoot>
    );
}

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
        top: 22,
    },
    [`&.${stepConnectorClasses.active}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            backgroundImage:
                'linear-gradient( 95deg, rgb(53 220 158) 0%, rgb(23 149 85) 50%, rgb(2 86 68) 100%)',
        },
    },
    [`&.${stepConnectorClasses.completed}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            backgroundImage:
                'linear-gradient( 95deg, rgb(53 220 158) 0%, rgb(23 149 85) 50%, rgb(2 86 68) 100%)',
        },
    },
    [`& .${stepConnectorClasses.line}`]: {
        height: 2,
        border: 0,
        backgroundColor:
            theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#D3D3D3',
        borderRadius: 1,
    },
}));

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

const CreateVesting = () => {
    const steps = ['Confirm Your Token', 'Locking Token For', 'Finalize Your Lock', 'Track Your Lock'];
    const lockingTokensFor = ['Marketing', 'Ecosystem', 'Team', 'Advisor', 'Foundation', 'Development', 'Partnership', 'investor'];

    const [activeStep, setActiveStep] = useState<number | undefined>(0);
    const handleChangeStep = (stepNum) => {
        if (stepNum >= 0 && stepNum <= 3) {
            setActiveStep(stepNum);
        }
    };

    /** step 2 Locking Tokens for */

    // switch state
    const [switchLockingTokensForchecked, setLockingTokensForChecked] = React.useState(true);
    const handleSwtichLockingTokensForChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLockingTokensForChecked(event.target.checked);
    };

    // select why u lock tokens
    const [selectedLockingTokensForID, setLockingTokensForID] = React.useState<number | undefined>();
    const handleSelectTokensFor = (index) => {
        setLockingTokensForID(index);
    };

    // select lock type
    const [lockType, setLockType] = React.useState('single');

    const handleRadioLockTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLockType((event.target as HTMLInputElement).value);
    };

    return (
        <>
            <div className="home-container mb-5" >
                <p className='lock-process text-center'>Lock Process</p>

                <Box sx={{ width: '100%', marginTop: "40px" }}>
                    <Stepper alternativeLabel activeStep={activeStep} connector={<ColorlibConnector />}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel StepIconComponent={ColorlibStepIcon}><span style={{ color: "#D3D3D3", fontSize: "13px" }}>{label}</span></StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {/** step 1 */}
                    <div className="Step-Box">
                        {
                            activeStep == 0 && (
                                <>
                                    <p className="step-title">Confirm Your Token</p>
                                    <input className='bitx-input w-100' />
                                    <p className="step-title mt-3">Token Found</p>
                                    <Row>
                                        <Col xs="12" sm="6">
                                            <div className="token-info">
                                                <span> {"Token Name : "}</span>
                                                <span> {"BitX"} </span>
                                            </div>
                                        </Col>
                                        <Col xs="12" sm="6">
                                            <div className="token-info">
                                                <span> {"Token Ticker : "}</span>
                                                <span> {"BitX"} </span>
                                            </div>
                                        </Col>
                                        <Col xs="12" sm="6">
                                            <div className="token-info">
                                                <span> {"Total Supply : "}</span>
                                                <span> {"1038400000"} </span>
                                            </div>
                                        </Col>
                                        <Col xs="12" sm="6">
                                            <div className="token-info">
                                                <span> {"Your Balance : "}</span>
                                                <span> {"0"} </span>
                                            </div>
                                        </Col>
                                    </Row>
                                </>
                            )
                        }

                        {
                            activeStep == 1 && (
                                <>
                                    <div className="d-flex" style={{ alignItems: "center" }}>
                                        <p className="step-title" style={{ alignItems: "center" }}>I am Locking Tokens for</p>
                                        <div className="ml-5">
                                            <span className={!switchLockingTokensForchecked ? "text-primary-color" : "text-dark-color"}> Myself </span>
                                            <GreenSwitch
                                                checked={switchLockingTokensForchecked}
                                                onChange={handleSwtichLockingTokensForChange}
                                                inputProps={{ 'aria-label': 'controlled' }}
                                            />
                                            <span className={switchLockingTokensForchecked ? "text-primary-color" : "text-dark-color"}> Someone Else </span>
                                        </div>
                                    </div>
                                    <input className='bitx-input w-100' />
                                    <p className="step-title mt-3">Please select</p>
                                    <Row>
                                        {
                                            lockingTokensFor.map((row, index) => {
                                                return (
                                                    <div className={selectedLockingTokensForID == index ? "token-lock-chip-active" : "token-lock-chip"} key={index} onClick={() => handleSelectTokensFor(index)}>
                                                        <span> {row} </span>
                                                    </div>
                                                );
                                            })
                                        }
                                    </Row>
                                </>
                            )
                        }

                        {
                            activeStep == 2 && (
                                <>
                                    <div className="d-flex" style={{ alignItems: "center" }}>
                                        <p className="step-title" style={{ alignItems: "center" }}>Finalize your Lock</p>
                                        <div className="ml-5">
                                            <RadioGroup
                                                aria-labelledby="demo-form-control-label-placement"
                                                name="quiz"
                                                value={lockType}
                                                onChange={handleRadioLockTypeChange}
                                            >
                                                <FormControlLabel value="single" control={<Radio sx={{
                                                    color: '#05AB76',
                                                    '&.Mui-checked': {
                                                        color: '#05AB76',
                                                    },
                                                }} />} label="Single Lock" />

                                                <FormControlLabel value="linear" control={<Radio sx={{
                                                    color: '#05AB76',
                                                    '&.Mui-checked': {
                                                        color: '#05AB76',
                                                    },
                                                }} />} label="Linear Vesting" />

                                                <FormControlLabel value="custom" control={<Radio sx={{
                                                    color: '#05AB76',
                                                    '&.Mui-checked': {
                                                        color: '#05AB76',
                                                    },
                                                }} />} label="Custom Vesting" />
                                            </RadioGroup>
                                        </div>
                                    </div>
                                    <Row className="mt-3">
                                        <Col lg="6">
                                            <Row className="lock-mini-box d-flex align-items-center ml-1 mr-1">
                                                <span>Lock Amount</span>
                                                <div className="d-flex ml-auto">
                                                    <input className='bitx-input' />
                                                    <div className="token-ticker">BTX</div>
                                                </div>
                                                <span className='ml-auto'>Balance: 0</span>
                                                <div className="max-but ml-auto">max</div>
                                            </Row>
                                        </Col>
                                        <Col lg="6">
                                            {
                                                lockType == "single" && (
                                                    <>
                                                        <Row className="lock-mini-box d-flex align-items-center ml-1 mr-1">
                                                            <span>Locking Duration</span>
                                                            <div className="d-flex ml-auto">
                                                                <input className='bitx-input' />
                                                                <div className="token-ticker">Days</div>
                                                            </div>
                                                        </Row>
                                                        <div className="text-center mt-3">
                                                            <p style={{ color: "#FEE277" }}>{"You will be able to claim 100 BTX after 5 days."}</p>
                                                        </div>
                                                    </>

                                                )
                                            }

                                            {
                                                lockType == "linear" && (
                                                    <>
                                                        <Row className="lock-mini-box d-flex align-items-center ml-1 mr-1">
                                                            <span>Every Unlock in</span>
                                                            <div className="d-flex ml-auto">
                                                                <input className='bitx-input' />
                                                                <div className="token-ticker">Days</div>
                                                            </div>
                                                        </Row>

                                                        <Row className="lock-mini-box d-flex align-items-center ml-1 mr-1 mt-3">
                                                            <span>Cliff (month)</span>
                                                            <input className='bitx-input ml-auto' style={{ width: "100px", borderRadius: "5px" }} />
                                                            <span className="ml-auto">Lock Count</span>
                                                            <input className='bitx-input ml-auto' style={{ width: "100px", borderRadius: "5px" }} />
                                                        </Row>

                                                        <div className="lock-state-box mt-3">
                                                            <span>Unlock Time</span>
                                                            <span>Wed, 27 Apr 2022 02:47:55 UTC</span>
                                                            <span style={{ color: "#05AB76" }}>Edit</span>
                                                        </div>

                                                        <div className="text-center mt-3">
                                                            <p style={{ color: "#FEE277" }}>{"After 2 Months, You will be able to claim 100 BTX every 30 days."}</p>
                                                            <span style={{ color: "#05AB76" }}>View Testing Table</span>
                                                        </div>
                                                    </>
                                                )
                                            }
                                        </Col>
                                    </Row>

                                    <Row className={`mt-${lockType}`}>
                                        <Col lg="6">
                                            <div className="lock-state-box">
                                                <span>Total Staked</span>
                                                <span style={{ color: "#05AB76" }}>100 BTX</span>
                                            </div>
                                            <div className="lock-state-box mt-2">
                                                <span>{ lockType == "linear" ? "First Unlock Time" : "Unlock Time"}</span>
                                                <span>Wed, 27 Apr 2022 02:47:55 UTC</span>
                                            </div>
                                            <div className="lock-state-box mt-2">
                                                <span>Fees</span>
                                                <span>0.12</span>
                                            </div>
                                        </Col>
                                    </Row>
                                </>
                            )
                        }

                        <div className='mt-2 d-flex text-center justify-content-center'>
                            <div className="d-flex align-items-center justify-content-center" >
                                <div className="step-but" onClick={() => handleChangeStep(activeStep - 1)}>Back</div>
                                <img src={vestinglogo} alt="elrond vesting" />
                                <div className="step-but" onClick={() => handleChangeStep(activeStep + 1)}>Next</div>
                            </div>
                        </div>
                    </div>
                </Box>
            </div >
        </>
    );
};

export default CreateVesting;