import BTX from 'assets/img/token logos/BTX.png';
import DICE from 'assets/img/token logos/DICE.png';
import HETO from 'assets/img/token logos/HETO.png';
import MARE from 'assets/img/token logos/MARE.png';
import MEX from 'assets/img/token logos/MEX.png';

import * as config from '../../config';

export const logo = {
    "BTX": BTX,
    "DICE": DICE,
    "MEX": MEX,
    "MARE": MARE,
    "HETO": HETO,
};

export const contractABI = {
    "BTX2BTX": config.BTX2BTX_CONTRACT_ABI,
    "BTX2MEX": config.BTX2MEX_CONTRACT_ABI,
    "DICE2DICE": config.DICE2DICE_CONTRACT_ABI,
    "BTX2DICE": config.BTX2DICE_CONTRACT_ABI,
    "MARE2MARE": config.MARE2MARE_CONTRACT_ABI,
    "BTX2MARE": config.BTX2MARE_CONTRACT_ABI,
    "HETO2HETO": config.HETO2HETO_CONTRACT_ABI,
    "BTX2HETO": config.BTX2HETO_CONTRACT_ABI,
};

export const contractAddress = {
    "BTX2BTX": config.BTX2BTX_CONTRACT_ADDRESS,
    "BTX2MEX": config.BTX2MEX_CONTRACT_ADDRESS,
    "DICE2DICE": config.DICE2DICE_CONTRACT_ADDRESS,
    "BTX2DICE": config.BTX2DICE_CONTRACT_ADDRESS,
    "MARE2MARE": config.MARE2MARE_CONTRACT_ADDRESS,
    "BTX2MARE": config.BTX2MARE_CONTRACT_ADDRESS,
    "HETO2HETO": config.HETO2HETO_CONTRACT_ADDRESS,
    "BTX2HETO": config.BTX2HETO_CONTRACT_ADDRESS,
};

export const contractName = {
    "BTX2BTX": config.BTX2BTX_CONTRACT_NAME,
    "BTX2MEX": config.BTX2MEX_CONTRACT_NAME,
    "DICE2DICE": config.DICE2DICE_CONTRACT_NAME,
    "BTX2DICE": config.BTX2DICE_CONTRACT_NAME,
    "MARE2MARE": config.MARE2MARE_CONTRACT_NAME,
    "BTX2MARE": config.BTX2MARE_CONTRACT_NAME,
    "HETO2HETO": config.HETO2HETO_CONTRACT_NAME,
    "BTX2HETO": config.BTX2HETO_CONTRACT_NAME,
};

export const tokenDecimal = {
    "BTX": 18,
    "DICE": 6,
    "MEX": 18,
    "MARE": 6,
    "HETO": 0,
};