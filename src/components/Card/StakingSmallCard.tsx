import React from 'react';
import './index.scss';
import { useGetNetworkConfig } from '@elrondnetwork/dapp-core';
import {
    Address,
    AbiRegistry,
    SmartContractAbi,
    SmartContract,
    ProxyProvider,
    DefaultSmartContractController,
} from '@elrondnetwork/erdjs';
import { Link } from 'react-router-dom';
import LinkSuccessPng from 'assets/img/link success.png';
import {
    TIMEOUT,
    convertWeiToEsdt,
    convertAPR2APY,
    IContractInteractor,
} from 'utils';
import {
    BTX2BTX_CONTRACT_NAME,
    BTX2MEX_CONTRACT_NAME,
    CPA2CPA_CONTRACT_NAME,
} from 'config';
import { logo, contractABI, contractAddress, contractName, tokenDecimal } from './data';

type IStakingProps = {
    stake?: string;
    earn?: string;
    url?: string;
};


const StakingSmallCard = (props: IStakingProps) => {
    const stakeKey = props.stake + "2" + props.earn;
    const { network } = useGetNetworkConfig();
    const provider = new ProxyProvider(network.apiAddress, { timeout: TIMEOUT });

    const [stakeContractInteractor, setStakeContractInteractor] = React.useState<IContractInteractor | undefined>();
    const [stakeSetting, setStakeSetting] = React.useState<any>();

    React.useEffect(() => {
        (async () => {
            const registry = await AbiRegistry.load({ urls: [contractABI[stakeKey]] });
            const abi = new SmartContractAbi(registry, [contractName[stakeKey]]);
            const contract = new SmartContract({ address: new Address(contractAddress[stakeKey]), abi: abi });
            const controller = new DefaultSmartContractController(abi, provider);

            setStakeContractInteractor({ contract, controller });
        })();
    }, []); // [] makes useEffect run once

    React.useEffect(() => {
        (async () => {
            if (!stakeContractInteractor)
                return;

            let interaction;
            if (contractName[stakeKey] == BTX2BTX_CONTRACT_NAME || contractName[stakeKey] == BTX2MEX_CONTRACT_NAME || contractName[stakeKey] == CPA2CPA_CONTRACT_NAME) {
                interaction = stakeContractInteractor.contract.methods.viewStakeSetting();
            } else {
                interaction = stakeContractInteractor.contract.methods.getCurrentStakeSetting();
            }
            const res = await stakeContractInteractor.controller.query(interaction);

            if (!res || !res.returnCode.isSuccess())
                return;

            const value = res.firstValue.valueOf();
            const apr = value.apr.toNumber() / 100;
            const total_staked_amount = convertWeiToEsdt(value.total_staked_amount, tokenDecimal[props.stake]);
            const number_of_stakers = value.number_of_stakers.toNumber();
            const result = { apr, total_staked_amount, number_of_stakers };

            setStakeSetting(result);
        })();
    }, [stakeContractInteractor]);

    return (
        <>
            <Link to={props.url}>
                <div className="staking-small-card">
                    <div className="header-png-group">
                        <img src={logo[props.stake]} style={{ width: "20%" }} />
                        <img src={LinkSuccessPng} style={{ height: "100%", marginLeft: "30px" }} />
                        <img src={logo[props.earn]} style={{ width: "20%", marginLeft: "30px" }} />
                    </div>

                    <div className='info' style={{ color: "#888888", paddingTop: "10px" }}>
                        <div>
                            <p className='heading'>APR</p>
                            <p className='data'>{stakeSetting ? stakeSetting.apr : '-'} %</p>
                        </div>
                        <div>
                            <p className='heading'>APY</p>
                            {
                                props.stake == props.earn ? (
                                    <p className='data'>{stakeSetting ? convertAPR2APY(stakeSetting.apr) : '-'} %</p>
                                ) : (
                                    <p className='data'>NULL</p>
                                )
                            }

                        </div>
                        <div>
                            <p className='heading'>Staked</p>
                            <p className='data'>{stakeSetting ? stakeSetting.total_staked_amount : '-'} {props.stake}</p>
                        </div>
                        <div>
                            <p className='heading'>Stakers</p>
                            <p className='data'>{stakeSetting ? stakeSetting.number_of_stakers : '-'}</p>
                        </div>
                    </div>

                    <div className="text-center pt-3" style={{ color: "lightgray", fontSize:"16px" }}>
                        click to go
                    </div>
                </div>
            </Link>
        </>
    );
};

export default StakingSmallCard;