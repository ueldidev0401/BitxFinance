
import React, { useState } from 'react';

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
  BytesValue,
  // Egld,
  BigUIntValue,
  ArgSerializer,
  GasLimit,
  DefaultSmartContractController,
} from '@elrondnetwork/erdjs';

import axios from 'axios';
import Modal from 'react-modal';
import arrow from 'assets/img/arrow.png';
import coin from 'assets/img/coin.png';
import elrondLogo from 'assets/img/Elrond logo.png';
import MareLogo from 'assets/img/token logos/MARE.png';
import AlertModal from '../../../components/AlertModal';
import { MARE_TOKEN_DECIMALS } from '../../../config';


import {
  MARE2MARE_CONTRACT_ADDRESS,
  MARE2MARE_CONTRACT_ABI,
  MARE2MARE_CONTRACT_NAME,
  MARE_TOKEN_TICKER,
  MARE_TOKEN_ID,
} from '../../../config';

import {
  SECOND_IN_MILLI,
  TIMEOUT,
  convertWeiToEsdt,
  convertTimestampToDateTime,
  convertSecondsToDays,
  convertAPR2APY,
  IContractInteractor,
  IBtx2BtxStakeSetting,
  IStakeAccount,
} from '../../../utils';
import { convertEsdtToWei } from '../../../utils/convert';

const Mare2Mare = () => {
  const { account } = useGetAccountInfo();
  const { network } = useGetNetworkConfig();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const provider = new ProxyProvider(network.apiAddress, { timeout: TIMEOUT });

  const [showModal, setShowModal] = useState(false);
  const [isStakeModal, setIsStakeModal] = useState(true);
  const [modalInputAmount, setModalInputAmount] = useState(0);


  const [stakeContractInteractor, setStakeContractInteractor] = React.useState<IContractInteractor | undefined>();
  const [stakeSetting, setStakeSetting] = React.useState<IBtx2BtxStakeSetting | undefined>();
  const [stakeAccount, setStakeAccount] = React.useState<IStakeAccount | undefined>();

  const [balance, setBalance] = React.useState<any>(undefined);

  const [modalInfoMesssage, setModalInfoMesssage] = React.useState<string>('');
  const [modalButtonDisabled, setModalButtonDisabled] = React.useState<boolean>(true);

  const [alertModalShow, setAlertModalShow] = React.useState<boolean>(false);
  const [alertModalText, setAlertModalText] = React.useState<string>('');

  // load smart contract abi and parse it to SmartContract object for tx
  React.useEffect(() => {
    (async () => {
      // const abiRegistry = await AbiRegistry.load({
      //     urls: [MARE2MARE_CONTRACT_ABI],
      // });
      // const contract = new SmartContract({
      //     address: new Address(MARE2MARE_CONTRACT_ADDRESS),
      //     abi: new SmartContractAbi(abiRegistry, [MARE2MARE_CONTRACT_NAME]),
      // });
      // setStakingContract(contract);

      const registry = await AbiRegistry.load({ urls: [MARE2MARE_CONTRACT_ABI] });
      const abi = new SmartContractAbi(registry, [MARE2MARE_CONTRACT_NAME]);
      const contract = new SmartContract({ address: new Address(MARE2MARE_CONTRACT_ADDRESS), abi: abi });
      const controller = new DefaultSmartContractController(abi, provider);

      // console.log('stakeContractInteractor', {
      //   contract,
      //   controller,
      // });

      setStakeContractInteractor({
        contract,
        controller,
      });
    })();
  }, []); // [] makes useEffect run once


  React.useEffect(() => {
    (async () => {
      if (!stakeContractInteractor) return;
      // const interaction: Interaction = stakingContract.methods.getCurrentStakeSetting();
      // const queryResponse = await stakingContract.runQuery(proxy, interaction.buildQuery());
      // const res = interaction.interpretQueryResponse(queryResponse);

      const interaction = stakeContractInteractor.contract.methods.getCurrentStakeSetting();
      const res = await stakeContractInteractor.controller.query(interaction);

      if (!res || !res.returnCode.isSuccess()) return;
      const value = res.firstValue.valueOf();

      // console.log('getCurrentStakeSetting', value);

      const stake_token = value.stake_token.toString();
      const reward_token = value.reward_token.toString();
      const min_stake_limit = convertWeiToEsdt(value.min_stake_limit, MARE_TOKEN_DECIMALS);
      const lock_period = value.lock_period.toNumber();
      const undelegation_period = value.undelegation_period.toNumber();
      const claim_lock_period = value.claim_lock_period.toNumber();
      const apr = value.apr.toNumber() / 100;
      const total_staked_amount = convertWeiToEsdt(value.total_staked_amount, MARE_TOKEN_DECIMALS);
      const number_of_stakers = value.number_of_stakers.toNumber();

      const result = {
        stake_token,
        reward_token,
        min_stake_limit,
        lock_period,
        undelegation_period,
        claim_lock_period,
        apr,
        total_staked_amount,
        number_of_stakers,
      };

      // console.log('getCurrentStakeSetting', result);

      setStakeSetting(result);
    })();
  }, [stakeContractInteractor]);


  React.useEffect(() => {
    (async () => {
      if (!stakeContractInteractor || !account.address || hasPendingTransactions) return;
      // const args = [new AddressValue(new Address(account.address))];
      // const interaction: Interaction = stakingContract.methods.getCurrentStakeAccount(args);
      // const queryResponse = await stakingContract.runQuery(proxy, interaction.buildQuery());
      // const res = interaction.interpretQueryResponse(queryResponse);

      const args = [new AddressValue(new Address(account.address))];
      const interaction = stakeContractInteractor.contract.methods.getCurrentStakeAccount(args);
      const res = await stakeContractInteractor.controller.query(interaction);

      if (!res || !res.returnCode.isSuccess()) return;
      const value = res.firstValue.valueOf();

      // console.log('getCurrentStakeAccount', value);

      const address = value.address.toString();
      const staked_amount = convertWeiToEsdt(value.staked_amount, MARE_TOKEN_DECIMALS);
      const lock_end_timestamp = value.lock_end_timestamp.toNumber();
      const unstaked_amount = convertWeiToEsdt(value.unstaked_amount, MARE_TOKEN_DECIMALS);
      const undelegation_end_timestamp = value.undelegation_end_timestamp.toNumber();
      const collectable_amount = convertWeiToEsdt(value.collectable_amount, MARE_TOKEN_DECIMALS);
      const reward_amount = convertWeiToEsdt(value.reward_amount, MARE_TOKEN_DECIMALS);
      const last_claim_timestamp = value.last_claim_timestamp.toNumber();

      const result = {
        address,
        staked_amount,
        lock_end_timestamp,
        unstaked_amount,
        undelegation_end_timestamp,
        collectable_amount,
        reward_amount,
        last_claim_timestamp,
      };

      // console.log('getCurrentStakeAccount', result);
      setStakeAccount(result);
    })();
  }, [account, stakeContractInteractor, hasPendingTransactions]);


  React.useEffect(() => {
    if (account.address && !hasPendingTransactions) {
      axios.get(`${network.apiAddress}/accounts/${account.address}/tokens?search=${MARE_TOKEN_TICKER}`).then((res: any) => {
        let _balance = 0;
        if (res.data?.length > 0) {
          const tokens = res.data.filter(
            (a: any) => a?.identifier === MARE_TOKEN_ID
          );

          if (tokens.length > 0) {
            // console.log('tokens[0]', tokens[0]);
            _balance = convertWeiToEsdt(tokens[0].balance, MARE_TOKEN_DECIMALS);
          }
        }
        // console.log('_balance', _balance);
        setBalance(_balance);
      });
    }
  }, [account, hasPendingTransactions]);

  function onShowStakeModal() {
    if (!account.address) {
      onShowAlertModal('You should connect your wallet first!');
      return;
    }

    setModalInputAmount(0);
    setModalInfoMesssage('');
    setModalButtonDisabled(true);
    setIsStakeModal(true);
    setShowModal(true);
  }

  function onShowUnstakeModal() {
    if (!account.address) {
      onShowAlertModal('You should connect your wallet first!');
      return;
    }

    setModalInputAmount(0);
    setModalInfoMesssage('');
    setModalButtonDisabled(true);
    setIsStakeModal(false);
    setShowModal(true);
  }

  function onModalInputAmountChange(value: any) {
    if (!account.address || !stakeAccount) return;

    let _modalInfoMesssage = '';
    let _modalButtonDisabled = true;
    const currentTimestamp = (new Date()).getTime();

    if (isStakeModal) { // stake
      if (value > balance) {
        _modalInfoMesssage = 'Not enough tokens in your wallet.';
      } else if (value < stakeSetting.min_stake_limit) {
        _modalInfoMesssage = `Cannot stake less than ${stakeSetting.min_stake_limit} ${MARE_TOKEN_TICKER}.`;
      } else {
        _modalButtonDisabled = false;
      }
    } else {  // unstake
      if (value > stakeAccount.staked_amount) {
        _modalInfoMesssage = 'Cannot unstake more than staked amount.';
      } else if (value <= 0) {
        _modalInfoMesssage = 'Invalid amount.';
      } else if (currentTimestamp < stakeAccount.lock_end_timestamp * SECOND_IN_MILLI) {
        _modalInfoMesssage = `Cannot unstake before ${convertTimestampToDateTime(stakeAccount.lock_end_timestamp * SECOND_IN_MILLI)}`;
      } else {
        _modalButtonDisabled = false;
      }
    }

    setModalInfoMesssage(_modalInfoMesssage);
    setModalButtonDisabled(_modalButtonDisabled);
    setModalInputAmount(value);
  }

  function onModalMaximize() {
    const value = isStakeModal ? balance : stakeAccount.staked_amount;
    onModalInputAmountChange(value);
  }

  function onShowAlertModal(text: string) {
    setAlertModalText(text);
    setAlertModalShow(true);
  }
  async function stake(e: any) {
    e.preventDefault();

    if (balance == 0) {
      onShowAlertModal(`You don\'t have ${MARE_TOKEN_TICKER} in your wallet.`);
      return;
    }

    const args: TypedValue[] = [
      BytesValue.fromUTF8(MARE_TOKEN_ID),
      new BigUIntValue(convertEsdtToWei(modalInputAmount, MARE_TOKEN_DECIMALS)),
      BytesValue.fromUTF8('stake'),
    ];
    const { argumentsString } = new ArgSerializer().valuesToString(args);
    const data = `ESDTTransfer@${argumentsString}`;

    const tx = {
      receiver: MARE2MARE_CONTRACT_ADDRESS,
      gasLimit: new GasLimit(10000000),
      data: data,
    };

    await refreshAccount();
    sendTransactions({
      transactions: tx,
    });

    setShowModal(false);
  }

  async function unstake(e: any) {
    e.preventDefault();

    if (stakeAccount.staked_amount == 0) {
      onShowAlertModal('You don\'t have staked tokens.');
      return;
    }

    const args: TypedValue[] = [
      new BigUIntValue(convertEsdtToWei(modalInputAmount, MARE_TOKEN_DECIMALS)),
    ];
    const { argumentsString } = new ArgSerializer().valuesToString(args);
    const data = `unstake@${argumentsString}`;

    const tx = {
      receiver: MARE2MARE_CONTRACT_ADDRESS,
      data: data,
      gasLimit: new GasLimit(6000000),
    };
    await refreshAccount();
    await sendTransactions({
      transactions: tx,
    });

    setShowModal(false);
  }

  async function claim(e: any) {
    e.preventDefault();

    if (!account.address) {
      onShowAlertModal('You should connect your wallet first!');
      return;
    }

    if (stakeAccount.reward_amount == 0 && stakeAccount.collectable_amount == 0) {
      onShowAlertModal('You don\'t have rewards or collectables to be claimed.');
      return;
    }

    const currentTimestamp = (new Date()).getTime();
    const claimLockEndTimestamp = (stakeAccount.last_claim_timestamp + stakeSetting.claim_lock_period) * SECOND_IN_MILLI;
    // console.log(`currentTimestamp: ${currentTimestamp} ----- claimLockEndTimestamp: ${claimLockEndTimestamp}`);
    if (currentTimestamp < claimLockEndTimestamp) {
      onShowAlertModal(`Cannot claim before ${convertTimestampToDateTime(claimLockEndTimestamp)}`);
      return;
    }

    const tx = {
      receiver: MARE2MARE_CONTRACT_ADDRESS,
      data: 'claim',
      gasLimit: new GasLimit(6000000),
    };
    await refreshAccount();
    await sendTransactions({
      transactions: tx,
    });
  }

  return (
    <div className='card'>
      <div className='stake_earn'>
        <div>
          <img src={MareLogo} />
          <p>Stake $MARE</p>
        </div>
        <img src={arrow} />
        <div>
          <img src={MareLogo} />
          <p>Earn $MARE</p>
        </div>
      </div>

      {/* <p className='description'>
                BitX Finance is a decentralized social economic platform that is making private aviation accessible to anyone
            </p> */}
      {/* <hr className='hr'/> */}
      <div className='info' style={{ marginTop: "8px" }}>
        <div>
          <p className='heading'>APR</p>
          <p className='data'>{stakeSetting ? stakeSetting.apr : '-'} %</p>
        </div>
        <div>
          <p className='heading'>APY</p>
          <p className='data'>{stakeSetting ? convertAPR2APY(stakeSetting.apr) : '-'} %</p>
        </div>
        <div>
          <p className='heading'>Total Staked</p>
          <p className='data'>{stakeSetting ? stakeSetting.total_staked_amount : '-'} {MARE_TOKEN_TICKER}</p>
        </div>
        <div>
          <p className='heading'>Total Stakers</p>
          <p className='data'>{stakeSetting ? stakeSetting.number_of_stakers : '-'}</p>
        </div>
      </div>

      <div className='staking-info'>
        <div className='info'>
          <div>
            <p className='heading'>Lock</p>
            <p className='data'>{"5 Days"}</p>
          </div>
          <div>
            <p className='heading'>Undelegation</p>
            <p className='data'>{"5 Days"}</p>
          </div>
        </div>
      </div>

      <div className='buttonDiv'>
        <button className='stake_button' onClick={onShowStakeModal}>
          <p>Stake</p>
        </button>
        <button className='unstake_button' onClick={onShowUnstakeModal}>
          <p>Unstake</p>
        </button>
      </div>

      <div className='info'>
        <div>
          <p className='heading'>My Staked</p>
          <p className='data'>{stakeAccount ? stakeAccount.staked_amount : '-'} MARE</p>
        </div>
        <div>
          <p className='heading'>My Unstaked</p>
          <p className='data'>{stakeAccount ? stakeAccount.unstaked_amount : '-'} MARE</p>
        </div>
        <div>
          <p className='heading'>My Reward</p>
          <p className='data'>{stakeAccount ? stakeAccount.reward_amount : '-'} MARE</p>
        </div>
        <div>
          <p className='heading'>My Collectable</p>
          <p className='data'>{stakeAccount ? stakeAccount.collectable_amount : '-'} MARE</p>
        </div>
      </div>

      <img className="elrond" src={elrondLogo} />
      <div style={{ textAlign: "center", display: "flex", justifyContent: "center" }}>
        <button className='claimReward_button' onClick={claim}>
          <p>Claim</p>
        </button>
      </div>

      <Modal
        isOpen={showModal}
        onRequestClose={() => {
          setShowModal(false);
        }}
        ariaHideApp={false}
        className='modalcard box-shadow'
      >
        <img className={"coin"} src={coin} />
        <div className='modaldiv'>
          <h3 className='modalHeader'>
            {isStakeModal ? 'Stake' : 'Unstake'}
          </h3>
        </div>
        <p className='modal-description'>
          {
            showModal && stakeSetting && (isStakeModal ?
              `Your tokens will be locked for ${convertSecondsToDays(stakeSetting.lock_period)} days after deposit (even the tokens that are already staked)`
              : `Your tokens will be undelegated for ${convertSecondsToDays(stakeSetting.undelegation_period)} days after unstake (even the tokens that are already unstaked)`)
          }
        </p>
        <div className='modal-divider'></div>
        <div
          style={{
            marginTop: '15px'
          }}
          className='font-24'
        >
          <span>{isStakeModal ? 'Balance' : 'Staked'}:&nbsp;&nbsp;</span>
          <span style={{ color: '#FEE277', fontWeight: 600, fontSize: '1rem' }}>
            {showModal && (isStakeModal ? balance : stakeAccount.staked_amount)}
          </span>
          <span>&nbsp;{MARE_TOKEN_TICKER}</span>
        </div>
        <h6 className='modal-info-1'>
          {isStakeModal ? 'Amount to Stake' : 'Amount to Unstake'}
        </h6>
        <div className='modal-div-1'>
          <input className='modal-input-1'
            placeholder='Amount'
            type='number'
            min='0'
            value={modalInputAmount}
            onChange={(e) => onModalInputAmountChange(e.target.value)}
          />
          <button className='maximize-button'
            onClick={onModalMaximize}
          >
            MAX
          </button>
        </div>
        <div className='modal-divider' style={{ paddingTop: "20px" }}></div>
        <div className='modal-info-message'>
          {modalInfoMesssage}
        </div>
        {
          isStakeModal ? (
            <button
              className='modal-submit-button'
              onClick={stake}
              disabled={modalButtonDisabled}
            >
              Stake
            </button>
          ) : (
            <button
              className='modal-submit-button'
              onClick={unstake}
              disabled={modalButtonDisabled}
            >
              Unstake
            </button>
          )
        }
      </Modal>
      <AlertModal
        show={alertModalShow}
        onHide={() => setAlertModalShow(false)}
        alertmodaltext={alertModalText}
      />
    </div>
  );
};

export default Mare2Mare;