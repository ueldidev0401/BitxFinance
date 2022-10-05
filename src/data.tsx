import StepxLogo from 'assets/img/token logos/STEPX.png';
import LpadLogo from 'assets/img/token logos/LPAD.png';

// mainnet
export const TOKENS = {
    "USDC-c76f1f": {
        identifier: "USDC-c76f1f",
        ticker: "USDC",
        decimals: 6,
        logo: "https://media.elrond.com/tokens/asset/USDC-c76f1f/logo.svg"
    },
    "BTX-0f676d": {
        identifier: "BTX-0f676d",
        ticker: "BTX",
        decimals: 18,
        logo: "https://media.elrond.com/tokens/asset/BTX-0f676d/logo.png",
        unit_price_in_usd: 0.11,
    },

    // old btx
    "BTX-48d004": {
        identifier: "BTX-48d004",
        ticker: "BTX",
        decimals: 18,
        logo: "https://media.elrond.com/tokens/asset/BTX-48d004/logo.png",
        unit_price_in_usd: 0.0,
    },

    "LUCKY-2cb58b": {
        identifier: "LUCKY-2cb58b",
        ticker: "LUCKY",
        decimals: 18,
        logo: "https://media.elrond.com/tokens/asset/LUCKY-2cb58b/logo.svg",
        unit_price_in_usd: 0,
    },
    "MEX-455c57": {
        identifier: "MEX-455c57",
        ticker: "MEX",
        decimals: 18,
        logo: "https://media.elrond.com/tokens/asset/MEX-455c57/logo.svg",
        unit_price_in_usd: 0.000173,
    },
    "WEGLD-bd4d79": {
        identifier: "WEGLD-bd4d79",
        ticker: "WEGLD",
        decimals: 18,
        logo: "https://media.elrond.com/tokens/asset/WEGLD-bd4d79/logo.svg",
        unit_price_in_usd: 120,
    },
    "SUPER-507aa6": {
        identifier: "SUPER-507aa6",
        ticker: "SUPER",
        decimals: 18,
        logo: "https://media.elrond.com/tokens/asset/SUPER-507aa6/logo.svg",
        unit_price_in_usd: 0.034,
    },
    "VITAL-bc0917": {
        identifier: "VITAL-bc0917",
        ticker: "VITAL",
        decimals: 8,
        logo: "https://media.elrond.com/tokens/asset/VITAL-bc0917/logo.svg",
        unit_price_in_usd: 0.00000010,
    },
    "EFFORT-a13513": {
        identifier: "EFFORT-a13513",
        ticker: "EFFORT",
        decimals: 18,
        logo: "https://media.elrond.com/tokens/asset/EFFORT-a13513/logo.svg",
        unit_price_in_usd: 0,
    },
    "DICE-9749cc": {
        identifier: "DICE-9749cc",
        ticker: "DICE",
        decimals: 6,
        logo: "https://media.elrond.com/tokens/asset/DICE-9749cc/logo.svg",
        unit_price_in_usd: 0,
    },
    "ODIN-4d429b": {
        identifier: "ODIN-4d429b",
        ticker: "ODIN",
        decimals: 6,
        logo: "https://media.elrond.com/tokens/asset/ODIN-4d429b/logo.svg",
        unit_price_in_usd: 0.0018,
    },
    
    "MARE-63e515": {
        identifier: "MARE-63e515",
        ticker: "MARE",
        decimals: 6,
        logo: "https://media.elrond.com/tokens/asset/MARE-63e515/logo.svg",
        unit_price_in_usd: 0.000063, // ?
    },

    "STEPX-23bbca": {
        identifier: "STEPX-23bbca",
        ticker: "STEPX",
        decimals: 18,
        logo: StepxLogo,
        unit_price_in_usd: 0, // ?
    },
    "LPAD-84628f": {
        identifier: "LPAD-84628f",
        ticker: "LPAD",
        decimals: 18,
        logo: LpadLogo,
        unit_price_in_usd: 0, // ?
    },
};

export const vestingListHeader = [
    // "Name",
    "Token Identifier",
    "Token Amount",
    "Token Value",
    "Total Value",
    "Next Release",
    "View",
];

// // devnet
// export const TOKENS = {
//     "MEX-450e50": {
//         identifier: "MEX-450e50",
//         ticker: "MEX",
//         decimals: 18,
//         logo: "https://media.elrond.com/tokens/asset/MEX-455c57/logo.svg",
//         unit_price_in_usd: 0.00019,
//     },
//     "BTX-9dc317": {
//         identifier: "BTX-9dc317",
//         ticker: "BTX",
//         decimals: 18,
//         logo: "https://media.elrond.com/tokens/asset/BTX-48d004/logo.png",
//         unit_price_in_usd: 0.015,
//     },
// };

// testnet
// export const TOKENS = {
//     "ASH-76f082": {
//         identifier: "ASH-76f082",
//         ticker: "ASH",
//         decimals: 18,
//         logo: "https://testnet-media.elrond.com/tokens/asset/ASH-76f082/logo.png",
//         unit_price_in_usd: 0.0013,
//     },
//     "RISA-282a52": {
//         identifier: "RISA-282a52",
//         ticker: "RISA",
//         decimals: 18,
//         logo: "https://media.elrond.com/tokens/asset/RISA-c115c7/logo.png",
//         unit_price_in_usd: 0.042,
//     },
//     "USDC-780dd8": {
//         identifier: "USDC-780dd8",
//         ticker: "USDC",
//         decimals: 6,
//         logo: "https://media.elrond.com/tokens/asset/USDC-c76f1f/logo.png",
//         unit_price_in_usd: 1,
//     },
//     "XSUPER-0ad9d6": {
//         identifier: "XSUPER-0ad9d6",
//         ticker: "XSUPER",
//         decimals: 18,
//         logo: "https://media.elrond.com/tokens/asset/SUPER-507aa6/logo.png",
//         unit_price_in_usd: 0.001,
//     },
// };