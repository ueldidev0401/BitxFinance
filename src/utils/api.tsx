import axios from "axios";
import {
    convertWeiToEsdt,
    convertWeiToEgld,
} from './convert';
import CoinLogo from 'assets/img/coin.png';

export async function getBalanceOfToken(apiAddress, account, token_id) {
    try {
        if (token_id == 'EGLD') {
            return convertWeiToEgld(account.balance);
        }

        const res = await axios.get(`${apiAddress}/accounts/${account.address}/tokens?identifier=${token_id}`);
        // console.log('res', res);
        if (res.data?.length > 0) {
            const token = res.data[0];
            return convertWeiToEsdt(token.balance, token.decimals);
        }
    } catch(e) {
        console.log('getBalanceOfToken error', e);
    }

    return 0;
}

export async function getEsdtsOfAddress(apiAddress, account) {
    try {
        const res = await axios.get(`${apiAddress}/accounts/${account.address}/tokens?size=1000`);
        // console.log('res', res);
        if (res.data?.length > 0) {
            console.log('res.data', res.data);
            return res.data.map(v => {
                return {
                    identifier: v.identifier,
                    ticker: v.ticker,
                    decimals: v.decimals,
                    balance: convertWeiToEsdt(v.balance, v.decimals),
                    logo: v.assets ? v.assets.pngUrl : CoinLogo,
                };
            });
        }
    } catch(e) {
        console.log('getEsdtsOfAddress error', e);
    }

    return 0;
}

export async function getBtxNfts(apiAddress, account, nft_collections) {
    try {
        const res = await axios.get(`${apiAddress}/accounts/${account.address}/nfts?name=BTX`);
        // console.log('res', res);
        if (res.data?.length > 0) {
            const collection_ids = nft_collections.map(v => v.collection_id);
            // console.log('collection_ids', collection_ids);

            const nfts = [];
            for (let i = 0; i < res.data.length; i++) {
                const nft = res.data[i];
                let j = 0;
                for (j = 0; j < nft_collections.length; j++) {
                    if (nft.collection == nft_collections[j].collection_id) {
                        nfts.push({
                            identifier: nft.identifier,
                            collection: nft.collection,
                            nonce: nft.nonce,
                            name: nft.name,
                            url: nft.url,
                            reward_rate: nft_collections[j].reward_rate,
                        });

                        break;
                    }
                }
            }
            return nfts;
        }
    } catch(e) {
        console.log('getBalanceOfToken error', e);
    }

    return [];
}

export async function getEsdtTokenId(apiAddress, tokenId) {
    try {
        const res = await axios.get(`${apiAddress}/tokens/${tokenId}`);
        // console.log('res', res);
        if (res.status === 200) {
            const result = {
                status: true, 
                data: res.data
            };
            return result;
        } else {
            const result = {
                status: false, 
                data: null
            };
            return result;
        }
    } catch(e) {
        console.log('getEsdtTokenId error', e);
        const result = {
            status: false, 
            data: null
        };
        return result;
    }

    return [];
}

export async function getPrice(apiAddress) {
    try {
        const res = await axios.get(`${apiAddress}/mex/tokens?from=0&size=10000`);
        // console.log('res', res);
        if (res.data?.length > 0) {
            return res.data;
        }
    } catch(e) {
        console.log('getEsdtTokenId error', e);
        const result = {
            status: false, 
            data: null
        };
        return result;
    }

    return [];
}