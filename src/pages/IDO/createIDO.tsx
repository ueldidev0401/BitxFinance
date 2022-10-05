/* eslint-disable import/order */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useState, useRef } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import Box from '@mui/material/Box';
import Step from '@mui/material/Step';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';
import { StepIconProps } from '@mui/material/StepIcon';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';

import { ImEarth } from "react-icons/im";
import { SiTelegram, SiDiscord, SiTwitter, SiYoutube, SiLinkedin, SiMedium } from "react-icons/si";

import BTX_logo from 'assets/img/token logos/BTX.png';
import congratulations_img from 'assets/img/ido/congratulations.png';
import { routeNames } from 'routes';

import { toast } from 'react-toastify';
import { swtichSocialIcon } from 'utils/social';

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
	AddressValue,
	AbiRegistry,
	SmartContractAbi,
	SmartContract,
	ProxyProvider,
	TypedValue,
	BytesValue,
	Egld,
	BigUIntValue,
	ArgSerializer,
	GasLimit,
	DefaultSmartContractController,
	U64Value,
	U32Value,
} from '@elrondnetwork/erdjs';
import axios from 'axios';
import BigNumber from 'bignumber.js/bignumber.js';
import {
	IDO_CONTRACT_ADDRESS,
	IDO_CONTRACT_ABI_URL,
	IDO_CONTRACT_NAME,
	WEGLD_ID,
} from 'config';
import {
	SECOND_IN_MILLI,
	TIMEOUT,
	convertWeiToEsdt,
	convertTimestampToDateTime,
	convertTimestampToDays,
	convertAPR2APY,
	IContractInteractor,
	getBalanceOfToken,
	getEsdtTokenId,
	getPrice,
} from 'utils';

import { ICOState } from './data';

import moment from 'moment';

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
	[`&.${stepConnectorClasses.alternativeLabel}`]: {
		top: 22,
	},
	[`&.${stepConnectorClasses.active}`]: {
		[`& .${stepConnectorClasses.line}`]: {
			// backgroundImage:
			//     'linear-gradient( 95deg, rgb(53 220 158) 0%, rgb(23 149 85) 50%, rgb(2 86 68) 100%)',

			background: '#6A9B84'
		},
	},
	[`&.${stepConnectorClasses.completed}`]: {
		[`& .${stepConnectorClasses.line}`]: {
			// backgroundImage:
			//     'linear-gradient( 95deg, rgb(53 220 158) 0%, rgb(23 149 85) 50%, rgb(2 86 68) 100%)',
			background: '#6A9B84'
		},
	},
	[`& .${stepConnectorClasses.line}`]: {
		height: 2,
		border: 0,
		backgroundColor:
			theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#D3D3D3',
		borderRadius: 1,
	},
}));

const ColorlibStepIconRoot = styled('div')<{
	ownerState: { completed?: boolean; active?: boolean };
}>(({ theme, ownerState }) => ({
	backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
	// border: '1px solid gray',
	zIndex: 1,
	color: '#000',
	width: 50,
	height: 50,
	display: 'flex',
	borderRadius: '50%',
	justifyContent: 'center',
	alignItems: 'center',
	fontSize: "20px",
	...(ownerState.active && {

		// backgroundImage:
		//     'linear-gradient( 136deg, rgb(53 220 158) 0%, rgb(23 149 85) 50%, rgb(2 86 68) 100%)',
		background: '#6A9B84',
		boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
		color: '#fff',
	}),
	...(ownerState.completed && {
		// backgroundImage:
		//     'linear-gradient( 136deg, rgb(53 220 158) 0%, rgb(23 149 85) 50%, rgb(2 86 68) 100%)',
		background: '#6A9B84',
		color: '#fff',
	}),
}));

function ColorlibStepIcon(props: StepIconProps) {
	const { active, completed, className } = props;

	const icons: { [index: string]: React.ReactElement } = {
		1: <div>1</div>,
		2: <div>2</div>,
		3: <div>3</div>,
		4: <div>4</div>,
	};

	return (
		<ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
			{icons[String(props.icon)]}
		</ColorlibStepIconRoot>
	);
}

const createIDO = () => {
	const { account, address } = useGetAccountInfo();
	const { network } = useGetNetworkConfig();
	const { hasPendingTransactions } = useGetPendingTransactions();
	const provider = new ProxyProvider(network.apiAddress, { timeout: TIMEOUT });

	const [idoContractInteractor, setIdoContractInteractor] = React.useState<IContractInteractor | undefined>();
	const [idoSetting, setIdoSetting] = React.useState(
		{
			fee_percent_as_fund_token1: 0,
			fee_percent_as_presale_token1: 0,
			fee_percent_as_fund_token2: 0,
			fee_percent_as_presale_token2: 0,
			min_percent_soft_cap: 0,
			maiar_router_address: '',
			min_percent_maiar_exchange_liquidity: 0,
			max_percent_maiar_exchange_liquidity: 0,
		}
	);

	// load smart contract abi and parse it to SmartContract object for tx
	React.useEffect(() => {
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

	React.useEffect(() => {
		(async () => {
			if (!idoContractInteractor) return;

			const interaction = idoContractInteractor.contract.methods.getIdoInfo();
			const res = await idoContractInteractor.controller.query(interaction);

			if (!res || !res.returnCode.isSuccess()) return;
			const value = res.firstValue.valueOf();

			const fee_percent_as_fund_token1 = value.fee_percent_as_fund_token1.toNumber() / 100;
			const fee_percent_as_presale_token1 = value.fee_percent_as_presale_token1.toNumber() / 100;
			const fee_percent_as_fund_token2 = value.fee_percent_as_fund_token2.toNumber() / 100;
			const fee_percent_as_presale_token2 = value.fee_percent_as_presale_token2.toNumber() / 100;
			const min_percent_soft_cap = value.min_percent_soft_cap.toNumber() / 100;
			const maiar_router_address = value.maiar_router_address.toString();
			const min_percent_maiar_exchange_liquidity = value.min_percent_maiar_exchange_liquidity.toNumber() / 100;
			const max_percent_maiar_exchange_liquidity = value.max_percent_maiar_exchange_liquidity.toNumber() / 100;

			const result = {
				fee_percent_as_fund_token1,
				fee_percent_as_presale_token1,
				fee_percent_as_fund_token2,
				fee_percent_as_presale_token2,
				min_percent_soft_cap,
				maiar_router_address,
				min_percent_maiar_exchange_liquidity,
				max_percent_maiar_exchange_liquidity,
			};
			console.log(result);

			setIdoSetting(result);
		})();
	}, [idoContractInteractor]);

	const steps = ['Verify Token', 'Add Launchpad Info', 'Add Additional Info', 'Finish and Review'];
	const [activeStep, setActiveStep] = useState<number>(0);
	const [idoCreated, setIdoCreated] = useState<boolean>(false);
	const [tokenInfo, setTokenInfo] = useState<any>();
	const [egldPrice, setEgldPrice] = useState<number>(0);

	const handleChangeStep = async (n: number) => {
		let stepN = n;
		if (stepN < 0) {
			stepN = 0;
		}
		if (stepN === 1) {
			// console.log(token_identifier);
			console.log(currencyType, feeType);
			// check token id
			if (token_identifier.length > 0) {
				const res: any = await getEsdtTokenId(network.apiAddress, token_identifier);
				if (res.status) {
					console.log(res.data);
					setTokenInfo(res.data);
				} else {
					stepN = 0;
					toast.error("Token Identifier is incorrect");
				}
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
			} else {
				stepN = 0;
				toast.error("Token Identifier is incorrect");
			}
		}
		if (stepN === 2) {
			console.log(presale_rate);
			if (presale_rate === undefined || presale_rate <= 0) {
				stepN = 1;
				toast.error("Presale rate is incorrect");
			}
			console.log(hard_cap);
			if (hard_cap === undefined || hard_cap <= 0) {
				stepN = 1;
				toast.error("Hard Cap is incorrect");
			}
			console.log(soft_cap);
			if (soft_cap === undefined || soft_cap <= 0 || soft_cap < (hard_cap * idoSetting?.min_percent_soft_cap / 100)) {
				stepN = 1;
				toast.error("Soft Cap is incorrect");
			}
			console.log(min_buy);
			if (min_buy === undefined || min_buy <= 0) {
				stepN = 1;
				toast.error("Minimum buy is incorrect");
			}
			console.log(max_buy);
			if (max_buy === undefined || max_buy <= 0) {
				stepN = 1;
				toast.error("Maximum buy is incorrect");
			}
			console.log(maiar_exchange_liquidity);
			if (maiar_exchange_liquidity === undefined || maiar_exchange_liquidity <= 0 || maiar_exchange_liquidity <= idoSetting?.min_percent_maiar_exchange_liquidity || maiar_exchange_liquidity > idoSetting?.max_percent_maiar_exchange_liquidity) {
				stepN = 1;
				toast.error("Maiar exchange liquidity is incorrect");
			}
			console.log(maiar_listing_rate);
			if (maiar_listing_rate === undefined || maiar_listing_rate <= 0) {
				stepN = 1;
				toast.error("Maiar listing rate is incorrect");
			}
			console.log(moment(start_time).valueOf());
			console.log(end_time);
			console.log(liquidity_lockup_days);
			if (liquidity_lockup_days === undefined || liquidity_lockup_days <= 0) {
				stepN = 1;
				toast.error("Liquidity lockup days is incorrect");
			}
		}
		if (stepN === 3) {
			console.log(description);
			if (description === undefined || description.length <= 0) {
				stepN = 2;
				toast.error("Please type description.");
			}
			const socials = [
				{
					name: "website",
					link: inputWebsiteRef.current?.value
				},
				{
					name: "telegram",
					link: inputTelegramRef.current?.value
				},
				{
					name: "discord",
					link: inputDiscordRef.current?.value
				},
				{
					name: "twitter",
					link: inputTwitterRef.current?.value
				},
				{
					name: "youtube",
					link: inputYoutubeRef.current?.value
				},
				{
					name: "linkedIn",
					link: inputLinkedInRef.current?.value
				},
				{
					name: "medium",
					link: inputMediumRef.current?.value
				},
			];
			setSocialLinks(socials);
		}
		if (stepN >= 4) {
			stepN = 3;
			// handle tx
			let fee_option_id = 1;
			if (feeType === 'fee_type_0') {
				fee_option_id = 1;
			}
			if (feeType === 'fee_type_1') {
				fee_option_id = 2;
			}
			const amount = (new BigNumber(presale_rate * hard_cap)).multipliedBy(Math.pow(10, tokenInfo.decimals));
			const presaleRate = (new BigNumber(presale_rate)).multipliedBy(Math.pow(10, tokenInfo.decimals));
			const softCap = (new BigNumber(soft_cap)).multipliedBy(Math.pow(10, tokenInfo.decimals));
			const hardCap = (new BigNumber(hard_cap)).multipliedBy(Math.pow(10, tokenInfo.decimals));
			const minBuyAmount = (new BigNumber(min_buy)).multipliedBy(Math.pow(10, tokenInfo.decimals));
			const maxBuyAmount = (new BigNumber(max_buy)).multipliedBy(Math.pow(10, tokenInfo.decimals));
			const maiarListingRate = (new BigNumber(maiar_listing_rate)).multipliedBy(Math.pow(10, tokenInfo.decimals));
			const args: TypedValue[] = [
				BytesValue.fromUTF8(token_identifier),
				new BigUIntValue(amount.valueOf()),
				BytesValue.fromUTF8('create'),
				BytesValue.fromUTF8(token_identifier),
				new U32Value(tokenInfo.decimals),
				BytesValue.fromUTF8(tokenInfo.name),
				BytesValue.fromUTF8(currencyType),
				new U32Value(fee_option_id),
				new BigUIntValue(presaleRate.valueOf()),
				new BigUIntValue(softCap.valueOf()),
				new BigUIntValue(hardCap.valueOf()),
				new BigUIntValue(minBuyAmount.valueOf()),
				new BigUIntValue(maxBuyAmount.valueOf()),
				new U32Value(maiar_exchange_liquidity * 100),
				new BigUIntValue(maiarListingRate.valueOf()),
				new U64Value(moment(start_time).valueOf()),
				new U64Value(moment(end_time).valueOf()),
				new U64Value(liquidity_lockup_days * 24 * 3600 * 1000),
				BytesValue.fromUTF8(description),
				BytesValue.fromUTF8(socialLinks[0].link),
				BytesValue.fromUTF8(socialLinks[1].link),
				BytesValue.fromUTF8(socialLinks[2].link),
				BytesValue.fromUTF8(socialLinks[3].link),
				BytesValue.fromUTF8(socialLinks[4].link),
				BytesValue.fromUTF8(socialLinks[5].link),
				BytesValue.fromUTF8(socialLinks[6].link),
			];
			const { argumentsString } = new ArgSerializer().valuesToString(args);
			const data = `ESDTTransfer@${argumentsString}`;

			const tx = {
				receiver: IDO_CONTRACT_ADDRESS,
				gasLimit: new GasLimit(10000000),
				data: data,
			};

			await refreshAccount();
			const result = await sendTransactions({
				transactions: tx,
			});

			console.log(result);
			setSessionId(result.sessionId);
		}
		setActiveStep(stepN);
	};

	const [sessionId, setSessionId] = useState<string>('');
	const transactionStatus = transactionServices.useTrackTransactionStatus({
		transactionId: sessionId,
	});
	useEffect(() => {
		if (transactionStatus.isSuccessful) {
			console.log("success");
			setIdoCreated(true);
		}
	}, [sessionId, hasPendingTransactions]);

	/** step 1 */
	const [currencyType, setCurrencyType] = useState<string>("EGLD");
	const [feeType, setFeeType] = useState<string>("fee_type_0");

	const handleCurrencyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setCurrencyType((event.target as HTMLInputElement).value);
	};

	const handleFeeTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFeeType((event.target as HTMLInputElement).value);
	};


	/** step 2 */

	/*
	const [isWhitelisted, setWhitelist] = useState<boolean>(true);
	const handleWhitelistChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		console.log(event.target.value);
		setWhitelist(event.target.value === 'true');
	};
	*/
	const [token_identifier, setTokenIdentifier] = useState<string | undefined>('');

	const [presale_rate, setPreSaleRate] = useState<number | undefined>();
	const [soft_cap, setSoftCap] = useState<number | undefined>();
	const [hard_cap, setHardCap] = useState<number | undefined>();
	const [min_buy, setMinimumBuy] = useState<number | undefined>();
	const [max_buy, setMaximumBuy] = useState<number | undefined>();
	const [maiar_exchange_liquidity, setMaiarExchangeLiquidity] = useState<number | undefined>();
	const [maiar_listing_rate, setMaiarListingRate] = useState<number | undefined>();
	const [start_time, setStartTime] = useState<Date | null>(new Date());
	const [end_time, setEndTime] = useState<Date | null>(new Date());
	const [liquidity_lockup_days, setLiquidityLockupDays] = useState<number | undefined>();

	const [description, setDescription] = useState<string>();
	const [socialLinks, setSocialLinks] = useState<any>([]);

	const inputWebsiteRef = useRef<HTMLInputElement>(null);
	const inputTelegramRef = useRef<HTMLInputElement>(null);
	const inputDiscordRef = useRef<HTMLInputElement>(null);
	const inputTwitterRef = useRef<HTMLInputElement>(null);
	const inputYoutubeRef = useRef<HTMLInputElement>(null);
	const inputLinkedInRef = useRef<HTMLInputElement>(null);
	const inputMediumRef = useRef<HTMLInputElement>(null);

	return (
		<>

			{
				idoCreated && (
					<>
						<div className='ido-launched-box d-flex justify-content-center align-items-center flex-column'>
							<img className='congratulations-img' src={congratulations_img} alt="BitX IDO created successfully" />
							<div className='mt-3'>
								<Link to={routeNames.idolaunchpad}>
									<span style={{ color: "white", textDecoration: 'underline' }}>Go Home</span>
								</Link>
							</div>
						</div>
					</>
				)
			}
			{
				!idoCreated && (
					<div className='home-container mb-5'>
						<p className='lock-process text-center'>Create Launchpad</p>

						<Box sx={{ width: '100%', marginTop: "40px" }}>
							<Stepper alternativeLabel activeStep={activeStep} connector={<ColorlibConnector />}>
								{steps.map((label) => (
									<Step key={label}>
										<StepLabel StepIconComponent={ColorlibStepIcon}><span style={{ color: "#D3D3D3", fontSize: "13px" }}>{label}</span></StepLabel>
									</Step>
								))}
							</Stepper>

							{/** step 1 */}
							<div className="Step-Box">
								{
									activeStep == 0 && (
										<>
											<p className="step-title">Token Identifier *</p>
											<input
												className='ido-input'
												value={token_identifier}
												onChange={(e) => setTokenIdentifier(e.target.value)}
											/>

											<p className="step-title mt-4">Currency </p>
											<FormControl>
												{/* <FormLabel id="demo-controlled-radio-buttons-group">Gender</FormLabel> */}
												<RadioGroup
													row
													aria-labelledby="demo-controlled-radio-buttons-group"
													name="controlled-radio-buttons-group"
													value={currencyType}
													onChange={handleCurrencyChange}
												>
													<FormControlLabel
														value="EGLD"
														control={<Radio sx={{
															color: '#6A9B84',
															'&.Mui-checked': {
																color: '#6A9B84',
															},
														}} />}
														label="EGLD" />
													{/* <FormControlLabel
														value="MEX"
														control={<Radio sx={{
															color: '#6A9B84',
															'&.Mui-checked': {
																color: '#6A9B84',
															},
														}} />}
														label="MEX" />
													<FormControlLabel
														value="ITHEUM"
														control={<Radio sx={{
															color: '#6A9B84',
															'&.Mui-checked': {
																color: '#6A9B84',
															},
														}} />}
														label="ITHEUM" />
													<FormControlLabel
														value="USDC"
														control={<Radio sx={{
															color: '#6A9B84',
															'&.Mui-checked': {
																color: '#6A9B84',
															},
														}} />}
														label="USDC" /> */}
												</RadioGroup>
											</FormControl>

											<p className="step-title mt-4">Fee Options </p>
											<FormControl>
												{/* <FormLabel id="demo-controlled-radio-buttons-group">Gender</FormLabel> */}
												<RadioGroup
													aria-labelledby="demo-controlled-radio-buttons-group"
													name="controlled-radio-buttons-group"
													value={feeType}
													onChange={handleFeeTypeChange}
												>
													<FormControlLabel
														value="fee_type_0"
														control={<Radio sx={{
															color: '#6A9B84',
															'&.Mui-checked': {
																color: '#6A9B84',
															},
														}} />}
														label={idoSetting?.fee_percent_as_fund_token1 + "% EGLD raised only"} />
													<FormControlLabel
														value="fee_type_1"
														control={<Radio sx={{
															color: '#6A9B84',
															'&.Mui-checked': {
																color: '#6A9B84',
															},
														}} />}
														label={idoSetting?.fee_percent_as_fund_token2 + "% EGLD raised + " + idoSetting?.fee_percent_as_presale_token2 + "% token raised"} />
												</RadioGroup>
											</FormControl>
										</>
									)
								}

								{
									activeStep == 1 && (
										<>
											<div>
												<div className="input-state ">Presale Rate *</div>
												<input
													className='ido-input mt-2 mb-1'
													type='number'
													value={presale_rate}
													onChange={(e) => setPreSaleRate(Number(e.target.value))}
												/>
												<span className='input-comment'>If I spend 1 EGLD how many tokens will I receive?</span>
											</div>

											{/* <div className='d-flex flex-column mt-4'>
												<div className="input-state ">Whitelist</div>
												<FormControl>
													<RadioGroup
														row
														aria-labelledby="demo-controlled-radio-buttons-group"
														name="controlled-radio-buttons-group"
														value={isWhitelisted}
														onChange={handleWhitelistChange}
													>
														<FormControlLabel
															value={true}
															control={<Radio sx={{
																color: '#6A9B84',
																'&.Mui-checked': {
																	color: '#6A9B84',
																},
															}} />}
															label="Enable" />
														<FormControlLabel
															value={false}
															control={<Radio sx={{
																color: '#6A9B84',
																'&.Mui-checked': {
																	color: '#6A9B84',
																},
															}} />}
															label="Disable" />
													</RadioGroup>
												</FormControl>
												<span className='input-comment' style={{ marginTop: '-8px' }}>You can enable/disable whitelist anytime</span>
											</div> */}

											<div className='mt-5'>
												<Row>
													<Col sm={6}>
														<div className="input-state ">SoftCap (EGLD) *</div>
														<input
															className='ido-input mt-2 mb-1'
															type='number'
															value={soft_cap}
															onChange={(e) => setSoftCap(Number(e.target.value))}
														/>
														<span className='input-comment'>{"SoftCap must be >= " + idoSetting?.min_percent_soft_cap + "% of HardCap"}</span>
													</Col>
													<Col sm={6}>
														<div className="input-state ">HardCap (EGLD) *</div>
														<input
															className='ido-input mt-2 mb-1'
															type='number'
															value={hard_cap}
															onChange={(e) => setHardCap(Number(e.target.value))}
														/>
													</Col>
													<Col sm={6}>
														<div className="input-state ">Minimum Buy (EGLD) *</div>
														<input
															className='ido-input mt-2 mb-1'
															type='number'
															value={min_buy}
															onChange={(e) => setMinimumBuy(Number(e.target.value))}
														/>
													</Col>
													<Col sm={6}>
														<div className="input-state ">Maximum Buy (EGLD) *</div>
														<input
															className='ido-input mt-2 mb-1'
															type='number'
															value={max_buy}
															onChange={(e) => setMaximumBuy(Number(e.target.value))}
														/>
													</Col>
													<Col sm={6}>
														{/* <div className="input-state ">Refund type</div> */}
														<div className="input-state ">Token Amount</div>
														<input className='ido-input mt-2 mb-1'
															value={presale_rate === undefined || hard_cap === undefined ? 0 : presale_rate * hard_cap}
															disabled
														/>
													</Col>
													<Col sm={6}>
														<div className="input-state ">Router *</div>
														<input className='ido-input mt-2 mb-1' disabled value={idoSetting?.maiar_router_address} />
													</Col>
													<Col sm={6}>
														<div className="input-state ">{"Maiar Exchange liquidity (%) *"}</div>
														<input
															className='ido-input mt-2 mb-1'
															type='number'
															value={maiar_exchange_liquidity}
															onChange={(e) => setMaiarExchangeLiquidity(Number(e.target.value))}
														/>
													</Col>
													<Col sm={6}>
														<div className="input-state ">{"Maiar listing rate *"}</div>
														<input
															className='ido-input mt-2 mb-1'
															type='number'
															value={maiar_listing_rate}
															onChange={(e) => setMaiarListingRate(Number(e.target.value))}
														/>
														<span className='input-comment'>{`1 EGLD = ${maiar_listing_rate === undefined ? 0 : maiar_listing_rate} ${token_identifier}`}</span>
													</Col>
												</Row>

												<div className='d-flex flex-column mt-4' style={{ fontSize: '12px', color: "#6A9B84" }}>
													<span>
														{"Enter the percentage of raised funds that should be allocated to Liquidity on Maiar Exchange (Min " + idoSetting?.min_percent_maiar_exchange_liquidity + "%, Max " + idoSetting?.max_percent_maiar_exchange_liquidity + "%)"}
													</span>
													<span>
														{" If I spend 1 EGLD on Maiar Exchange how many tokens will I receive? Usually this amount is lower than presale rate to allow for a higher listing price on Maiar Exchange."}
													</span>
												</div>

												<Row className='mt-4'>
													<Col sm={3}>
														<div className="input-state ">Start time (UTC) *</div>
														<LocalizationProvider dateAdapter={AdapterDateFns}>
															<MobileDateTimePicker
																value={start_time}
																onChange={(newValue) => {
																	setStartTime(newValue);
																}}
																renderInput={(params) => <TextField {...params} />}
																minDateTime={new Date()}
															/>
														</LocalizationProvider>
													</Col>
													<Col sm={3}>
														<div className="input-state ">End time (UTC) *</div>
														<LocalizationProvider dateAdapter={AdapterDateFns}>
															<MobileDateTimePicker
																value={end_time}
																onChange={(newValue) => {
																	setEndTime(newValue);
																}}
																renderInput={(params) => <TextField {...params} />}
																minDateTime={new Date()}
															/>
														</LocalizationProvider>
													</Col>
													<Col sm={6}>
														<div className="input-state ">Liquidity lockup (days) *</div>
														<input
															className='ido-input mt-2 mb-1'
															value={liquidity_lockup_days}
															onChange={(e) => setLiquidityLockupDays(Number(e.target.value))}
														/>
													</Col>
												</Row>

												{/* <p className="step-title">Vesting Contributor *</p>

												<Row className='mt-4'>
													<Col sm={12}>
														<div className="input-state ">First release for presale (percent) *</div>
														<input className='ido-input mt-2 mb-1' />
													</Col>
													<Col sm={6}>
														<div className="input-state ">Vesting period each cycle (days) *</div>
														<input className='ido-input mt-2 mb-1' />
													</Col>
													<Col sm={6}>
														<div className="input-state ">Presale token release each cycle (percent) *</div>
														<input className='ido-input mt-2 mb-1' />
													</Col>
												</Row> */}

												<div className='d-flex justify-content-center mt-5'>
													<h5 style={{ color: '#2996B8' }}>
														Not enough balance in your wallet. Need 350000 BTX to create launchpad. (Your balance: XXX BTX)
													</h5>
												</div>
											</div>
										</>
									)
								}

								{
									activeStep == 2 && (
										<>
											<p className="step-title">Let People know who you are *</p>

											<Row>
												<Col sm={12}>
													<div className="input-state ">Description</div>
													<textarea
														className='ido-input'
														value={description}
														onChange={(e) => setDescription(e.target.value)}
													/>
												</Col>
												{/* <Col sm={6}>
													<div className="input-state ">Token For Presale *</div>
													<input className='ido-input' />
												</Col>
												<Col sm={6}>
													<div className="input-state ">Token For Liquidity *</div>
													<input className='ido-input' />
												</Col> */}
											</Row>

											<p className="step-title mt-5">Social Links</p>
											<div className='d-flex flex-column' style={{ rowGap: '10px' }}>
												<div className='d-flex align-items-center justify-content-center'>
													<div style={{ fontSize: '20px' }}> <ImEarth /> </div>
													<input className='ido-input ml-2' ref={inputWebsiteRef} />
												</div>

												<div className='d-flex'>
													<div style={{ fontSize: '20px' }}> <SiTelegram /> </div>
													<input className='ido-input ml-2' ref={inputTelegramRef} />
												</div>

												<div className='d-flex'>
													<div style={{ fontSize: '20px' }}> <SiDiscord /> </div>
													<input className='ido-input ml-2' ref={inputDiscordRef} />
												</div>

												<div className='d-flex'>
													<div style={{ fontSize: '20px' }}> <SiTwitter /> </div>
													<input className='ido-input ml-2' ref={inputTwitterRef} />
												</div>

												<div className='d-flex'>
													<div style={{ fontSize: '20px' }}> <SiYoutube /> </div>
													<input className='ido-input ml-2' ref={inputYoutubeRef} />
												</div>

												<div className='d-flex'>
													<div style={{ fontSize: '20px' }}> <SiLinkedin /> </div>
													<input className='ido-input ml-2' ref={inputLinkedInRef} />
												</div>

												<div className='d-flex'>
													<div style={{ fontSize: '20px' }}> <SiMedium /> </div>
													<input className='ido-input ml-2' ref={inputMediumRef} />
												</div>
											</div>
										</>
									)
								}

								{
									activeStep == 3 && (
										<>
											<div className="d-flex align-items-center">
												{/* <div className='d-flex'>
													<div>
														<img src={BTX_logo} alt="BitX logo" width={'60px'} />
													</div>
												</div> */}
												<div className='d-flex flex-column'>
													<span className='IDO-Card-title' style={{ fontSize: '20px' }}>{tokenInfo.name}</span>
												</div>
											</div>

											<div className='mt-3'>
												{/* <div style={{ fontSize: '16px' }}>{"BTX is the ultimate utility token on the Elrond Network allowing for staking swapping farming and locking."}</div> */}
												<div style={{ fontSize: '16px' }}>{description}</div>
												<div className='mt-2' style={{ fontSize: '16px', color: '#E3E3E3' }}>{"Your investment is protected, this sale is under the Safeguarded Launch Protocol rules."}</div>
											</div>

											<div className='social-box mt-4'>
												{
													socialLinks[0].link !== "" && (
														<a className='social-link' href={socialLinks[0].link} rel="noreferrer" target="_blank">
															{swtichSocialIcon('website')}
														</a>
													)
												}
												{
													socialLinks[1].link !== "" && (
														<a className='social-link' href={socialLinks[1].link} rel="noreferrer" target="_blank">
															{swtichSocialIcon('telegram')}
														</a>
													)
												}
												{
													socialLinks[2].link !== "" && (
														<a className='social-link' href={socialLinks[2].link} rel="noreferrer" target="_blank">
															{swtichSocialIcon('discord')}
														</a>
													)
												}
												{
													socialLinks[3].link !== "" && (
														<a className='social-link' href={socialLinks[3].link} rel="noreferrer" target="_blank">
															{swtichSocialIcon('twitter')}
														</a>
													)
												}
												{
													socialLinks[4].link !== "" && (
														<a className='social-link' href={socialLinks[4].link} rel="noreferrer" target="_blank">
															{swtichSocialIcon('youtube')}
														</a>
													)
												}
												{
													socialLinks[5].link !== "" && (
														<a className='social-link' href={socialLinks[5].link} rel="noreferrer" target="_blank">
															{swtichSocialIcon('linkedIn')}
														</a>
													)
												}
												{
													socialLinks[6].link !== "" && (
														<a className='social-link' href={socialLinks[6].link} rel="noreferrer" target="_blank">
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
														<span style={{ color: '#6a9b84' }}>{tokenInfo.name}</span>
													</div>
													<div>
														<span>Token Identifier: </span>
														<span style={{ color: '#6a9b84' }}>{tokenInfo.identifier}</span>
													</div>
													<div>
														<span>Token Decimal: </span>
														<span style={{ color: '#6a9b84' }}>{tokenInfo.decimals}</span>
													</div>
													<div>
														<span>Total Supply: </span>
														<span style={{ color: '#6a9b84' }}>{tokenInfo.supply?.toLocaleString()} {tokenInfo.name}</span>
													</div>
													<div>
														<span>Tokens For Presale: </span>
														<span style={{ color: '#6a9b84' }}>{presale_rate * hard_cap} {tokenInfo.name}</span>
													</div>
													<div>
														<span>Tokens For Liquidity: </span>
														<span style={{ color: '#6a9b84' }}>{presale_rate * hard_cap * maiar_exchange_liquidity / 100} {tokenInfo?.name}</span>
													</div>
												</div>

												<div className='d-flex flex-column mt-5' style={{ rowGap: '6px' }}>
													<p style={{ fontSize: '20px', color: "#6a9b84", fontWeight: '700' }}>PRICE</p>
													<div>
														<span>IDO: </span>
														<span style={{ color: '#6a9b84' }}>${(egldPrice / presale_rate).toFixed(5)}</span>
													</div>
												</div>

												<div className='d-flex flex-column mt-5' style={{ rowGap: '6px' }}>
													<p style={{ fontSize: '20px', color: "#6a9b84", fontWeight: '700' }}>POOL DETAILS</p>
													<div>
														<span>Soft Cap: </span>
														<span style={{ color: '#6a9b84' }}>{soft_cap} {currencyType}</span>
													</div>
													<div>
														<span>Hard Cap: </span>
														<span style={{ color: '#6a9b84' }}>{hard_cap} {currencyType}</span>
													</div>
													<div>
														<span>Liquidity Percent: </span>
														<span style={{ color: '#6a9b84' }}>{maiar_exchange_liquidity}%</span>
													</div>
													<div>
														<span>Lockup Time: </span>
														<span style={{ color: '#6a9b84' }}>{liquidity_lockup_days} days</span>
													</div>
													<div>
														<span>Starts / end: </span>
														{/* <span style={{ color: '#6a9b84' }}>07/04/2022, 11:00 UTC - 07/04/2022, 11:00 UTC</span> */}
														<span style={{ color: '#6a9b84' }}>{start_time.toString()} - {end_time.toString()}</span>
													</div>
													<div>
														<span>Listing On: </span>
														<span style={{ color: '#6a9b84' }}>Maiar Listing</span>
													</div>
													<div>
														<span>Registration: </span>
														{/* <span style={{ color: '#6a9b84' }}>07/02/2022, 11:00 UTC - 07/03/2022, 11:00 UTC</span> */}
														<span style={{ color: '#6a9b84' }}>{Date.now()}</span>
													</div>
												</div>

												{/* <div className='d-flex flex-column mt-5' style={{ rowGap: '6px' }}>
													<p style={{ fontSize: '20px', color: "#6a9b84", fontWeight: '700' }}>DISTRIBUTION</p>
													<div>
														<span>Distribution: </span>
														<span style={{ color: '#6a9b84' }}>Claimed on BitX IDO Launchpad</span>
													</div>
													<div>
														<span>Vesting: </span>
														<span style={{ color: '#6a9b84' }}>Loerem Ipsum dollar</span>
													</div>
												</div> */}
											</div>
										</>
									)
								}

								<div className='d-flex justify-content-center mb-5 mt-4'>
									<button className='ido-create-back-but' onClick={() => handleChangeStep(activeStep - 1)}>Back</button>
									<button className='ido-create-next-but ml-3' onClick={() => handleChangeStep(activeStep + 1)}>{activeStep == 3 ? "Submit" : "Next"}</button>
								</div>
							</div>
						</Box>
					</div >
				)
			}
		</>
	);
};

export default createIDO;