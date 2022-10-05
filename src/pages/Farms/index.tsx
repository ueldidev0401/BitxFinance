import React, { useState, useEffect } from 'react';
import Checkbox from '@mui/material/Checkbox';
import Slider, { SliderThumb } from '@mui/material/Slider';
import { styled } from '@mui/material/styles';
import { Row, Col } from 'react-bootstrap';
import { AiFillLock, AiOutlineInfoCircle } from "react-icons/ai";
import Modal from 'react-modal';
import BTXLogo from 'assets/img/token logos/BTX.png';
import EGLDLogo from 'assets/img/token logos/EGLD.png';
import LPFarmLogo from 'assets/img/LP Farm.png';
import './index.scss';

const AirbnbSlider = styled(Slider)(({ theme }) => ({
    color: '#F9D85E',
    height: 3,
    padding: '13px 0',
    '& .MuiSlider-thumb': {
        height: 20,
        width: 20,
        backgroundColor: '#F9D85E',
        border: '1px solid currentColor',
        boxShadow: 'none',
        '&:hover': {
            boxShadow: '0 0 0 8px rgba(249, 216, 94, 0.16)',
        },
        '& .airbnb-bar': {
            height: 9,
            width: 1,
            backgroundColor: 'currentColor',
            marginLeft: 1,
            marginRight: 1,
        },
    },
    '& .MuiSlider-track': {
        height: 6,
    },
    '& .MuiSlider-rail': {
        color: theme.palette.mode === 'dark' ? '#1E1F20' : '#1E1F20',
        // opacity: theme.palette.mode === 'dark' ? undefined : 1,
        opacity: 1,
        height: 6,
    },
    '& .MuiSlider-markLabel': {
        color: '#AEAEAE'
    },
    '& .MuiSlider-markActive': {
        backgroundColor: '#000'
    }
}));

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface AirbnbThumbComponentProps extends React.HTMLAttributes<unknown> { }

function AirbnbThumbComponent(props: AirbnbThumbComponentProps) {
    const { children, ...other } = props;
    return (
        <SliderThumb {...other}>
            {children}
        </SliderThumb>
    );
}

const Farms = () => {
    const marks = [
        {
            value: 0,
            label: '0',
        },
        {
            value: 25,
            label: '25%',
        },
        {
            value: 50,
            label: '50%',
        },
        {
            value: 75,
            label: '75%',
        },
        {
            value: 100,
            label: '100%',
        },
    ];
    const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

    const BTXTotalBalance = 3000; // Current Balance of BTX

    /** =============================== staking Farm modal (Stake BTX / LKMEX) ================================== */
    /*
    const [showStakingFarmModal, setShowStakingFarmModal] = useState(false);
    const [stakingFarmStakeAmount, setStakingFarmStakeAmount] = useState<number | undefined>();
    const [stakingFarmRelockState, setStakingFarmRelockState] = useState(false);

    const handleStakingFarmSliderChange = (num: any) => {
        setStakingFarmStakeAmount(BTXTotalBalance / 100 * num);
    };

    const handleStakingFarmStakeClicked = () => {
        const amount = stakingFarmStakeAmount;
        const relock = stakingFarmRelockState;
        console.log(amount, relock, "Stake BTX / LKMEX");
        setShowStakingFarmModal(false);
    };

    */
    /** =============================== LP Farm modal (Stake BTX - EGLD) ================================== */
    const [showLPFarmModal, setShowLPFarmModal] = useState(false);
    const [LPFarmStakeAmount, setLPFarmStakeAmount] = useState<number | undefined>();
    const [LPFarmRelockState, setLPFarmRelockState] = useState(false);

    const handleLPFarmSliderChange = (num: any) => {
        setLPFarmStakeAmount(BTXTotalBalance / 100 * num);
    };

    const handleLPFarmStakeClicked = () => {
        const amount = LPFarmStakeAmount;
        const relock = LPFarmRelockState;
        console.log(amount, relock, "Stake BTX - EGLD");
        setShowLPFarmModal(false);
    };



    /** ============================= harvest all ============================================================ */
    /*
    const handleStakingFarmHarvestAll = () => {
        console.log("staking farm harvest all");
    };
    */
    const handleLPFarmHarvestAll = () => {
        console.log("LP Farm harvest all");
    };

    return (
        <div className="home-container mb-5" style={{ fontFamily: 'Segoe UI', color: 'white', marginTop: '28px' }}>
            <div className='d-flex justify-content-center'>
                <div style={{ width: '180px' }}>
                    <img src={LPFarmLogo} width={'100%'} />
                </div>
            </div>
            <div className='text-center d-flex flex-column mt-3'>
                <span style={{ fontFamily: 'Segoe UI', fontWeight: '600', fontSize: '30px' }}>FARMS</span>
                <div className='d-flex justify-content-center mt-3'>
                    <span style={{ color: '#707070', width: '1000px' }}>{"LP farms allow for BTX holders to stake their LP tokens to generate rewards. BTX holders can create a LP pair through Maiar Exchange by adding liquidity, this liquidity token is created by pairing EGLD with BTX once this is done holders can then stake that LP token into the LP farms"}</span>
                </div>
            </div>
            <div className='d-flex align-items-center justify-content-center' style={{ marginTop: '30px' }}>
                <div className='farms-info-card'>
                    <Row className='d-flex align-items-center'>
                        <Col sm='6'>
                            <div className='d-flex flex-column'>
                                <span style={{ fontSize: '15px' }}> Total Value Locked on Farms </span>
                                <span style={{ fontSize: '20px', color: '#FEE277' }}> $ 0 </span>
                            </div>
                        </Col>
                        <Col sm='6'>
                            <div className='d-flex flex-column' style={{ fontSize: '14px', gap: '6px' }}>
                                <span> 1 BTX = <span style={{ color: '#FEE277' }}>$ 0.1234567</span></span>
                                <span> Market Cap: <span style={{ color: '#FEE277' }}> $ 0</span></span>
                                <span> Est. Weekly Rewards: <span style={{ color: '#FEE277' }}>$ 0 </span></span>
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>

            {/** 
            <p style={{ fontSize: '18px', color: '#B5B5B5', marginTop: '30px' }}>Staking Farms</p>

            <div className='farm-card'>
                <Row className='d-flex align-items-center'>
                    <Col lg='3'>
                        <div className='d-flex align-items-center'>
                            <div>
                                <img src={BTXLogo} alt='BTX logo' width={'40px'} />
                            </div>

                            <div className='d-flex flex-column' style={{ marginLeft: '30px', gap: '5px' }}>
                                <span style={{ fontWeight: '600', fontSize: '16px' }}> Stake BTX / LKMEX</span>
                                <span> $ 381,826,657 </span>
                            </div>
                        </div>
                    </Col>
                    <Col md='4' lg='2'>
                        <div className='d-flex flex-column' style={{ gap: '5px' }}>
                            <span style={{ fontSize: '14px', color: '#B5B5B5' }}> APR </span>
                            <div className='d-flex align-items-center'>
                                <span> 21% /</span>
                                <AiFillLock className='ml-2 mr-1' />
                                <span> 78%</span>
                            </div>
                        </div>
                    </Col>
                    <Col md='4' lg='2'>
                        <div className='d-flex flex-column' style={{ gap: '5px' }}>
                            <span style={{ fontSize: '14px', color: '#B5B5B5' }}> My Staked BTX </span>
                            <span> 0 </span>
                        </div>
                    </Col>
                    <Col md='4' lg='2'>
                        <div className='d-flex flex-column' style={{ gap: '5px' }}>
                            <span style={{ fontSize: '14px', color: '#B5B5B5' }}> My Earned MEX </span>
                            <span> 0 </span>
                        </div>
                    </Col>
                    <Col lg='3'>
                        <div className='d-flex justify-content-center'>
                            <button className='farm-but ml-3' onClick={handleStakingFarmHarvestAll}> Harvest all </button>
                            <button className='farm-but stake-but ml-4' onClick={() => setShowStakingFarmModal(true)}> Stake </button>
                        </div>
                    </Col>
                </Row>
            </div>
*/}
            <p style={{ fontSize: '18px', color: '#B5B5B5', marginTop: '30px' }}>LP Farms</p>

            <div className='farm-card'>
                <Row className='d-flex align-items-center'>
                    <Col lg='3'>
                        <div className='d-flex align-items-center'>
                            <div className='d-flex'>
                                <div>
                                    <img src={BTXLogo} alt='BTX logo' width={'38px'} />
                                </div>

                                <div style={{ marginLeft: '-15px', marginTop: '20px' }}>
                                    <img src={EGLDLogo} alt='EGLD logo' width={'38px'} />
                                </div>
                            </div>

                            <div className='d-flex flex-column' style={{ marginLeft: '30px', gap: '5px' }}>
                                <span style={{ fontWeight: '600', fontSize: '16px' }}> BTX - EGLD </span>
                                <span> $ 0 </span>
                            </div>
                        </div>
                    </Col>
                    <Col md='4' lg='2'>
                        <div className='d-flex flex-column' style={{ gap: '5px' }}>
                            <span style={{ fontSize: '14px', color: '#B5B5B5' }}> APR </span>
                            <div className='d-flex align-items-center'>
                                <span> 1000%</span>
                                {/**
                                <span> / </span>
                                <AiFillLock className='ml-2 mr-1' />
                                <span> 100%</span>
                                 */}
                            </div>
                        </div>
                    </Col>
                    <Col md='4' lg='2'>
                        <div className='d-flex flex-column' style={{ gap: '5px' }}>
                            <span style={{ fontSize: '14px', color: '#B5B5B5' }}> My Staked LP </span>
                            <span> 0 </span>
                        </div>
                    </Col>
                    <Col md='4' lg='2'>
                        <div className='d-flex flex-column' style={{ gap: '5px' }}>
                            <span style={{ fontSize: '14px', color: '#B5B5B5' }}> My Earned MEX </span>
                            <span> 0 </span>
                        </div>
                    </Col>
                    <Col lg='3'>
                        <div className='d-flex justify-content-center'>
                            <button className='farm-but' onClick={handleLPFarmHarvestAll}> Harvest all </button>
                            <button className='farm-but stake-but ml-4' onClick={() => setShowLPFarmModal(true)}> Stake LP </button>
                        </div>
                    </Col>
                </Row>
            </div>

            {/**
            <Modal
                isOpen={showStakingFarmModal}
                onRequestClose={() => {
                    setShowStakingFarmModal(false);
                }}
                ariaHideApp={false}
                className='farm-modalcard box-shadow'
                closeTimeoutMS={500}
            >
                <div className='d-flex align-items-center'>
                    <img src={BTXLogo} alt='btx logo' width={'36px'} />
                    <span style={{ fontSize: '20px', fontWeight: '600', marginLeft: '10px' }}>Stake in BTX farm</span>
                </div>

                <div style={{ marginTop: '30px' }}>
                    <input className='stake-input' placeholder='Amount to Stake' type='number' onChange={(e) => setStakingFarmStakeAmount(Number(e.target.value))} value={stakingFarmStakeAmount} />
                </div>

                <div className='d-flex mt-1' style={{ justifyContent: 'right', color: '#AEAEAE' }}>
                    <span>Balance:</span>
                    <span className='ml-2'>{BTXTotalBalance + ' BTX'}</span>
                </div>

                <div className='modal-divider mt-3' />
                <div className='mt-2'>
                    <AirbnbSlider
                        components={{ Thumb: AirbnbThumbComponent }}
                        getAriaLabel={(index) => (index === 0 ? 'Minimum price' : 'Maximum price')}
                        defaultValue={0}
                        marks={marks}
                        // step={25}
                        value={stakingFarmStakeAmount / BTXTotalBalance * 100}
                        onChange={(e, num) => handleStakingFarmSliderChange(num)}
                    // valueLabelDisplay="on"
                    />
                </div>

                <div className='d-flex align-items-center' style={{ marginLeft: '-15px', marginTop: '15px' }}>
                    <Checkbox
                        {...label}
                        id='lockRewards'
                        sx={{
                            color: 'gray',
                            marginTop: '-6px',
                            '&.Mui-checked': {
                                color: '#FEE277',
                            },
                        }}
                        onChange={(e) => setStakingFarmRelockState(e.target.checked)}
                    />
                    <label htmlFor='lockRewards' style={{ cursor: 'pointer' }}>
                        <div className='d-flex align-items-center'>
                            <AiFillLock className='mr-1' />
                            <span>Lock rewards for: <span style={{ color: '#00C4A7' }}>78% LKMEX</span> vs <span style={{ color: '#FEE277' }}>21% BTX</span></span>
                        </div>
                    </label>
                </div>

                <div className='farm-stake-info mt-2 d-flex align-items-center'>
                    <div>
                        <AiOutlineInfoCircle />
                    </div>
                    <span className='ml-3'>{"1% fee for withdrawing in the next 48h - 72h. Depositing or reinvesting resets the timer."}</span>
                </div>

                <div className='modal-divider mt-3' />
                <div className='d-flex justify-content-center mt-3'>
                    <button className='stake-modal-cancel-but' onClick={() => setShowStakingFarmModal(false)}>Cancel</button>
                    <button className='ml-3 stake-modal-ok-but' onClick={handleStakingFarmStakeClicked}>Stake</button>
                </div>
            </Modal>
 */}
            <Modal
                isOpen={showLPFarmModal}
                onRequestClose={() => {
                    setShowLPFarmModal(false);
                }}
                ariaHideApp={false}
                className='farm-modalcard box-shadow'
                closeTimeoutMS={500}
            >
                <div className='d-flex align-items-center'>
                    <div className='d-flex'>
                        <div>
                            <img src={BTXLogo} alt='BTX logo' width={'38px'} />
                        </div>

                        <div style={{ marginLeft: '-15px', marginTop: '20px' }}>
                            <img src={EGLDLogo} alt='EGLD logo' width={'38px'} />
                        </div>
                    </div>
                    <span style={{ fontSize: '20px', fontWeight: '600', marginLeft: '10px' }}>Stake in BTX-EGLD farm</span>
                </div>

                <div style={{ marginTop: '30px' }}>
                    <input className='stake-input' placeholder='Amount to Stake' type='number' onChange={(e) => setLPFarmStakeAmount(Number(e.target.value))} value={LPFarmStakeAmount} />
                </div>

                <div className='d-flex mt-1' style={{ justifyContent: 'right', color: '#AEAEAE' }}>
                    <span>Balance:</span>
                    <span className='ml-2'>{BTXTotalBalance + ' BTX'}</span>
                </div>

                <div className='modal-divider mt-3' />
                <div className='mt-2'>
                    <AirbnbSlider
                        components={{ Thumb: AirbnbThumbComponent }}
                        getAriaLabel={(index) => (index === 0 ? 'Minimum price' : 'Maximum price')}
                        defaultValue={0}
                        marks={marks}
                        value={LPFarmStakeAmount / BTXTotalBalance * 100}
                        onChange={(e, num) => handleLPFarmSliderChange(num)}
                    // step={25}
                    // valueLabelDisplay="on"
                    />
                </div>

                <div className='d-flex align-items-center' style={{ marginLeft: '-15px', marginTop: '15px' }}>
                    <Checkbox
                        {...label}
                        id='lockRewards'
                        sx={{
                            color: 'gray',
                            marginTop: '-6px',
                            '&.Mui-checked': {
                                color: '#FEE277',
                            },
                        }}
                        onChange={(e) => setLPFarmRelockState(e.target.checked)}
                    />
                    <label htmlFor='lockRewards' style={{ cursor: 'pointer' }}>
                        <div className='d-flex align-items-center'>
                            <AiFillLock className='mr-1' />
                            <span>Lock rewards for: <span style={{ color: '#00C4A7' }}>1000% LKMEX</span>{/**  vs <span style={{ color: '#FEE277' }}>21% BTX</span>*/}</span>
                        </div>
                    </label>
                </div>

                <div className='farm-stake-info mt-2 d-flex align-items-center'>
                    <div>
                        <AiOutlineInfoCircle />
                    </div>
                    <span className='ml-3'>{"1% fee for withdrawing in the next 48h - 72h. Depositing or reinvesting resets the timer."}</span>
                </div>

                <div className='modal-divider mt-3' />
                <div className='d-flex justify-content-center mt-3'>
                    <button className='stake-modal-cancel-but' onClick={() => setShowLPFarmModal(false)}>Cancel</button>
                    <button className='ml-3 stake-modal-ok-but' onClick={handleLPFarmStakeClicked}>Stake</button>
                </div>
            </Modal>
        </div>
    );
};

export default Farms;