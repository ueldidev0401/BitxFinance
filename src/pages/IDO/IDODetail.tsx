/* eslint-disable import/order */
import React, { useEffect, useState } from 'react';
import { ProgressBar, Row, Col } from 'react-bootstrap';
import Countdown from 'react-countdown';
import { paddingTwoDigits } from 'utils/convert';
import { Link, useLocation } from "react-router-dom";
import moment from 'moment';
import { toast } from 'react-toastify';
import BigNumber from 'bignumber.js/bignumber.js';
import { swtichSocialIcon } from 'utils/social';
import { numberWithCommas } from 'utils/convert';
import {
    IDO_CONTRACT_ABI_URL,
    IDO_CONTRACT_NAME,
    IDO_CONTRACT_ADDRESS,
    WEGLD_ID
} from 'config';
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
    AbiRegistry,
    SmartContractAbi,
    SmartContract,
    DefaultSmartContractController,
    ProxyProvider,
    U32Value,
    TypedValue,
    ArgSerializer,
    GasLimit,
    BytesValue,
} from '@elrondnetwork/erdjs';
import {
    TIMEOUT,
    SECOND_IN_MILLI,
    convertWeiToEsdt,
    getEsdtTokenId,
    getPrice
} from 'utils';
import { routeNames } from 'routes';
import emptyLogo from 'assets/img/token logos/New Project.png';

const IDODetail = () => {
    interface Props {
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
        completed: boolean;
    }

    const location = useLocation();
    const { address, account } = useGetAccountInfo();
    const { hasPendingTransactions } = useGetPendingTransactions();
    const { network } = useGetNetworkConfig();
    const isLoggedIn = Boolean(address);
    const provider = new ProxyProvider(network.apiAddress, { timeout: TIMEOUT });
    const [idoContractInteractor, setIdoContractInteractor] = useState<any>(undefined);

    useEffect(() => {
        (async () => {
            const registry = await AbiRegistry.load({ urls: [`/${IDO_CONTRACT_ABI_URL}`] });
            const abi = new SmartContractAbi(registry, [IDO_CONTRACT_NAME]);
            const contract = new SmartContract({ address: new Address(IDO_CONTRACT_ADDRESS), abi: abi });
            const controller = new DefaultSmartContractController(abi, provider);

            setIdoContractInteractor({
                contract,
                controller,
            });
        })();
    }, []);

    const [project, setProject] = useState<any>();
    const [tokenInfo, setTokenInfo] = useState<any>();
    const [egldPrice, setEgldPrice] = useState<number>(0);

    useEffect(() => {
        (async () => {
            if (!idoContractInteractor || !isLoggedIn) return;

            const pathname = location.pathname;
            const project_id = pathname.substring(pathname.lastIndexOf('/') + 1);
            const args = [
                new U32Value(Number(project_id)),
            ];

            const interaction = idoContractInteractor.contract.methods.getProject(args);
            const res = await idoContractInteractor.controller.query(interaction);

            if (!res || !res.returnCode.isSuccess()) return;
            const item = res.firstValue.valueOf();
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
            setProject(data);

            const res1: any = await getEsdtTokenId(network.apiAddress, data.project_presale_token_identifier);
            setTokenInfo(res1.data);
            setLogoUrl(`https://devnet-media.elrond.com/tokens/asset/${res1.data.identifier}/logo.png`);

            const prices: any = await getPrice(network.apiAddress);
            if (prices.length > 0) {
                for (let i = 0; i < prices.length; i++) {
                    if (prices[i].id === WEGLD_ID) {
                        // console.log(prices[i].price);
                        setEgldPrice(prices[i].price);
                        break;
                    }
                }
            }
        })();
    }, [idoContractInteractor, hasPendingTransactions]);

    const renderer: React.FC<Props> = ({ days, hours, minutes, seconds }) => {
        return (
            <div className='ido-custom-timer color-white'>
                <div className='ido-customer-timer-time'>{paddingTwoDigits(days)}</div>
                <div className='ido-customer-timer-time ml-2'>{paddingTwoDigits(hours)}</div>
                <div className='ido-customer-timer-time ml-2'>{paddingTwoDigits(minutes)}</div>
                <div className='ido-customer-timer-time ml-2'>{paddingTwoDigits(seconds)}</div>
            </div>
        );
    };

    const [buyAmount, setBuyAmount] = useState(0);
    const handleBuyAmount = (e) => {
        setBuyAmount(e.target.value);
    };

    const handleMax = () => {
        if (account.balance > project.project_max_buy_limit) {
            setBuyAmount(project.project_max_buy_limit);
        } else {
            setBuyAmount(account.balance);
        }
    };

    const handleBuy = async () => {
        if (buyAmount < project.project_min_buy_limit || buyAmount > project.project_max_buy_limit || buyAmount > (project.project_max_buy_limit - project.project_min_buy_limit)) {
            toast.error("You must input the correct amount to buy.");
            return;
        }
        const amount = (new BigNumber(buyAmount)).multipliedBy(Math.pow(10, 18));
        const args: TypedValue[] = [
            new U32Value(project.project_id),
        ];
        const { argumentsString } = new ArgSerializer().valuesToString(args);
        const data = `buy@${argumentsString}`;

        const tx = {
            receiver: IDO_CONTRACT_ADDRESS,
            gasLimit: new GasLimit(10000000),
            value: amount,
            data: data,
        };

        await refreshAccount();
        const result = await sendTransactions({
            transactions: tx,
        });
    };

    const [logoUrl, setLogoUrl] = useState<string>();
    const onErrorLogo = () => {
        setLogoUrl(emptyLogo);
    };

    return (
        <>
            <div className='home-container mb-5'>
                <Link to={routeNames.idolaunchpad}>
                    <p className="go-back"> {"< go home"}</p>
                </Link>

                <Row>
                    <Col lg={4}>
                        <div className='IDO-Card-box'>
                            <div className="d-flex align-items-center">
                                <div className='d-flex'>
                                    <div>
                                        <img src={logoUrl} alt={project?.project_presale_token_identifier} width={'80px'} onError={onErrorLogo} />
                                    </div>
                                </div>
                                <div className='d-flex flex-column ml-4'>
                                    <span className='IDO-Card-title'>{project ? project.project_presale_token_identifier : '-'}</span>
                                    <span className='IDO-Card-token-identifier mt-2'>{`${tokenInfo ? tokenInfo.name : '-'} / ${project ? project.project_fund_token_identifier : '-'}`}</span>
                                </div>
                            </div>

                            <div className='mt-4'>
                                {/* <div className='connect-but-box d-flex justify-content-center'>
                                    <button className='ido-card-but'> Connect Wallet </button>
                                </div> */}

                                <div className='d-flex flex-column mt-3'>
                                    <span className='IDO-prize'>{`1 ${project ? project.project_fund_token_identifier : '-'} = ${project ? project.project_presale_rate : 'undefined'} ${tokenInfo ? tokenInfo.name : '-'}`}</span>
                                    <span className='IDO-prize' style={{ fontSize: '13px' }}>{`1 ${tokenInfo ? tokenInfo.name : '-'} = $${(egldPrice / project?.project_presale_rate).toFixed(5)}`}</span>
                                </div>

                                <div className='mt-3'>
                                    <span>{"Progress (" + project?.project_presale_percentage.toFixed(2) + "%)"}</span>
                                    <ProgressBar className='mt-1' now={project?.project_presale_percentage} />
                                    <div className='d-flex justify-content-between mt-1'>
                                        <span>{`0 ${project ? project.project_fund_token_identifier : '-'}`}</span>
                                        <span>{`${project ? project.project_hard_cap : '-'} ${project ? project.project_fund_token_identifier : '-'}`}</span>
                                    </div>
                                </div>
                            </div>

                            <div className='d-flex justify-content-center mt-4'>
                                <Countdown className='IDO-Card-Countdown' date={moment(project?.project_presale_start_time / 1000).format("DD MMM YYYY hh:mm a")} renderer={renderer} autoStart />
                            </div>

                            <div className='mt-4 d-flex'>
                                <input className='ido-input' value={buyAmount} onChange={handleBuyAmount} />
                                <button className='ido-card-but ml-2' style={{ padding: '5px 10px' }} onClick={handleMax}> MAX </button>
                            </div>

                            <div className='d-flex justify-content-center mt-4'>
                                <button className='ido-card-buy-but' onClick={handleBuy}> Buy </button>
                            </div>

                        </div>

                        <div className='IDO-Card-box mt-4' style={{ border: "none", fontSize: '14px', padding: "30px" }}>
                            {/* <div className='d-flex justify-content-between'>
                                <span>Registration Start: </span>
                                <span style={{ color: 'white' }}>{`${currentPoolDetail.registration_start}`}</span>
                            </div>
                            <div className='d-flex justify-content-between mt-2'>
                                <span>Registration Start: </span>
                                <span style={{ color: 'white' }}>{`${currentPoolDetail.registration_end}`}</span>
                            </div> */}
                            <div className='d-flex justify-content-between mt-2'>
                                <span>Minimum Buy: </span>
                                <span style={{ color: 'white' }}>{`${project ? project.project_min_buy_limit : 'NAN'} ${project ? project.project_fund_token_identifier : '-'}`}</span>
                            </div>
                            <div className='d-flex justify-content-between mt-2'>
                                <span>Maximum Buy: </span>
                                <span style={{ color: 'white' }}>{`${project ? project.project_max_buy_limit : 'NAN'} ${project ? project.project_fund_token_identifier : '-'}`}</span>
                            </div>
                        </div>
                    </Col>

                    <Col lg={8}>
                        <div className='IDO-Card-box'>
                            <div className="d-flex align-items-center">
                                <div className='d-flex'>
                                    <div>
                                        <img src={logoUrl} alt={project?.project_presale_token_identifier} width={'60px'} onError={onErrorLogo} />
                                    </div>
                                </div>
                                <div className='d-flex flex-column ml-4'>
                                    <span className='IDO-Card-title' style={{ fontSize: '20px' }}>{project ? project.project_presale_token_identifier : '-'}</span>
                                </div>
                            </div>

                            <div className='mt-3'>
                                <div style={{ fontSize: '16px' }}>{project ? project.project_description : ''}</div>
                                <div className='mt-2' style={{ fontSize: '16px', color: '#E3E3E3' }}>{"Your investment is protected, this sale is under the Safeguarded Launch Protocol rules."}</div>
                            </div>

                            <div className='social-box mt-4'>
                                {
                                    project?.project_social_website !== "" && (
                                        <a className='social-link' href={project?.project_social_website} rel="noreferrer" target="_blank">
                                            {swtichSocialIcon('website')}
                                        </a>
                                    )
                                }
                                {
                                    project?.project_social_telegram !== "" && (
                                        <a className='social-link' href={project?.project_social_telegram} rel="noreferrer" target="_blank">
                                            {swtichSocialIcon('telegram')}
                                        </a>
                                    )
                                }
                                {
                                    project?.project_social_discord !== "" && (
                                        <a className='social-link' href={project?.project_social_discord} rel="noreferrer" target="_blank">
                                            {swtichSocialIcon('discord')}
                                        </a>
                                    )
                                }
                                {
                                    project?.project_social_twitter !== "" && (
                                        <a className='social-link' href={project?.project_social_twitter} rel="noreferrer" target="_blank">
                                            {swtichSocialIcon('twitter')}
                                        </a>
                                    )
                                }
                                {
                                    project?.project_social_youtube !== "" && (
                                        <a className='social-link' href={project?.project_social_youtube} rel="noreferrer" target="_blank">
                                            {swtichSocialIcon('youtube')}
                                        </a>
                                    )
                                }
                                {
                                    project?.project_social_linkedin !== "" && (
                                        <a className='social-link' href={project?.project_social_linkedin} rel="noreferrer" target="_blank">
                                            {swtichSocialIcon('linkedIn')}
                                        </a>
                                    )
                                }
                                {
                                    project?.project_social_medium !== "" && (
                                        <a className='social-link' href={project?.project_social_medium} rel="noreferrer" target="_blank">
                                            {swtichSocialIcon('medium')}
                                        </a>
                                    )
                                }
                            </div>

                            <div className='mt-5'>
                                <div className='d-flex flex-column' style={{ rowGap: '6px' }}>
                                    <p style={{ fontSize: '22px', color: "#6a9b84", fontWeight: '700' }}>TOKEN</p>
                                    <div>
                                        <span>Token: </span>
                                        <span style={{ color: '#6a9b84' }}>{tokenInfo ? tokenInfo.name : '-'}</span>
                                    </div>
                                    <div>
                                        <span>Token Identifier: </span>
                                        <span style={{ color: '#6a9b84' }}>{project?.project_presale_token_identifier}</span>
                                    </div>
                                    <div>
                                        <span>Token Decimal: </span>
                                        <span style={{ color: '#6a9b84' }}>{tokenInfo ? tokenInfo.decimals : 'undefiend'}</span>
                                    </div>
                                    <div>
                                        <span>Total Supply: </span>
                                        <span style={{ color: '#6a9b84' }}>{`${numberWithCommas(tokenInfo?.supply)} ${tokenInfo ? tokenInfo.name : '-'}`}</span>
                                    </div>
                                    <div>
                                        <span>Tokens For Presale: </span>
                                        <span style={{ color: '#6a9b84' }}>{project?.project_presale_rate * project?.project_hard_cap} {tokenInfo?.name}</span>
                                    </div>
                                    <div>
                                        <span>Tokens For Liquidity: </span>
                                        <span style={{ color: '#6a9b84' }}>{project?.project_presale_rate * project?.project_hard_cap * project?.project_maiar_liquidity_percent / 100} {tokenInfo?.name}</span>
                                    </div>
                                </div>

                                <div className='d-flex flex-column mt-5' style={{ rowGap: '6px' }}>
                                    <p style={{ fontSize: '20px', color: "#6a9b84", fontWeight: '700' }}>PRICE</p>
                                    <div>
                                        <span>IDO: </span>
                                        <span style={{ color: '#6a9b84' }}>${(egldPrice / project?.project_presale_rate).toFixed(5)}</span>
                                    </div>
                                </div>

                                <div className='d-flex flex-column mt-5' style={{ rowGap: '6px' }}>
                                    <p style={{ fontSize: '20px', color: "#6a9b84", fontWeight: '700' }}>POOL DETAILS</p>
                                    <div>
                                        <span>Soft Cap: </span>
                                        <span style={{ color: '#6a9b84' }}>{`${project ? project.project_soft_cap : '-'} ${project ? project.project_fund_token_identifier : '-'}`}</span>
                                    </div>
                                    <div>
                                        <span>Hard Cap: </span>
                                        <span style={{ color: '#6a9b84' }}>{`${project ? project.project_hard_cap : '-'} ${project ? project.project_fund_token_identifier : '-'}`}</span>
                                    </div>
                                    <div>
                                        <span>Liquidity Percent: </span>
                                        <span style={{ color: '#6a9b84' }}>{project ? project.project_maiar_liquidity_percent : '-'}%</span>
                                    </div>
                                    <div>
                                        <span>Lockup Time: </span>
                                        <span style={{ color: '#6a9b84' }}>{`${project ? project.project_liquidity_lock_timestamp / 1000 / 1000 / 3600 / 24 : '-'} days`}</span>
                                    </div>
                                    <div>
                                        <span>Starts / end: </span>
                                        <span style={{ color: '#6a9b84' }}>{`${moment(project?.project_presale_start_time / 1000).format("DD MMM YYYY hh:mm a")} - ${moment(project?.project_presale_end_time / 1000).format("DD MMM YYYY hh:mm a")}`}</span>
                                    </div>
                                    <div>
                                        <span>Listing On: </span>
                                        <span style={{ color: '#6a9b84' }}>{'Maiar Listing'}</span>
                                    </div>
                                    {/* <div>
                                        <span>Registration: </span>
                                        <span style={{ color: '#6a9b84' }}>{`${currentPoolDetail.registration_start} - ${currentPoolDetail.registration_end}`}</span>
                                    </div> */}
                                </div>

                                <div className='d-flex flex-column mt-5' style={{ rowGap: '6px' }}>
                                    <p style={{ fontSize: '20px', color: "#6a9b84", fontWeight: '700' }}>DISTRIBUTION</p>
                                    <div>
                                        <span>Distribution: </span>
                                        <span style={{ color: '#6a9b84' }}>Claimed on BitX IDO Launchpad</span>
                                    </div>
                                    {/* <div>
                                        <span>Vesting: </span>
                                        <span style={{ color: '#6a9b84' }}>Loerem Ipsum dollar</span>
                                    </div> */}
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        </>
    );
};

export default IDODetail;