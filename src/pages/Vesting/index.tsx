import React, { useState, useEffect } from 'react';
import { alpha, styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import { Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';

import {
    refreshAccount,
    sendTransactions,
    useGetAccountInfo,
    useGetNetworkConfig,
    useGetPendingTransactions,
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
} from '@elrondnetwork/erdjs';

import BitlockImg from 'assets/img/vesting/Bitlock Img.svg';
import Symbol1 from 'assets/img/vesting/Symbol for Locked Token Value.png';
import Symbol2 from 'assets/img/vesting/Symbol for Locked Tokens.png';
import Symbol3 from 'assets/img/vesting/Symbol for Lockers.png';
import { routeNames } from 'routes';
import { TOKENS, vestingListHeader } from 'data';

import {
    VESTING_CONTRACT_ADDRESS,
    VESTING_CONTRACT_ABI_URL,
    VESTING_CONTRACT_NAME,
} from 'config';
import {
    IContractInteractor,
    TIMEOUT,
    convertWeiToEsdt,
    convertEsdtToWei,
    SECOND_IN_MILLI,
    precisionFloor,
    convertTimestampToDateTime,
} from 'utils';

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
    const { address } = useGetAccountInfo();
    const { network } = useGetNetworkConfig();
    const { hasPendingTransactions } = useGetPendingTransactions();
    const provider = new ProxyProvider(network.apiAddress, { timeout: TIMEOUT });

    const [contractInteractor, setContractInteractor] = React.useState<IContractInteractor | undefined>();
    // load smart contract abi and parse it to SmartContract object for tx
    React.useEffect(() => {
        (async () => {
            const registry = await AbiRegistry.load({ urls: [VESTING_CONTRACT_ABI_URL] });
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

    const [locks, setLocks] = React.useState<any>([]);
    React.useEffect(() => {
        (async () => {
            if (!contractInteractor) return;
            const interaction = contractInteractor.contract.methods.viewLocks();
            const res = await contractInteractor.controller.query(interaction);

            if (!res || !res.returnCode.isSuccess()) return;
            const values = res.firstValue.valueOf();

            // console.log(values);

            const locks = [];
            for (let i = 0; i < values.length; i++) {
                const value = values[i];

                const lock_id = value.lock_id.toNumber();
                const locker_address = value.locker_address.toString();
                const receiver_address = value.receiver_address.toString();
                const lock_name = value.lock_name.toString();
                const lock_purpose = value.lock_purpose.toString();
                const lock_token_id = value.lock_token_id.toString();
                const lock_token_amount = convertWeiToEsdt(value.lock_token_amount, TOKENS[lock_token_id].decimals);

                const lock_release_count = value.lock_release_count.toNumber();
                const lock_release_timestamps = value.lock_release_timestamps.map((v: any) => v.toNumber() * SECOND_IN_MILLI);
                const lock_release_percentages = value.lock_release_percentages.map((v: any) => v.toNumber() / 100);
                const lock_release_amounts = value.lock_release_amounts.map((v: any) => convertWeiToEsdt(v, TOKENS[lock_token_id].decimals));

                const lock_left_release_count = value.lock_left_release_count.toNumber();
                const lock_left_claimable_release_count = value.lock_left_claimable_release_count.toNumber();

                //
                const unit_price_in_usd = TOKENS[lock_token_id].unit_price_in_usd;
                const total_value = precisionFloor(lock_release_amounts.reduce((a, b) => a + b, 0) * unit_price_in_usd);

                const next_release_timestamp = lock_left_release_count > 0 ? lock_release_timestamps[lock_release_count - lock_left_release_count - 1] : 0;

                if (lock_token_id == 'BTX-48d004') continue;

                locks.push({
                    lock_id,
                    locker_address,
                    receiver_address,
                    lock_name,
                    lock_purpose,
                    lock_token_id,
                    lock_token_amount,
                    lock_release_count,
                    lock_release_timestamps,
                    lock_release_percentages,
                    lock_release_amounts,
                    lock_left_release_count,
                    lock_left_claimable_release_count,

                    unit_price_in_usd,
                    total_value,
                    next_release_timestamp,
                });
            }

            // console.log('locks', locks);
            setLocks(locks);
        })();
    }, [contractInteractor]);

    /** switch view type (must filter by locker address) */
    const [switchViewType, setSwitchViewType] = useState(false);
    const handleSwitchViewType = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSwitchViewType(event.target.checked);
    };
    useEffect(() => {
        filterVestingList();
    }, [switchViewType]);

    /** click view button (must navigate to bitlock/vault vesting/0x...) */
    const navigate = useNavigate();
    const handleClickView = (lock_id) => {
        navigate(`/bitlock/vault-vesting/${lock_id}`);
    };

    /** filter vesting list (should filter by search text)*/
    const [vestingList, setVestingList] = useState([]);
    const [searchText, setSearchText] = useState("");
    useEffect(() => {
        filterVestingList();
    }, [searchText]);

    useEffect(() => {
        filterVestingList();
    }, [locks]);

    const [filteredLocks, setFilteredLocks] = React.useState<any>([]);
    const filterVestingList = () => {
        // let filterResult = data.vestingList;
        // if (switchViewType) { // Track My locks
        //     filterResult = filterResult.filter(d => d.Locker_Address === my_address);
        // }
        // filterResult = filterResult.filter(d => d.Name.includes(searchText) || d.Locker_Address.includes(searchText));
        // setVestingList(filterResult);

        let filteredLocks = locks;
        if (switchViewType) {
            filteredLocks = filteredLocks.filter(v => v.locker_address == address);
        }
        if (searchText.length > 0) {
            const key = searchText.trim().toLowerCase();
            filteredLocks = filteredLocks.filter(d => d.locker_address.toLowerCase().includes(key) || d.receiver_address.toLowerCase().includes(key) || d.lock_name.toLowerCase().includes(key) || d.lock_purpose.toLowerCase().includes(key) || d.lock_token_id.toLowerCase().includes(key));
        }

        setFilteredLocks(filteredLocks);
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
                            <p className="description-body text-left">{"BitLock allows for token locking and vesting on the Elrond Network. The tokens will be locked within a specially designed time elapsing smart contract. The locked tokens cannot be withdrawn until the token team's designated period of locking is met. BitLock allows for all ESDT tokens and LP tokens including EGLD to be locked or vested."}</p>

                            <p className="text-left" style={{ color: "#707070" }}>
                                We would like to highlight that the BitX team will not be able to withdraw tokens locked within our own platform, this is due to the manner of the smart contract locking mechanism that we have designed. The only way the locked tokens can be withdrawn are as follows: <br />
                                1. By the wallet address owner who locked the tokens in the SC. <br />
                                2. Unlocking is only possible once the elapsed timing mechanism reaches the agreed locking period set by the team or authorized wallet holder. <br />
                                3. Only once both criteria have been met can the tokens be withdrawn.
                            </p>
                        </div>

                        <Row className="mt-5">
                            <Col xs="4">
                                <div className="">
                                    <img className="w-75" src={Symbol1} alt="Locked Token Value" />
                                    <p className="mt-3 mb-1" style={{ color: "#D1D1D1" }}>${lockSetting ? lockSetting.total_locked_value : '-'}</p>
                                    <span style={{ color: "#D1D1D1" }}>Locked Token Value</span>
                                </div>
                            </Col>
                            <Col xs="4">
                                <div className="">
                                    <img className="w-75" src={Symbol2} alt="Locked Token Value" />
                                    <p className="mt-3 mb-1" style={{ color: "#D1D1D1" }}>{lockSetting ? lockSetting.total_locked_tokens.length : '-'}</p>
                                    <span style={{ color: "#D1D1D1" }}>Locked Tokens</span>
                                </div>
                            </Col>
                            <Col xs="4">
                                <div className="">
                                    <img className="w-75" src={Symbol3} alt="Locked Token Value" />
                                    <p className="mt-3 mb-1" style={{ color: "#D1D1D1" }}>{lockSetting ? lockSetting.total_lock_count : '-'}</p>
                                    <span style={{ color: "#D1D1D1" }}>Number Of Locks</span>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Col>
            </Row>

            <div className="bitlock-vesting-list-box mt-5 mb-5">
                <p className="text-center" style={{ fontSize: "20px", fontWeight: "500", color: "#D3D3D3" }}>Search A Smart Lock Address</p>

                <Row className="text-center justify-content-center">
                    <input className='bitx-input w-75' style={{ background: "#191A1E", borderRadius: "5px" }} placeholder="Search a smart lock by name/contract address" onChange={(e) => setSearchText(e.target.value)} />
                    <Link to={routeNames.createvesting}>
                        <div className="create-vesting-but ml-3">lock / vest tokens</div>
                    </Link>
                    {/* {
                        address ? (
                        <Link to={routeNames.createvesting}>
                            <div className="create-vesting-but ml-3">Create Vesting</div>
                        </Link>) : (
                        <Link to={routeNames.unlock}>
                            <div className="create-vesting-but ml-3">Connect Your Wallet</div>
                        </Link>
                        )
                    } */}
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
                                vestingListHeader.map((row, index) => {
                                    return (
                                        <Th key={index}>{row}</Th>
                                    );
                                })
                            }
                        </Tr>
                    </Thead>
                    <Tbody>

                        {
                            // vestingList.map((row, index) => {
                            //     return (
                            //         <Tr key={index}>
                            //             <Td>{row.Name}</Td>
                            //             <Td>{row.Token_Identifier}</Td>
                            //             <Td>{row.Token_Amount}</Td>
                            //             <Td>{row.Token_Value}</Td>
                            //             <Td>{row.Total_Value}</Td>
                            //             <Td>{row.Next_Relase}</Td>
                            //             <Td><div className="view-but" onClick={() => handleClickView(row.Locker_Address)}>view</div></Td>
                            //         </Tr>
                            //     );
                            // })
                            filteredLocks && filteredLocks.map((lock, index) => {
                                return (
                                    <Tr key={`home-list-${index}`}>
                                        {/* <Td>{lock.lock_name}</Td> */}
                                        <Td className="d-flex text-left align-items-center">
                                            <div style={{ width: "30%", textAlign: "right" }}>
                                                <img src={lock && TOKENS[lock.lock_token_id].logo} style={{
                                                    width: '2rem',
                                                    marginRight:"10px"
                                                }} alt="BTX" />
                                            </div>
                                            <div style={{ width: "70%" }}>
                                                {
                                                    lock.lock_token_id
                                                }
                                            </div>
                                        </Td>
                                        <Td>{lock.lock_token_amount} {lock.lock_token_id.split('-')[0]}</Td>
                                        <Td>$ {lock.unit_price_in_usd}</Td>
                                        <Td>$ {lock.total_value}</Td>
                                        <Td>{lock.next_release_timestamp > 0 ? convertTimestampToDateTime(lock.next_release_timestamp) : '-'}</Td>
                                        <Td><div className="view-but" onClick={() => handleClickView(lock.lock_id)}>view</div></Td>
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