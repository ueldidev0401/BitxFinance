import React, { useState } from 'react';
import './index.scss';
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
import { Row, Col } from 'react-bootstrap';
import BronzeVIPCard from 'assets/img/nft mint/BRONZE PIC.png';
import GoldVIPCard from 'assets/img/nft mint/GOLD PIC.png';
import NFTHexagon from 'assets/img/nft mint/nft hexagon.svg';
import SilverVIPCard from 'assets/img/nft mint/SILVER PIC.png';
import AlertModal from 'components/AlertModal';
import {
    NFT_CARDS,
    NFT_CONTRACT_ADDRESS,
    NFT_CONTRACT_ABI_URL,
    NFT_CONTRACT_NAME,
} from 'config';
import {
    IContractInteractor,
    TIMEOUT,
    convertWeiToEsdt,
    convertEsdtToWei,
} from 'utils';


const NFTMint = () => {
    const { address } = useGetAccountInfo();
    const { network } = useGetNetworkConfig();
    const { hasPendingTransactions } = useGetPendingTransactions();
    const provider = new ProxyProvider(network.apiAddress, { timeout: TIMEOUT });

    const [contractInteractor, setContractInteractor] = React.useState<IContractInteractor | undefined>();
    // load smart contract abi and parse it to SmartContract object for tx
    React.useEffect(() => {
        (async () => {
            const registry = await AbiRegistry.load({ urls: [NFT_CONTRACT_ABI_URL] });
            const abi = new SmartContractAbi(registry, [NFT_CONTRACT_NAME]);
            const contract = new SmartContract({ address: new Address(NFT_CONTRACT_ADDRESS), abi: abi });
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

    const [collections, setCollections] = React.useState<any>([]);
    React.useEffect(() => {
        (async () => {
            if (!contractInteractor) return;
            const interaction = contractInteractor.contract.methods.viewCollectionSettings();
            const res = await contractInteractor.controller.query(interaction);

            if (!res || !res.returnCode.isSuccess()) return;
            const values = res.firstValue.valueOf();
            if (!values) return;

            const new_collections: any = [];
            for (const value of values) {
                const collection_id = value.collection_id.toNumber();
                const collection_name = value.collection_name.toString();
                const collection_identifier = value.collection_identifier.toString();
                const collection_size = value.collection_size.toNumber();
                const collection_mint_allow_size = value.collection_mint_allow_size.toNumber();
                const collection_max_limit_per_address = value.collection_max_limit_per_address.toNumber();
                const payment_token_id = value.payment_token_id.toString();
                const collection_price = convertWeiToEsdt(value.collection_price);
                const collection_minted_count = value.collection_minted_count.toNumber();
                const collection_income = convertWeiToEsdt(value.collection_income);
                const whitelist_enabled = value.whitelist_enabled;

                const collection_left_nft_count = collection_mint_allow_size - collection_minted_count;

                const collection = {
                    collection_id,
                    collection_name,
                    collection_identifier,
                    collection_size,
                    collection_mint_allow_size,
                    collection_max_limit_per_address,
                    payment_token_id,
                    collection_price,
                    collection_minted_count,
                    collection_income,
                    whitelist_enabled,

                    collection_left_nft_count,
                };
                new_collections.push(collection);
            }

            // console.log('collections', collections);
            setCollections(new_collections);
        })();
    }, [contractInteractor]);

    const [userAccount, setUserAccount] = React.useState<any>();
    React.useEffect(() => {
        (async () => {
            if (!contractInteractor || !address || hasPendingTransactions) return;
            const args = [new AddressValue(new Address(address))];
            const interaction = contractInteractor.contract.methods.viewUserAccount(args);
            const res = await contractInteractor.controller.query(interaction);

            if (!res || !res.returnCode.isSuccess()) return;
            const values = res.firstValue.valueOf();
            if (!values) return;

            const items: any = [];
            for (const value of values) {
                const collection_id = value.collection_id.toNumber();
                const collection_nft_purchased_count = value.collection_nft_purchased_count.toNumber();
                const collection_max_limit_per_address = value.collection_max_limit_per_address.toNumber();
                const is_whitelisted = value.is_whitelisted;
                const whitelist_enabled = value.whitelist_enabled;

                const item = {
                    collection_id,
                    collection_nft_purchased_count,
                    collection_max_limit_per_address,
                    is_whitelisted,
                    whitelist_enabled,
                };
                items.push(item);
            }

            // console.log('viewUserAccount', items);
            setUserAccount(items);
        })();
    }, [contractInteractor, address, hasPendingTransactions]);

    const [mintCardType, setMintCardType] = useState(0); // select golden card by default
    function handleCardType(value) {
        setMintCardType(value);
    }

    const [alertModalShow, setAlertModalShow] = React.useState<boolean>(false);
    const [alertModalText, setAlertModalText] = React.useState<string>('');
    function onShowAlertModal(text: string) {
        setAlertModalText(text);
        setAlertModalShow(true);
    }

    async function mintNft() {
        if (!address) {
            onShowAlertModal('You should connect your wallet to mint NFTs.');
            return;
        }
        if (!collections.length || !userAccount) {
            onShowAlertModal('Data is not loaded yet.');
            return;
        }
        if (collections[mintCardType].collection_left_nft_count == 0) {
            onShowAlertModal('No NFTs are left to be minted.');
            return;
        }
        const minNftCount = 1;
        const mintPrice = convertEsdtToWei(collections[mintCardType].collection_price);
        if (userAccount.collection_nft_purchased_count + minNftCount > userAccount.collection_max_limit_per_address) {
            onShowAlertModal(`Each wallet cannot mint more than ${userAccount.collection_max_limit_per_address}`);
            return;
        }

        const args: TypedValue[] = [
            new U32Value(mintCardType + 1),
        ];
        const { argumentsString } = new ArgSerializer().valuesToString(args);
        const data = `publicMint@${argumentsString}`;

        const tx = {
            receiver: NFT_CONTRACT_ADDRESS,
            gasLimit: new GasLimit(30000000),
            data: data,
            value: mintPrice,
        };

        await refreshAccount();
        sendTransactions({
            transactions: tx,
        });
    }

    return (
        <div className="home-container">
            <Row style={{ marginBottom: "30px", alignItems: "center" }}>

                <Col md="12" lg="6" className="text-center" style={{ paddingLeft: "30px", paddingRight: "30px" }}>
                    <img src={NFTHexagon} style={{ width: "60%", marginTop: "-20px" }} />

                    <p className="description-title" style={{ marginTop: "-10px" }}>{"Mint BTX VIP Pass Cards"}</p>
                    <p className="description-body text-left">
                        {"Holders of a BTX NFT VIP PASS will have access to monthly reward lotteries which will be drawn for the varies different tiers with access to special staking pools and the ability to mint future NFT collections that will be released on our NFT minting platform."}
                    </p>

                    <button
                        className="mint-button"
                        style={{ marginTop: "30px" }}
                        onClick={mintNft}
                    >
                        Mint
                    </button>

                    <p style={{ marginTop: "30px", color: "#FEE277" }}>
                        {"You selected " + NFT_CARDS[mintCardType].name + " vip card and need to pay " + (collections.length ? collections[mintCardType].collection_price : '-') + " EGLD."}
                    </p>
                </Col>

                <Col md="12" lg="6">
                    <input id="gold-radio" type="radio" name="VIPCardRadioGroup" value={0} onChange={() => handleCardType(0)} defaultChecked />
                    <label htmlFor='gold-radio'>
                        <div className="mint-vip-card">
                            <img src={GoldVIPCard} />
                            <div className="balance">
                                <span>{"Balance: "}{collections.length ? collections[0].collection_left_nft_count : '-'}</span>
                                <span>{"Cost: " + (collections.length ? collections[0].collection_price : '-') + " EGLD"}</span>
                            </div>
                        </div>
                    </label>

                    <input id="silver-radio" type="radio" name="VIPCardRadioGroup" value={1} onChange={() => handleCardType(1)} />
                    <label htmlFor='silver-radio'>
                        <div className="mint-vip-card">
                            <img src={SilverVIPCard} />
                            <div className="balance">
                                <span>{"Balance: "}{collections.length ? collections[1].collection_left_nft_count : '-'}</span>
                                <span>{"Cost: " + (collections.length ? collections[1].collection_price : '-') + " EGLD"}</span>
                            </div>
                        </div>
                    </label>

                    <input id="bronze-radio" type="radio" name="VIPCardRadioGroup" value={2} onChange={() => handleCardType(2)} />
                    <label htmlFor='bronze-radio'>
                        <div className="mint-vip-card">
                            <img src={BronzeVIPCard} />
                            <div className="balance">
                                <span>{"Balance: "}{collections.length ? collections[2].collection_left_nft_count : '-'}</span>
                                <span>{"Cost: " + (collections.length ? collections[2].collection_price : '-') + " EGLD"}</span>
                            </div>
                        </div>
                    </label>
                </Col>
            </Row>
            <AlertModal
                show={alertModalShow}
                onHide={() => setAlertModalShow(false)}
                alertmodaltext={alertModalText}
            />
        </div>
    );
};

export default NFTMint;