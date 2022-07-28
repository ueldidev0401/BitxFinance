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
  EXCHANGE_RATE,
  MIN_BUY_LIMIT,
  MAX_BUY_LIMIT,
  PRESALE_CONTRACT_ADDRESS,
  PRESALE_CONTRACT_ABI_URL,
  PRESALE_CONTRACT_NAME,
  PRESALE_WHITELIST_URL,
} from 'config';
import {
  TIMEOUT,
  Status,
  ISaleStatusProvider,
  IAccountStateProvider,
  SECOND_IN_MILLI,
  precisionRound,
  IContractInteractor,
  convertToStatus,
  convertWeiToEsdt,
} from 'utils';
import { convertEsdtToWei } from '../../utils/convert';
import Time from './Time';




const Presale = () => {
  const { account } = useGetAccountInfo();
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

  const [saleStatus, setSaleStatus] = React.useState<ISaleStatusProvider | undefined>();
  const [accountState, setAccountState] = React.useState<IAccountStateProvider | undefined>();
  React.useEffect(() => {
    (async () => {
      if (!contractInteractor) return;
      const interaction = contractInteractor.contract.methods.getStatus();
      const res = await contractInteractor.controller.query(interaction);

      if (!res || !res.returnCode.isSuccess()) return;
      const value = res.firstValue?.valueOf();

      const status = convertToStatus(value.field0.valueOf().name);
      const leftTimestamp = value.field1.toNumber() * SECOND_IN_MILLI;
      const goal = convertWeiToEsdt(value.field2);
      const totalBoughtAmountOfEsdt = convertWeiToEsdt(value.field3);

      const result = { status, leftTimestamp, goal, totalBoughtAmountOfEsdt };
      // console.log('getStatus', result);
      setSaleStatus(result);
    })();
  }, [contractInteractor, hasPendingTransactions]);

  React.useEffect(() => {
    (async () => {
      // acount state
      if (!contractInteractor || !account.address) return;
      const args = [new AddressValue(new Address(account.address))];
      const interaction = contractInteractor.contract.methods.getAccountState(args);
      const res = await contractInteractor.controller.query(interaction);

      if (!res || !res.returnCode.isSuccess()) return;

      // const accountState = res.firstValue?.valueOf().toNumber();
      // console.log('accountState', accountState);
      setAccountState({ accountState: res.firstValue?.valueOf().toNumber() });
    })();
  }, [contractInteractor, account.address]);

  const tokenSaleTargetRef = React.useRef(null);

  const [buyAmountInEgld, setBuyAmountInEgld] = React.useState<number>(0);
  const [buyAmountInEsdt, setBuyAmountInEsdt] = React.useState<number>(0);

  const [buyButtonDisabled, setBuyButtonDisabled] = React.useState<boolean>(true);

  const [buyStateInfo, setBuyStateInfo] = React.useState<string>('');

  const onChangeBuyAmountInEgld = (e: any) => {
    e.preventDefault();
    setBuyAmountInEgld(e.target.value);
    setBuyAmountInEsdt(precisionRound(e.target.value / EXCHANGE_RATE));
  };

  React.useEffect(() => {
    let disabled = true;
    let stateInfo = 'You should login to buy tokens.';
    if (saleStatus && saleStatus.status == Status.Started) {
      if (account?.address) {
        if (accountState) {
          if (accountState.accountState == 2) {
            if (MIN_BUY_LIMIT <= buyAmountInEgld && buyAmountInEgld <= MAX_BUY_LIMIT) {
              disabled = false;
            }
            else {
              stateInfo = 'You can only buy tokens between min and max amount.';
            }
          } else if (accountState.accountState == 2) {
            stateInfo = 'Only Whitelist members can buy tokens in the first stage.';
          }
        }
      }
    } else {
      stateInfo = '';
    }

    setBuyButtonDisabled(disabled);
    setBuyStateInfo(stateInfo);
  }, [saleStatus, buyAmountInEgld]);

  async function buyToken(e: any) {
    e.preventDefault();
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
              <h1 className='custom-presale-header color-white'>Token Sale Is {saleStatus?.status == Status.NotStarted ? 'Coming' : (saleStatus?.status == Status.Started ? 'Live' : 'Ended')}!</h1>

              {
                saleStatus?.status == Status.Started && (<div className='custom-timer-header'>Last Moment To Grab The Tokens</div>)
              }

              <div className='custom-presale-body'>
                <Time saleStatus={saleStatus} />

                <div className='custom-progress-container'>
                  <ProgressBar now={saleStatus && (saleStatus.totalBoughtAmountOfEsdt / saleStatus.goal * 100)} ref={tokenSaleTargetRef} />
                  <div className='custome-progress-number color-white'>{saleStatus?.totalBoughtAmountOfEsdt} / {saleStatus?.goal} BITX</div>
                </div>

                <div className='custom-presale-price'>1 EGLD = {1 / EXCHANGE_RATE} BitX</div>
                {/* <div className='custom-presale-goal'>GOAL: { saleStatus?.goal } BitX</div> */}

                <div className="text-center" style={{ display: 'flex', justifyContent: 'center' }}>
                  <a
                    className="whitelist-but"
                    style={{ marginTop: "30px", alignItems: "center", justifyContent: "center", display: "flex" }}
                    href={PRESALE_WHITELIST_URL}
                    target="_blank" rel="noreferrer"
                  >
                    <img src={whiteListLogo} alt="whitelist" style={{ width: "20%" }}></img>
                    <span style={{ paddingLeft: "12px" }}>WhiteList</span>
                  </a>
                </div>
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
                    <input className='custom-buy-card-amount-input' type='number' onChange={onChangeBuyAmountInEgld} defaultValue={buyAmountInEgld} />
                    <span className='custom-buy-card-amount-unit color-white'>EGLD</span>
                  </div>
                </div>
                <div className='custom-buy-card-amount'>
                  <div className='custom-buy-card-amount-header'>Amount To Get</div>
                  <div className='custom-buy-card-amount-container'>
                    <input className='custom-buy-card-amount-input' type='number' disabled={true} value={buyAmountInEsdt} />
                    <span className='custom-buy-card-amount-unit color-white'>BITX</span>
                  </div>
                </div>

                <div className='custom-buy-card-info color-white'>Minimum Buy Amount:&nbsp;&nbsp;<b>{MIN_BUY_LIMIT} EGLD</b></div>
                <div className='custom-buy-card-info color-white'>Maximum Buy Amount:&nbsp;&nbsp;<b>{MAX_BUY_LIMIT} EGLD</b></div>

                <img className="logo-back-elrond" src={ElrondLogo} />
                <img className="logo-back-bitx" src={BitXLogo} />

                <div style={{ paddingTop: '50px' }}>
                  <button className="custom-buy-card-buy-button" onClick={buyToken} disabled={buyButtonDisabled}>Buy BITX</button>
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
