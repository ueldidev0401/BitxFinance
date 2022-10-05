import * as React from 'react';
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
  DefaultSmartContractController,
} from '@elrondnetwork/erdjs';

import {
  Col,
  ProgressBar
} from 'react-bootstrap';
import './index.scss';
import BitXLogo from 'assets/img/BTX logo back.png';
import ElrondLogo from 'assets/img/Elrond logo.png';
import whiteListLogo from 'assets/img/whitelist.svg';
import {
  PRESALE_CONTRACT_ADDRESS,
  PRESALE_CONTRACT_ABI_URL,
  PRESALE_CONTRACT_NAME,
  BTX_TOKEN_DECIMALS,
  BTX_TOKEN_TICKER,
} from 'config';
import {
  TIMEOUT,
  SECOND_IN_MILLI,
  precisionRound,
  IContractInteractor,
  convertToStatus,
  convertWeiToEsdt,
  getCurrentTimestamp,
} from 'utils';
import { convertEsdtToWei } from '../../utils/convert';
import Time from './Time';

function getPresaleState(start_timestamp, end_timestamp) {
  const current_timestamp = getCurrentTimestamp();
  if (current_timestamp < start_timestamp) {
    return 'NotStarted';
  } else if (current_timestamp < end_timestamp){
    return 'Started';
  } else {
    return 'Ended';
  }
}

const Presale = () => {
  const { account, address } = useGetAccountInfo();
  const { network } = useGetNetworkConfig();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const proxyProvider = new ProxyProvider(network.apiAddress, { timeout: TIMEOUT });

  const [contractInteractor, setContractInteractor] = React.useState<IContractInteractor | undefined>();
  React.useEffect(() => {
    (async () => {
      const registry = await AbiRegistry.load({ urls: [PRESALE_CONTRACT_ABI_URL] });
      const abi = new SmartContractAbi(registry, [PRESALE_CONTRACT_NAME]);
      const contract = new SmartContract({ address: new Address(PRESALE_CONTRACT_ADDRESS), abi: abi });
      const controller = new DefaultSmartContractController(abi, proxyProvider);

      setContractInteractor({
        contract,
        controller,
      });
    })();
  }, []); // [] makes useEffect run once

  const [presale, setPresale] = React.useState<any>();
  React.useEffect(() => {
    (async () => {
      if (!contractInteractor) return;
      const interaction = contractInteractor.contract.methods.viewPresale();
      const res = await contractInteractor.controller.query(interaction);

      if (!res || !res.returnCode.isSuccess()) return;
      const value = res.firstValue?.valueOf();

      const treasury_wallet = value.treasury_wallet.toString();
      const token_id = value.token_id.toString();
      const exchange_rate = convertWeiToEsdt(value.token_price_rate, BTX_TOKEN_DECIMALS) / convertWeiToEsdt(value.egld_price_rate);

      const start_timestamp = value.start_timestamp.toNumber() * SECOND_IN_MILLI;
      const end_timestamp = value.end_timestamp.toNumber() * SECOND_IN_MILLI;

      const min_buy_limit = convertWeiToEsdt(value.min_buy_limit);
      const max_buy_limit = convertWeiToEsdt(value.max_buy_limit);

      const token_sale_amount = convertWeiToEsdt(value.token_sale_amount, BTX_TOKEN_DECIMALS);
      const total_bought_amount_in_egld = convertWeiToEsdt(value.total_bought_amount_in_egld);
      const total_bought_amount_in_esdt = convertWeiToEsdt(value.total_bought_amount_in_esdt, BTX_TOKEN_DECIMALS);

      const state = getPresaleState(start_timestamp, end_timestamp);

      const result = {
        treasury_wallet,
        token_id,
        exchange_rate,
        start_timestamp,
        end_timestamp,
        min_buy_limit,
        max_buy_limit,
        token_sale_amount,
        total_bought_amount_in_egld,
        total_bought_amount_in_esdt,

        state,
      };
      // console.log('viewPresale', result);
      setPresale(result);
    })();
  }, [contractInteractor, hasPendingTransactions]);

  const [presaleAccount, setPresaleAccount] = React.useState<any>();
  React.useEffect(() => {
    (async () => {
      if (!contractInteractor || !account.address) return;
      const args = [new AddressValue(new Address(account.address))];
      const interaction = contractInteractor.contract.methods.viewAccount(args);
      const res = await contractInteractor.controller.query(interaction);

      if (!res || !res.returnCode.isSuccess()) return;
      const value = res.firstValue?.valueOf();
      
      const is_whitelisted = value.is_whitelisted;
      
      const result = {
        is_whitelisted,
      };
      
      // console.log('viewAccount', result);
      setPresaleAccount(result);
    })();
  }, [contractInteractor, account.address]);

  const tokenSaleTargetRef = React.useRef(null);

  const [buyAmountInEgld, setBuyAmountInEgld] = React.useState<number>(0);
  const [buyAmountInEsdt, setBuyAmountInEsdt] = React.useState<number>(0);

  const [buyButtonDisabled, setBuyButtonDisabled] = React.useState<boolean>(true);

  const [buyStateInfo, setBuyStateInfo] = React.useState<string>('');

  const onChangeBuyAmountInEgld = (value) => {
    if (!presale) return;
    setBuyAmountInEgld(value);
    setBuyAmountInEsdt(precisionRound(value * presale.exchange_rate));
  };

  React.useEffect(() => {
    if (!presale || !presaleAccount) return;

    let disabled = true;
    let stateInfo = '';
    if (address) {
      if (presale.state == 'Started') {
        if (presaleAccount.is_whitelisted) {
          if (buyAmountInEgld < presale.min_buy_limit) {
            stateInfo = `Cannot buy less than ${presale.min_buy_limit} EGLD`;
          } else {
            disabled = false;
          }
        } else {
          stateInfo = 'You are not whitelisted.';
        }
      } else if (presale.state == 'NotStarted') {
        stateInfo = 'Presale is not opened.';
      } else {
        stateInfo = 'Presale is closed.';
      }
    } else {
      stateInfo = 'You should login to buy tokens.';
    }
    
    setBuyButtonDisabled(disabled);
    setBuyStateInfo(stateInfo);
  }, [presale, buyAmountInEgld]);

  async function buyToken() {
    const tx = {
      value: convertEsdtToWei(buyAmountInEgld),
      data: 'buy',
      receiver: PRESALE_CONTRACT_ADDRESS,
      gasLimit: 10000000,
    };
    await refreshAccount();
    await sendTransactions({
      transactions: tx
    });
  }

  return (
    <>
      <div className='bitxwrapper background-1'>
        <div className='container'>
          <Col md={12} lg={6} className='custom-presale-col'>
            <div className='custom-presale-left'>
              <h1 className='custom-presale-header color-white'>Token Sale Is {presale?.state == 'NotStarted' ? 'Coming' : (presale?.state == 'Started' ? 'Live' : 'Ended')}!</h1>

              {
                presale?.state == 'Started' && (<div className='custom-timer-header'>Last Moment To Grab The Tokens</div>)
              }

              <div className='custom-presale-body'>
                <Time presale={presale} />

                <div className='custom-progress-container'>
                  <ProgressBar now={presale && (presale.total_bought_amount_in_esdt / presale.token_sale_amount * 100)} ref={tokenSaleTargetRef} />
                  <div className='custome-progress-number color-white'>{presale?.total_bought_amount_in_esdt} / {presale?.token_sale_amount} {BTX_TOKEN_TICKER}</div>
                </div>

                <div className='custom-presale-price'>1 EGLD = {presale?.exchange_rate} {BTX_TOKEN_TICKER}</div>

              </div>

            </div>
          </Col>
          <Col md={12} lg={6} className='custom-presale-col'>
            <div className='custom-buy-card'>
              <div className='custom-buy-card-body'>
                <h3 className='custom-buy-card-header color-white'>Buy Tokens</h3>
                <div className='custom-buy-card-amount'>
                  <div className='custom-buy-card-amount-header'>Amount To Pay</div>
                  <div className='custom-buy-card-amount-container'>
                    <input className='custom-buy-card-amount-input' type='number' onChange={e => onChangeBuyAmountInEgld(Number(e.target.value))} defaultValue={buyAmountInEgld} />
                    <span className='custom-buy-card-amount-unit color-white'>EGLD</span>
                  </div>
                </div>
                <div className='custom-buy-card-amount'>
                  <div className='custom-buy-card-amount-header'>Amount To Get</div>
                  <div className='custom-buy-card-amount-container'>
                    <input className='custom-buy-card-amount-input' type='number' disabled={true} value={buyAmountInEsdt} />
                    <span className='custom-buy-card-amount-unit color-white'>{BTX_TOKEN_TICKER}</span>
                  </div>
                </div>

                <div className='custom-buy-card-info color-white'>Minimum Buy Amount:&nbsp;&nbsp;{presale?.min_buy_limit} EGLD</div>
                <div className='custom-buy-card-info color-white'>Maximum Buy Amount:&nbsp;&nbsp;{'No Limit'}</div>

                <img className="logo-back-elrond" src={ElrondLogo} />
                <img className="logo-back-bitx" src={BitXLogo} />

                <div style={{ paddingTop: '32px' }}>
                  <button className="custom-buy-card-buy-button" onClick={buyToken} disabled={buyButtonDisabled}>Buy {BTX_TOKEN_TICKER}</button>
                  <div className='custom-buy-card-buy-state-info'>{buyStateInfo}</div>
                </div>
              </div>
            </div>
          </Col>
        </div>
      </div >
    </>
  );
};

export default Presale;
