import React, { useEffect, useState } from 'react';
import {
    refreshAccount,
    sendTransactions,
    useGetAccountInfo,
    useGetNetworkConfig,
    useGetPendingTransactions,
    transactionServices
} from '@elrondnetwork/dapp-core';
import {
    Address,
    AddressValue,
    AbiRegistry,
    SmartContractAbi,
    SmartContract,
    ProxyProvider,
    TypedValue,
    ArgSerializer,
    GasLimit,
    DefaultSmartContractController,
    U32Value,
    U64Value,
    BytesValue,
    BigUIntValue,
    TransactionPayload,
    Balance,
    ChainSendContext,
} from '@elrondnetwork/erdjs';

import Box from '@mui/material/Box';
import Step from '@mui/material/Step';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';
import { StepIconProps } from '@mui/material/StepIcon';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import { alpha, styled, createTheme, ThemeProvider } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';
import { Row, Col, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import finalLockLogo from 'assets/img/vesting/finallock.svg';
import vestinglogo from 'assets/img/vesting/vesting logo.svg';
import { Divider } from '@mui/material';
import AlertModal from 'components/AlertModal';
import { TOKENS } from 'data';

import {
    VESTING_CONTRACT_ADDRESS,
    VESTING_CONTRACT_ABI_URL,
    VESTING_CONTRACT_NAME,
    EGLD_WRAPPER_SC_ADDRESS,
} from 'config';
import {
    IContractInteractor,
    TIMEOUT,
    convertWeiToEsdt,
    convertEsdtToWei,
    SECOND_IN_MILLI,
    precisionFloor,
    convertTimestampToDateTime,
    getEsdtsOfAddress,
    isValidAddress,
    createListOfU64,
    getBalanceOfToken,
} from 'utils';
import { isValid, max } from 'date-fns';
import { convertWeiToEgld } from '../../utils/convert';

import './index.scss';

const outerTheme = createTheme({
    palette: {
        primary: {
            main: "#05AB76",
        },
    }
});

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
    const { account, address } = useGetAccountInfo();
    const { network } = useGetNetworkConfig();
    const { hasPendingTransactions } = useGetPendingTransactions();
    const provider = new ProxyProvider(network.apiAddress, { timeout: TIMEOUT });

    const [contractInteractor, setContractInteractor] = React.useState<IContractInteractor | undefined>();
    // load smart contract abi and parse it to SmartContract object for tx
    React.useEffect(() => {
        (async () => {
            const registry = await AbiRegistry.load({ urls: [`/${VESTING_CONTRACT_ABI_URL}`] });
            const abi = new SmartContractAbi(registry, [VESTING_CONTRACT_NAME]);
            const contract = new SmartContract({ address: new Address(VESTING_CONTRACT_ADDRESS), abi: abi });
            const controller = new DefaultSmartContractController(abi, provider);

            // console.log('contractInteractor', {
            //     contract,
            //     controller,
            // });

            setContractInteractor({
                contract,
                controller,
            });
        })();
    }, []); // [] makes useEffect run once

    const [lockSetting, setLockSetting] = React.useState<any>();
    React.useEffect(() => {
        (async () => {
            if (!contractInteractor) return;
            const interaction = contractInteractor.contract.methods.viewLockSetting();
            const res = await contractInteractor.controller.query(interaction);

            if (!res || !res.returnCode.isSuccess()) return;
            const value = res.firstValue.valueOf();

            const total_locked_token_ids = value.total_locked_token_ids.map((v: any) => v.toString());
            const total_locked_token_amounts = value.total_locked_token_amounts;
            const total_locked_tokens = [];
            let total_locked_value = 0;
            for (let i = 0; i < total_locked_token_ids.length; i++) {
                const token_id = total_locked_token_ids[i];
                const amount = convertWeiToEsdt(total_locked_token_amounts[i], TOKENS[token_id].decimals);

                total_locked_tokens.push({
                    ...TOKENS[token_id],
                    amount,
                });

                total_locked_value += amount * TOKENS[token_id].unit_price_in_usd;
            }
            total_locked_value = precisionFloor(total_locked_value);

            const total_lock_count = value.total_lock_count.toNumber();
            const wegld_token_id = value.wegld_token_id.toString();
            const wegld_min_fee = convertWeiToEsdt(value.wegld_min_fee);
            const wegld_base_fee = convertWeiToEsdt(value.wegld_base_fee);
            const lock_token_fee = value.lock_token_fee.toNumber() / 100;

            const lockSetting = {
                total_locked_tokens,
                total_lock_count,
                wegld_token_id,
                wegld_min_fee,
                wegld_base_fee,
                lock_token_fee,
                total_locked_value,
            };

            // console.log('lockSetting', lockSetting);
            setLockSetting(lockSetting);
        })();
    }, [contractInteractor]);

    const [egldBalance, setEgldBalance] = useState(0);
    const [wegldBalance, setWegldBalance] = useState(0);
    useEffect(() => {
        if (!account) return;
        setEgldBalance(convertWeiToEgld(account.balance));
    }, [account, hasPendingTransactions]);
    useEffect(() => {
        if (!account || !lockSetting) return;
        (async () => {
            setWegldBalance(await getBalanceOfToken(network.apiAddress, account, lockSetting.wegld_token_id));
        })();
    }, [account, lockSetting, hasPendingTransactions]);

    const steps = ['Select Your Token', 'Locking Token For', 'Organize Schedule', 'Finalize Your Lock'];
    const lockingTokensFor = ['Team', 'Marketing', 'Ecosystem', 'Advisor', 'Foundation', 'Development', 'Partnership', 'Investor', 'Other'];

    const navigate = useNavigate();

    const [activeStep, setActiveStep] = useState<number>(0);
    const handleChangeStep = (stepNum) => {
        if (!address || !lockSetting) return;

        if (stepNum == -1) {
            navigate('/bitlock');
        }

        if (stepNum >= 0 && stepNum <= 3) {
            if (activeStep == 0 && stepNum == 1) {
                if (ownedEsdts.length == 0) {
                    onShowAlertModal('You have no tokens');
                    return;
                }
            }
            if (activeStep == 1 && stepNum == 2) {
                if (!isValidAddress(selectedReceiverAddress)) {
                    onShowAlertModal('Invalid receiver address.');
                    return;
                }
                // if (lockName.trim().length == 0) {
                //     onShowAlertModal('Invalid lock name.');
                //     return;
                // }
            }

            if (activeStep == 2 && stepNum == 3) {
                if (lockAmount <= 0) {
                    onShowAlertModal('Invalid lock amount.');
                    return;
                }
                if (lockAmount > ownedEsdts[selectedTokenIndex].balance) {
                    onShowAlertModal('Not enough balance.');
                    return;
                }
                if (lockCount <= 0) {
                    onShowAlertModal('Invalid lock count.');
                    return;
                }

                let total_percentage = 0;
                for (let i = 0; i < lockCount; i++) {
                    total_percentage += lockList[i].percent;
                }

                if (total_percentage != 100) {
                    onShowAlertModal('Sum of percentages should be 100%.');
                    return;
                }
            }

            setActiveStep(stepNum);
        }

        if (stepNum > 3) {
            if (calculateWegldFee() > wegldBalance) {
                onShowAlertModal('Not enough WEGLD balance. Wrap your EGLD first.');
                return;
            }

            (
                async () => {
                    createBlock();
                }
            )();

            // setTimeout(() => {
            // navigate('/bitlock');
            // }, 10000);

        }
    };

    /** for select tokens */
    const [selectedTokenIndex, setSelectedTokenIndex] = useState<number>(0);
    const handleSelectTokenId = (token_id) => {
        setSelectedTokenIndex(token_id);
    };

    /** step 2 Locking Tokens for */

    // switch state
    const [switchLockingTokensForchecked, setLockingTokensForChecked] = React.useState(false);
    const handleSwtichLockingTokensForChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLockingTokensForChecked(event.target.checked);
    };

    // select why u lock tokens
    const [selectedLockingTokensForID, setLockingTokensForID] = React.useState<number>(0);
    const handleSelectTokensFor = (index) => {
        setLockingTokensForID(index);
    };

    // set lock
    const [lockList, setLockList] = useState([]);
    const [lockAmount, setLockAmount] = useState<number | undefined>();
    const [lockCount, setLockCount] = useState<number | undefined>();

    ///////////////////////////////
    const [ownedEsdts, setOwnedEsdts] = useState<any>([]);
    useEffect(() => {
        (async () => {
            if (!address) return;
            let ownedEsdts = await getEsdtsOfAddress(network.apiAddress, account);
            ownedEsdts = ownedEsdts.filter(v => !!TOKENS[v.identifier]);
            // console.log('ownedEsdts', ownedEsdts);
            setOwnedEsdts(ownedEsdts);
        })();
    }, [address, hasPendingTransactions]);

    const handleChangeDate = (index, date) => {
        const updatedList = lockList.map((item, id) => {
            if (index == id) {
                return { ...item, date: date };
            }
            return item;
        });

        setLockList(updatedList);
    };

    const handleChangePercent = (index, percent) => {
        if (percent > 100) {
            console.log("should below 100");
            return;
        }
        percent = Math.floor(percent);

        const updatedList = lockList.map((item, id) => {
            if (index == id) {
                return { ...item, percent: percent == 0 ? undefined : percent };
            }
            return item;
        });

        setLockList(updatedList);
    };

    function onChangeLockAmount(v: any) {
        const newLockAmount = Number(v);
    }

    // const [lockName, setLockName] = useState<string>('');

    const [selectedReceiverAddress, setSelectedReceiverAddress] = useState<string>(address);
    useEffect(() => {
        setSelectedReceiverAddress(switchLockingTokensForchecked ? '' : address);
    }, [switchLockingTokensForchecked]);

    function onChangeLockCount(e) {
        let newLockCount = 0;
        try {
            newLockCount = Number(e.target.value);
        } catch (e) {
            onShowAlertModal('Invalid number.');
            return;
        }

        const oldLockCount = lockCount;
        const now = new Date();
        const release = {
            date: new Date(now.setMonth(now.getMonth() + 1)),
            percent: 0
        };

        const tmpLockList = [];
        for (let i = 0; i < newLockCount; i++) {
            if (i < oldLockCount) {
                tmpLockList.push(lockList[i]);
            } else {
                tmpLockList.push(release);
            }
        }

        if (newLockCount == 0) {
            setLockCount(undefined);
        } else {
            setLockCount(newLockCount);
        }

        setLockList(tmpLockList);
    }

    async function createBlock() {
        if (!address || !ownedEsdts || !lockSetting) return;

        const releaseRimestamps = lockList.map(v => Math.floor(v.date.getTime() / 1000));
        const releasePercentages = lockList.map(v => v.percent * 100);
        // console.log('releaseRimestamps', releaseRimestamps);
        // console.log('releasePercentages', releasePercentages);

        const args: TypedValue[] = [
            new AddressValue(new Address(VESTING_CONTRACT_ADDRESS)),	// tx receiver address
            new U32Value(2),	// number of tokens to send
            BytesValue.fromUTF8(ownedEsdts[selectedTokenIndex].identifier),
            new U64Value(0),	// nonce
            new BigUIntValue(convertEsdtToWei(lockAmount, ownedEsdts[selectedTokenIndex].decimals)),
            BytesValue.fromUTF8(lockSetting.wegld_token_id),
            new U64Value(0),	// nonce
            new BigUIntValue(convertEsdtToWei(calculateWegldFee())),
            BytesValue.fromUTF8('createLock'),
            new AddressValue(new Address(selectedReceiverAddress)),	// lock receiver address
            BytesValue.fromUTF8(''),
            BytesValue.fromUTF8(lockingTokensFor[selectedLockingTokensForID]),
            createListOfU64(releaseRimestamps),
            createListOfU64(releasePercentages),
        ];
        const { argumentsString } = new ArgSerializer().valuesToString(args);
        const data = `MultiESDTNFTTransfer@${argumentsString}`;

        const tx = {
            receiver: address,
            gasLimit: new GasLimit(10000000),
            data: data,
        };

        await refreshAccount();
        const result = await sendTransactions({
            transactions: tx,
        });

        // console.log(result.sessionId);
        setSessionId(result.sessionId);
    }

    /** token lock success? */
    const [sessionId, setSessionId] = useState<string>('');
    const transactionStatus = transactionServices.useTrackTransactionStatus({
        transactionId: sessionId,
        // onSuccess: () => { console.log("success"); },
        // onCompleted: () => { console.log("completed"); },
        // onFail: () => { console.log("failed"); },
        // onCancelled: () => { console.log("cancelled"); },
        // onTimedOut: () => { console.log("time out"); }
    });
    useEffect(() => {
        if (transactionStatus.isSuccessful) {
            // console.log("isSuccessful");
            setTokenLockState(true);
        }
    }, [sessionId, hasPendingTransactions]);

    const [tokenLockSuccess, setTokenLockState] = useState<boolean>(false);
    /* ****************************************************************************** */
    function calculateWegldFee() {
        return Math.max(lockSetting.wegld_min_fee, lockSetting.wegld_base_fee * lockCount);
    }

    ///////////////////////////////////////////////////////////////////
    const [alertModalShow, setAlertModalShow] = React.useState<boolean>(false);
    const [alertModalText, setAlertModalText] = React.useState<string>('');
    function onShowAlertModal(text: string) {
        setAlertModalText(text);
        setAlertModalShow(true);
    }

    /** wrap egld modal */
    const [showWrapEgldModal, setShowWrapEgldModal] = useState(false);
    const [wrapEgldAmount, setWrapEgldAmount] = useState<number>(0);
    const handleClickWrapMaxBut = () => {
        setWrapEgldAmount(egldBalance);
    };
    const handleClickWrapBut = () => {
        if (wrapEgldAmount <= 0) {
            onShowAlertModal('Invalid amount.');
            return;
        } else if (wrapEgldAmount > egldBalance) {
            onShowAlertModal('Not enough balance.');
            return;
        }

        wrapEgld();
        setShowWrapEgldModal(false);
    };

    async function wrapEgld() {
        if (!address) return;

        const tx = {
            receiver: EGLD_WRAPPER_SC_ADDRESS,
            gasLimit: new GasLimit(6000000),
            data: 'wrapEgld',
            value: Balance.egld(wrapEgldAmount),
        };

        await refreshAccount();
        sendTransactions({
            transactions: tx,
        });
    }

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
                                    <p className="step-title">{steps[0]}</p>
                                    <div className="d-flex justify-content-center">
                                        <Dropdown className="w-50" onSelect={handleSelectTokenId} drop='down' style={{ width: "150px" }}>
                                            <Dropdown.Toggle className='token-id-toggle' id="token-id">
                                                {
                                                    <>
                                                        <span>{ownedEsdts.length && ownedEsdts[selectedTokenIndex].ticker}</span>
                                                        <img src={ownedEsdts.length && ownedEsdts[selectedTokenIndex].logo} />
                                                    </>
                                                }
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu className='token-id-menu'>
                                                {
                                                    ownedEsdts.length && ownedEsdts.map((token, index) => (
                                                        <Dropdown.Item eventKey={index} key={`token-id-menu-item-${token.identifier}`}>
                                                            <span>{token.ticker}</span>
                                                            <img src={token.logo} />
                                                        </Dropdown.Item>
                                                    ))
                                                }
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                    <p className="step-title mt-3">Token Found</p>
                                    <Row>
                                        <Col xs="12" sm="6">
                                            <div className="token-info">
                                                <span> {"Token Identifier : "}</span>
                                                <span> {ownedEsdts.length && ownedEsdts[selectedTokenIndex].identifier} </span>
                                            </div>
                                        </Col>
                                        <Col xs="12" sm="6">
                                            <div className="token-info">
                                                <span> {"Token Ticker : "}</span>
                                                <span> {ownedEsdts.length && ownedEsdts[selectedTokenIndex].ticker} </span>
                                            </div>
                                        </Col>
                                        <Col xs="12" sm="6">
                                            <div className="token-info">
                                                <span> {"Token Decimals: "}</span>
                                                <span> {ownedEsdts.length && ownedEsdts[selectedTokenIndex].decimals} </span>
                                            </div>
                                        </Col>
                                        <Col xs="12" sm="6">
                                            <div className="token-info">
                                                <span> {"Your Balance : "}</span>
                                                <span> {ownedEsdts.length && ownedEsdts[selectedTokenIndex].balance} </span>
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
                                        <p className="step-title" style={{ alignItems: "center" }}>{steps[1]}</p>
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
                                    <input className='bitlock-input w-100' value={selectedReceiverAddress} onChange={(e) => setSelectedReceiverAddress(e.target.value)} />

                                    {/* <div className="mt-3">
                                        <p className="step-title">Lock Name</p>
                                        <input className='bitlock-input w-100' value={lockName} onChange={(e) => setLockName(e.target.value)} />
                                    </div> */}
                                    <div>{!isValidAddress(selectedReceiverAddress) && 'Invalid address.'}</div>
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
                                    <p className="step-title">{steps[2]}</p>

                                    <Row className="mt-3">
                                        <Col lg="6">
                                            <Row className="lock-mini-box d-flex align-items-center ml-1 mr-1">
                                                <span>Lock Amount</span>
                                                <div className="d-flex ml-auto">
                                                    <input className='bitx-input' type="text" value={lockAmount} onChange={(e) => setLockAmount(Number(e.target.value))} />
                                                    <div className="token-ticker">{ownedEsdts.length && ownedEsdts[selectedTokenIndex].ticker}</div>
                                                </div>
                                                <span className='ml-auto'>Balance: {ownedEsdts.length && ownedEsdts[selectedTokenIndex].balance}</span>
                                                <div className="max-but ml-auto" onClick={() => setLockAmount(ownedEsdts.length && ownedEsdts[selectedTokenIndex].balance)}>max</div>
                                            </Row>
                                        </Col>

                                        <Col lg="6">
                                            <div className="lock-mini-box d-flex align-items-center ml-1 mr-1">
                                                <span>Lock Count</span>
                                                <input className='bitlock-input ml-3' type="text" style={{ borderRadius: "5px", width: "80%" }} onChange={onChangeLockCount} defaultValue={lockCount} />
                                            </div>
                                        </Col>

                                        {
                                            lockList.map((row, index) => {
                                                // console.log(row);
                                                return (
                                                    <Col md="4" key={index}>
                                                        <div className="lock-state-box">
                                                            <div className="d-flex align-items-center">
                                                                <div className="w-50">
                                                                    <span>Release Date</span>
                                                                </div>
                                                                <div className="w-50">
                                                                    <ThemeProvider theme={outerTheme}>
                                                                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                                            <MobileDateTimePicker
                                                                                value={row.date}
                                                                                onChange={(newValue) => {
                                                                                    handleChangeDate(index, newValue);
                                                                                }}
                                                                                renderInput={(params) => <TextField {...params} />}
                                                                            />
                                                                        </LocalizationProvider>
                                                                    </ThemeProvider>
                                                                </div>
                                                            </div>

                                                            <div className="mt-2 d-flex align-items-center">
                                                                <div className="w-50">
                                                                    <span>Relase Percent</span>
                                                                </div>
                                                                <div className="w-50">
                                                                    <input className='bitlock-input w-100' type="text" onChange={(e) => handleChangePercent(index, Number(e.target.value))} defaultValue={row.percent} />
                                                                </div>
                                                            </div>

                                                            <div className="mt-3 d-flex">
                                                                <div className="w-50">
                                                                    <span>Release Amount</span>
                                                                </div>
                                                                <div className="w-50">
                                                                    <span>{lockSetting && (lockAmount * row.percent / 100 * (100 - lockSetting.lock_token_fee) / 100)} {ownedEsdts.length > 0 && ownedEsdts[selectedTokenIndex].ticker}</span>
                                                                </div>
                                                            </div>

                                                            <div className="mt-3 d-flex">
                                                                <div className="w-50">
                                                                    <span>Token Fee</span>
                                                                </div>
                                                                <div className="w-50">
                                                                    <span>{lockSetting && lockSetting.lock_token_fee} %</span>
                                                                </div>
                                                            </div>

                                                            <div className="mt-3 d-flex">
                                                                <div className="w-50">
                                                                    <span>Release Value</span>
                                                                </div>
                                                                <div className="w-50">
                                                                    <span>${lockSetting && (lockAmount * row.percent / 100 * (100 - lockSetting.lock_token_fee) / 100 * (TOKENS[ownedEsdts[selectedTokenIndex].identifier] ? TOKENS[ownedEsdts[selectedTokenIndex].identifier].unit_price_in_usd : 0))}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Col>
                                                );
                                            })
                                        }

                                    </Row>
                                </>
                            )
                        }

                        {
                            activeStep == 3 && !tokenLockSuccess && (
                                <>
                                    <div className='d-flex justify-content-between'>
                                        <p className="step-title">{steps[3]}</p>
                                        <div>
                                            <span>Total Lock Amount: </span>
                                            <span style={{ color: "#05ab76" }}>{lockAmount} {ownedEsdts.length > 0 && ownedEsdts[selectedTokenIndex].ticker}</span>
                                        </div>
                                    </div>
                                    <Table className="text-center mt-3" style={{ color: "#ACACAC" }}>
                                        <Thead>
                                            <Tr>
                                                <Th>Release Date</Th>
                                                <Th>Release Percent</Th>
                                                <Th>Release Amount</Th>
                                                <Th>Token Fee</Th>
                                                <Th>Release Value</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>

                                            {
                                                lockList.map((row, index) => {
                                                    // console.log(row);
                                                    return (
                                                        <Tr key={index}>
                                                            <Td>
                                                                {
                                                                    new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(row.date)
                                                                }
                                                            </Td>
                                                            <Td>{row.percent}</Td>
                                                            <Td>{lockSetting && (lockAmount * row.percent / 100 * (100 - lockSetting.lock_token_fee) / 100)} {' '}  {ownedEsdts.length > 0 && ownedEsdts[selectedTokenIndex].ticker}</Td>
                                                            <Td>{lockSetting && lockSetting.lock_token_fee} %</Td>
                                                            <Td>${lockSetting && (lockAmount * row.percent / 100 * (100 - lockSetting.lock_token_fee) / 100 * (TOKENS[ownedEsdts[selectedTokenIndex].identifier] ? TOKENS[ownedEsdts[selectedTokenIndex].identifier].unit_price_in_usd : 0))}</Td>
                                                        </Tr>
                                                    );
                                                })
                                            }
                                        </Tbody>
                                    </Table>

                                    <div className='mt-2 d-flex text-center justify-content-center align-items-center'>
                                        <div className="wrapegld-but" onClick={() => setShowWrapEgldModal(true)}>Wrap Egld</div>
                                    </div>
                                </>
                            )
                        }

                        {
                            activeStep == 3 && tokenLockSuccess && (
                                <>
                                    <Row className="align-items-center text-center">
                                        <Col sm="4">
                                            <span className="final-lock-text-token">Token</span>
                                        </Col>
                                        <Col sm="4">
                                            <img className="final-token-logo-animation" src={finalLockLogo} alt="final bit lock" style={{ width: "60%" }} />
                                        </Col>
                                        <Col sm="4">
                                            <span className="final-lock-text-locked">Locked</span>
                                        </Col>
                                    </Row>
                                </>
                            )
                        }

                        <div className='mt-2 text-center justify-content-center align-items-center'>
                            {
                                tokenLockSuccess ? (
                                    <div className="d-flex align-items-center justify-content-center mt-5 mb-4" >
                                        <div className="step-but" onClick={() => { navigate('/bitlock'); }}>go home</div>
                                    </div>
                                ) : (
                                    <div className="d-flex align-items-center justify-content-center" >
                                        <div className="step-but" onClick={() => handleChangeStep(activeStep - 1)}>Back</div>
                                        <img src={vestinglogo} alt="elrond vesting" />
                                        <div className="step-but" onClick={() => handleChangeStep(activeStep + 1)}>{activeStep == 3 ? 'Lock' : 'Next'}</div>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </Box>
            </div >

            <Modal
                isOpen={showWrapEgldModal}
                onRequestClose={() => {
                    setShowWrapEgldModal(false);
                }}
                ariaHideApp={false}
                className='wrapmodalcard box-shadow'
            >
                <div className='modaldiv'>
                    <h3 className='modalHeader' style={{ fontSize: "20px" }}>
                        Wrap Egld
                    </h3>
                </div>
                <div className="d-flex">
                    <input className="bitx-input" type="number" placeholder="input egld amount" style={{ width: "80%" }} value={wrapEgldAmount} onChange={(e) => setWrapEgldAmount(Number(e.target.value))} />
                    <div className="egld-max-but text-center" style={{ width: "20%" }} onClick={handleClickWrapMaxBut}>
                        max
                    </div>
                </div>
                <div className='modal-divider mt-2' />
                <div className="d-flex justify-content-between p-1 mt-2">
                    <div>
                        <span>EGLD Balance : </span>
                        <span style={{ color: '#FEE277' }}>{egldBalance}</span>
                    </div>
                    <div>
                        <span>WEGLD Fee: </span>
                        <span style={{ color: '#FEE277' }}>{lockSetting ? calculateWegldFee() : '-'}</span>
                    </div>
                </div>
                <div className="d-flex justify-content-between p-1 mt-2">
                    <div>
                        <span>WEGLD Balance : </span>
                        <span style={{ color: '#FEE277' }}>{wegldBalance}</span>
                    </div>
                    <div>
                        <span>Need WEGLD : </span>
                        <span style={{ color: '#FEE277' }}>{lockSetting ? ((calculateWegldFee() - wegldBalance) > 0 ? (calculateWegldFee() - wegldBalance) : 0) : '-'}</span>
                    </div>
                </div>
                <div className='modal-divider mt-2' />
                <div className="d-flex text-center justify-content-center mt-3">
                    <div className='wrapegld-but' onClick={handleClickWrapBut}> WRAP </div>
                </div>

            </Modal>
            <AlertModal
                show={alertModalShow}
                onHide={() => setAlertModalShow(false)}
                alertmodaltext={alertModalText}
            />
        </>
    );
};

export default CreateVesting;