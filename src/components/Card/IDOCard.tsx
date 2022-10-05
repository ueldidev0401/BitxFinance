/* eslint-disable import/order */
import React, { useEffect, useState } from 'react';
import { ProgressBar } from 'react-bootstrap';
import Countdown from 'react-countdown';
import { swtichSocialIcon } from 'utils/social';
import emptyLogo from 'assets/img/token logos/empty.png';
import EGLD_logo from 'assets/img/token logos/EGLD.png';
import moment from 'moment';
import { Link } from 'react-router-dom';
import {
    getEsdtTokenId,
} from 'utils';
import {
    useGetNetworkConfig,
} from '@elrondnetwork/dapp-core';

const IDOCard = (props: any) => {
    const { data } = props;
    const ico_start_time = moment(data.project_presale_start_time / 1000).format("DD MMM YYYY hh:mm a");
    const { network } = useGetNetworkConfig();
    const [tokenInfo, setTokenInfo] = useState<any>();

    useEffect(() => {
        const fetchTokenInfo = async () => {
            console.log(network.apiAddress);
            const res: any = await getEsdtTokenId(network.apiAddress, data.project_presale_token_identifier);
            setTokenInfo(res.data);
            setLogoUrl(`https://devnet-media.elrond.com/tokens/asset/${tokenInfo?.identifier}/logo.png`);
        };

        fetchTokenInfo();
    }, []);

    const [logoUrl, setLogoUrl] = useState<string>();
    const onErrorLogo = () => {
        setLogoUrl(emptyLogo);
    };
    
    return (
        <>
            <div className='IDO-Card-box'>
                <Link className="position-absolute" to={`/ido-detail/${data.pool_name}`} style={{ width: "100%", height: "100%" }} />
                <div className="d-flex justify-content-between align-items-center">
                    <div className='d-flex flex-column'>
                        <span className='IDO-Card-title'>{data.project_presale_token_identifier}</span>
                        <span className='IDO-Card-token-identifier mt-2'>${tokenInfo?.name}</span>
                    </div>
                    <div className='d-flex justify-content-end'>
                        <div>
                            <img src={logoUrl} alt={data.project_presale_token_identifier} width={'80px'} onError={onErrorLogo} />
                        </div>
                        <div style={{ marginLeft: '-25px', marginTop: '56px' }}>
                            <img src={EGLD_logo} alt="BitX logo" width={'30px'} />
                        </div>
                    </div>
                </div>

                <div className='social-box mt-4'>
                    {
                        data.project_social_website !== "" && (
                            <a className='social-link' href={data.project_social_website} rel="noreferrer" target="_blank">
                                {swtichSocialIcon('website')}
                            </a>
                        )
                    }
                    {
                        data.project_social_telegram !== "" && (
                            <a className='social-link' href={data.project_social_telegram} rel="noreferrer" target="_blank">
                                {swtichSocialIcon('telegram')}
                            </a>
                        )
                    }
                    {
                        data.project_social_discord !== "" && (
                            <a className='social-link' href={data.project_social_discord} rel="noreferrer" target="_blank">
                                {swtichSocialIcon('discord')}
                            </a>
                        )
                    }
                    {
                        data.project_social_twitter !== "" && (
                            <a className='social-link' href={data.project_social_twitter} rel="noreferrer" target="_blank">
                                {swtichSocialIcon('twitter')}
                            </a>
                        )
                    }
                    {
                        data.project_social_youtube !== "" && (
                            <a className='social-link' href={data.project_social_youtube} rel="noreferrer" target="_blank">
                                {swtichSocialIcon('youtube')}
                            </a>
                        )
                    }
                    {
                        data.project_social_linkedin !== "" && (
                            <a className='social-link' href={data.project_social_linkedin} rel="noreferrer" target="_blank">
                                {swtichSocialIcon('linkedIn')}
                            </a>
                        )
                    }
                    {
                        data.project_social_medium !== "" && (
                            <a className='social-link' href={data.project_social_medium} rel="noreferrer" target="_blank">
                                {swtichSocialIcon('medium')}
                            </a>
                        )
                    }
                </div>

                <div className='mt-4'>
                    <p className='IDO-prize'>{`1 ${data.project_fund_token_identifier} = ${data.project_presale_rate} ${tokenInfo?.name}`}</p>

                    <span>{"Progress (" + data.project_presale_percentage.toFixed(2) + "%)"}</span>
                    <ProgressBar className='mt-1' now={data.project_presale_percentage} />
                    <div className='d-flex justify-content-between mt-1'>
                        <span>{`0 ${data.project_fund_token_identifier}`}</span>
                        <span>{`- ${data.project_fund_token_identifier}`}</span>
                    </div>

                    <div className='mt-4' style={{ fontSize: '15px' }}>
                        <div className='d-flex justify-content-between mt-1'>
                            <span>{"Liquidity %:"}</span>
                            <span>{`${data.project_maiar_liquidity_percent}%`}</span>
                        </div>

                        <div className='d-flex justify-content-between mt-1'>
                            <span>{"Lockup Time:"}</span>
                            <span>{`${data.project_liquidity_lock_timestamp / 24 / 3600 / 1000 / 1000} days`}</span>
                        </div>

                        <div className='d-flex justify-content-between mt-1'>
                            <span>{"Starts:"}</span>
                            <span>{ico_start_time}</span>
                        </div>
                    </div>
                </div>

                <div className='d-flex justify-content-center mt-4'>
                    <Countdown className='IDO-Card-Countdown' date={ico_start_time} autoStart />
                </div>
            </div>
        </>
    );
};

export default IDOCard;