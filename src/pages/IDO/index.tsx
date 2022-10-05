/* eslint-disable import/order */
import React, { useEffect, useState } from "react";
import { Row, Col } from 'react-bootstrap';
import Marquee from "react-fast-marquee";
import { IoGrid, IoList } from "react-icons/io5";
import { useNavigate, Link } from 'react-router-dom';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import DropdownList from "react-widgets/DropdownList";
import IDOImg from 'assets/img/IDO.png';
import './index.scss';
import IDOCard from 'components/Card/IDOCard';
import { advertising_data } from './data';
import "react-widgets/styles.css";
import {
    refreshAccount,
    sendTransactions,
    useGetAccountInfo,
    useGetNetworkConfig,
    useGetPendingTransactions,
} from '@elrondnetwork/dapp-core';
import {
    Address,
    AbiRegistry,
    SmartContractAbi,
    SmartContract,
    DefaultSmartContractController,
    Balance,
    Interaction,
    ProxyProvider,
    GasLimit,
    ContractFunction,
    U32Value,
    ArgSerializer,
    OptionalValue,
    TypedValue,
    BytesValue,
    BigUIntValue,
    TransactionPayload,
    AddressValue,
    BooleanValue,
} from '@elrondnetwork/erdjs';
import {
    IDO_CONTRACT_ABI_URL,
    IDO_CONTRACT_NAME,
    IDO_CONTRACT_ADDRESS,
} from 'config';
import {
    TIMEOUT,
    SECOND_IN_MILLI,
    convertWeiToEsdt,
} from 'utils';
import { swtichSocialIcon } from 'utils/social';
import moment from 'moment';
import { ProgressBar } from 'react-bootstrap';
import { IoRocketOutline } from "react-icons/io5";
import Countdown from 'react-countdown';
import { routeNames } from 'routes';
// import { useDispatch, useSelector } from 'react-redux';
// import * as selectors from 'store/selectors';
// import { fetchIDOPools } from "store/actions/thunks/IDO";

const table_headers = [
    "Name",
    "Identifier",
    "Amount",
    "Price",
    "Status",
    "Social Links",
    "Countdown",
    "Action"
];

const IDOLaunchpad = () => {
    const { address } = useGetAccountInfo();
    const { hasPendingTransactions } = useGetPendingTransactions();
    const { network } = useGetNetworkConfig();
    const isLoggedIn = Boolean(address);
    const provider = new ProxyProvider(network.apiAddress, { timeout: TIMEOUT });
    const [displayMode, setDisplayMode] = useState<boolean>(false);

    // const dispatch = useDispatch();
    // const IDOState = useSelector(selectors.IDOState);
    // const pools_list = IDOState.poolLists.data;
    // useEffect(() => {
    //     dispatch(fetchIDOPools());
    // }, []);

    // load smart contract abi and parse it to SmartContract object for tx
    const [idoContractInteractor, setIdoContractInteractor] = useState<any>(undefined);
    useEffect(() => {
        (async () => {
            const registry = await AbiRegistry.load({ urls: [IDO_CONTRACT_ABI_URL] });
            const abi = new SmartContractAbi(registry, [IDO_CONTRACT_NAME]);
            const contract = new SmartContract({ address: new Address(IDO_CONTRACT_ADDRESS), abi: abi });
            const controller = new DefaultSmartContractController(abi, provider);

            setIdoContractInteractor({
                contract,
                controller,
            });
        })();
    }, []); // [] makes useEffect run once

    const [projects, setProjects] = useState<any>([]);
    useEffect(() => {
        (async () => {
            if (!idoContractInteractor || !isLoggedIn) return;

            const args = [
                new BooleanValue(true),
            ];
            const interaction = idoContractInteractor.contract.methods.getProjects(args);
            const res = await idoContractInteractor.controller.query(interaction);

            if (!res || !res.returnCode.isSuccess()) return;
            const value = res.firstValue.valueOf();

            const datas: any = [];
            value.map((item: any) => {
                const token_decimal = item.project_presale_token_decimal.toNumber();
                const data = {
                    project_id: item.project_id.toNumber(),
                    project_owner: item.project_owner.toString(),
                    project_presale_token_identifier: item.project_presale_token_identifier.toString(),
                    project_fund_token_identifier: item.project_fund_token_identifier.toString(),
                    project_fee_option_id: item.project_fee_option_id.toNumber(),
                    project_presale_rate: convertWeiToEsdt(item.project_presale_rate, token_decimal),
                    project_create_time: item.project_create_time.toNumber() * SECOND_IN_MILLI,
                    project_soft_cap: convertWeiToEsdt(item.project_soft_cap, 18),
                    project_hard_cap: convertWeiToEsdt(item.project_hard_cap, 18),
                    project_min_buy_limit: convertWeiToEsdt(item.project_min_buy_limit, 18),
                    project_max_buy_limit: convertWeiToEsdt(item.project_max_buy_limit, 18),
                    project_maiar_liquidity_percent: item.project_maiar_liquidity_percent.toNumber() / 100,
                    project_maiar_listing_rate: convertWeiToEsdt(item.project_maiar_listing_rate, token_decimal),
                    project_presale_start_time: item.project_presale_start_time.toNumber() * SECOND_IN_MILLI,
                    project_presale_end_time: item.project_presale_end_time.toNumber() * SECOND_IN_MILLI,
                    project_liquidity_lock_timestamp: item.project_liquidity_lock_timestamp.toNumber() * SECOND_IN_MILLI,
                    project_description: item.project_description.toString(),
                    project_social_telegram: item.project_social_telegram.toString(),
                    project_social_website: item.project_social_website.toString(),
                    project_social_twitter: item.project_social_twitter.toString(),
                    project_social_youtube: item.project_social_youtube.toString(),
                    project_social_discord: item.project_social_discord.toString(),
                    project_social_linkedin: item.project_social_linkedin.toString(),
                    project_social_medium: item.project_social_medium.toString(),
                    project_total_bought_amount_in_egld: convertWeiToEsdt(item.project_total_bought_amount_in_egld, 18),
                    project_total_bought_amount_in_esdt: convertWeiToEsdt(item.project_total_bought_amount_in_esdt, token_decimal),
                    project_is_lived: item.project_is_lived,
                    project_presale_token_decimal: token_decimal,
                    project_presale_token_name: item.project_presale_token_name.toString(),
                    project_presale_percentage: convertWeiToEsdt(item.project_total_bought_amount_in_egld, 18) * 100 / convertWeiToEsdt(item.project_hard_cap, 18),
                };
                datas.push(data);
            });
            setProjects(datas);
            setFilteredProjects(datas);
        })();
    }, [idoContractInteractor, hasPendingTransactions]);

    const navigate = useNavigate();
    const handleIDONavigate = (project_id) => {
        navigate(`/ido-detail/${project_id}`);
    };

    const getTokenNameFromIdentifier = (token_identifier) => {
        return token_identifier.substring(0, token_identifier.indexOf('-'));
    };

    const [searchValue, setSearchValue] = useState<string>("");
    const [filteredProjects, setFilteredProjects] = useState<any>([]);

    useEffect(() => {
        const filteredData = projects.filter(v => v?.project_presale_token_identifier.toLowerCase().includes(searchValue));
        setFilteredProjects(filteredData);
    }, [searchValue]);

    // const sortData = () => {

    // };

    const sortChange = (filter_type) => {
        const sortedData = filteredProjects;
        switch (filter_type) {
            case "Hard Cap":
                sortedData.sort((a, b) => a.project_hard_cap - b.project_hard_cap);
                break;
            case "Soft Cap":
                sortedData.sort((a, b) => a.project_soft_cap - b.project_soft_cap);
                break;
            case "LP Percent":
                sortedData.sort((a, b) => a.project_maiar_liquidity_percent - b.project_maiar_liquidity_percent);
                break;
            case "Start time":
                sortedData.sort((a, b) => b.project_presale_start_time - a.project_presale_start_time);
                break;
            case "End Time":
                sortedData.sort((a, b) => b.project_presale_end_time - a.project_presale_end_time);
                break;
        }
        setFilteredProjects(sortedData);
    };

    return (
        <>
            <div className='first-section'>
                <div className='home-container'>
                    <div className='d-flex justify-content-center' style={{ marginTop: '6vh' }}>
                        <div className='d-flex justify-content-center'>
                            <img src={IDOImg} alt="BitX IDO Launchpad" width={'65%'} />
                        </div>
                    </div>

                    <div className="d-flex flex-column justify-content-center align-items-center mt-5">
                        <span className='ido-title'>{"Safest Launchpad. Elrond network"}</span>

                        <div className='ido-description mt-4'>
                            <span>{"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eu nibh bibendum, dictum nibh eu, ultricies lectus. Nullam metus eros, lacinia quis condimentum at, sagittis eu sapien. Suspendisse suscipit orci nec eros elementum"}</span>
                        </div>

                        <Link className="mt-5" to={routeNames.createido}>
                            <button className='ido-create-but'>
                                <span className='d-flex align-items-center' style={{ fontSize: '20px' }}>
                                    <IoRocketOutline />
                                </span>
                                <span>
                                    Apply as a project
                                </span>
                            </button>
                        </Link>
                    </div>
                </div>
                <div style={{ marginTop: '70px' }}>
                    <Marquee gradient={false} speed={50} pauseOnClick={true}>
                        {
                            advertising_data.map((row, index) => {
                                return (
                                    <div key={index}>
                                        <div className='ido-anounce-card mr-5'>
                                            <div className='mr-4'>
                                                <img src={row.logo} alt={row.name} width={"50px"} />
                                            </div>
                                            <span>{row.name}</span>
                                        </div>
                                    </div>
                                );
                            })
                        }
                    </Marquee>
                </div>
            </div>

            <div className='ido-container' style={{ marginBottom: '80px', minHeight: "100vh" }}>
                <div className='d-flex flex-wrap' style={{ rowGap: '10px', columnGap: '10px' }}>
                    <div style={{ width: '300px' }}>
                        <input className='ido-input' placeholder="Enter token name or symbol" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
                    </div>
                    {/* <div style={{ width: '150px' }}>
                        <DropdownList
                            defaultValue="All Status"
                            data={["All Status", "Upcoming", "KYC", "In progress", "Filled", "Ended", "Canceled"]}
                        />;
                    </div> */}
                    <div style={{ width: '150px' }}>
                        <DropdownList
                            defaultValue="No Filter"
                            data={["No Filter", "Hard Cap", "Soft Cap", "LP Percent", "Start time", "End Time"]}
                            onChange={sortChange}
                        />
                    </div>
                    <div className='d-flex' style={{ columnGap: '10px' }}>
                        <div>
                            <button className='ido-but' onClick={() => setDisplayMode(false)}>
                                <IoGrid />
                            </button>
                        </div>
                        <div>
                            <button className='ido-but' onClick={() => setDisplayMode(true)}>
                                <IoList />
                            </button>
                        </div>
                    </div>
                </div>

                <div className='mt-4'>
                    {
                        !displayMode ? (
                            <Row style={{ rowGap: '20px' }}>
                                {
                                    filteredProjects.map((row, index) => {
                                        return (
                                            <Col key={index} md={6} lg={6} xl={4} xxl={3}>
                                                <div className='IDOCard-link' onClick={() => { handleIDONavigate(row.project_id); }}>
                                                    {/* <div className='IDOCard-link'> */}
                                                    <IDOCard data={row} />
                                                </div>
                                            </Col>
                                        );
                                    })
                                }
                            </Row>
                        ) : (
                            <Table className="text-center mt-3" style={{ color: "#ACACAC" }}>
                                <Thead>
                                    <Tr>
                                        {
                                            table_headers.map((row, index) => {
                                                return (
                                                    <Th key={index}>{row}</Th>
                                                );
                                            })
                                        }
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {
                                        filteredProjects.map((row, index) => {
                                            return (
                                                <Tr key={index}>
                                                    <Td>
                                                        <div className='d-flex align-items-center justify-content-center'>
                                                            {/* <img src={`https://devnet-media.elrond.com/tokens/asset/${row?.project_presale_token_identifier}/logo.png`} alt={row?.project_presale_token_identifier} width={'40px'} /> */}
                                                            <span className='ml-2'>{getTokenNameFromIdentifier(row?.project_presale_token_identifier)} Token</span>
                                                        </div>
                                                    </Td>
                                                    <Td>
                                                        <span className='ml-2'>{row?.project_presale_token_identifier}</span>
                                                    </Td>
                                                    <Td>
                                                        <span className='ml-2'>{row?.project_presale_rate * row?.project_hard_cap}</span>
                                                    </Td>
                                                    <Td>
                                                        <span className='ml-2'>{`1 ${row ? row.project_fund_token_identifier : '-'} = ${row ? row.project_presale_rate : 'undefined'} ${getTokenNameFromIdentifier(row?.project_presale_token_identifier)}`}</span>
                                                    </Td>
                                                    <Td>
                                                        <ProgressBar now={row.project_presale_percentage} />
                                                    </Td>
                                                    <Td>
                                                        <div className='table-social-box'>
                                                            {
                                                                row?.project_social_website !== "" && (
                                                                    <a className='social-link' href={row?.project_social_website} rel="noreferrer" target="_blank">
                                                                        {swtichSocialIcon('website')}
                                                                    </a>
                                                                )
                                                            }
                                                            {
                                                                row?.project_social_telegram !== "" && (
                                                                    <a className='social-link' href={row?.project_social_telegram} rel="noreferrer" target="_blank">
                                                                        {swtichSocialIcon('telegram')}
                                                                    </a>
                                                                )
                                                            }
                                                            {
                                                                row?.project_social_discord !== "" && (
                                                                    <a className='social-link' href={row?.project_social_discord} rel="noreferrer" target="_blank">
                                                                        {swtichSocialIcon('discord')}
                                                                    </a>
                                                                )
                                                            }
                                                            {
                                                                row?.project_social_twitter !== "" && (
                                                                    <a className='social-link' href={row?.project_social_twitter} rel="noreferrer" target="_blank">
                                                                        {swtichSocialIcon('twitter')}
                                                                    </a>
                                                                )
                                                            }
                                                            {
                                                                row?.project_social_youtube !== "" && (
                                                                    <a className='social-link' href={row?.project_social_youtube} rel="noreferrer" target="_blank">
                                                                        {swtichSocialIcon('youtube')}
                                                                    </a>
                                                                )
                                                            }
                                                            {
                                                                row?.project_social_linkedin !== "" && (
                                                                    <a className='social-link' href={row?.project_social_linkedin} rel="noreferrer" target="_blank">
                                                                        {swtichSocialIcon('linkedIn')}
                                                                    </a>
                                                                )
                                                            }
                                                            {
                                                                row?.project_social_medium !== "" && (
                                                                    <a className='social-link' href={row?.project_social_medium} rel="noreferrer" target="_blank">
                                                                        {swtichSocialIcon('medium')}
                                                                    </a>
                                                                )
                                                            }
                                                        </div>
                                                    </Td>
                                                    <Td>
                                                        <Countdown date={moment(row?.project_presale_start_time / 1000).format("DD MMM YYYY hh:mm a")} autoStart />
                                                    </Td>
                                                    <Td>
                                                        <button className='view-but' onClick={() => { handleIDONavigate(row.project_id); }}>
                                                            view
                                                        </button>
                                                    </Td>
                                                </Tr>
                                            );
                                        })
                                    }

                                </Tbody>
                            </Table>
                        )
                    }
                </div>
            </div>
        </>
    );
};

export default IDOLaunchpad;
