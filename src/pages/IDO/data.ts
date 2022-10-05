import BTX_logo from 'assets/img/token logos/BTX.png';
import CPA_logo from 'assets/img/token logos/CPA.png';
import DICE_logo from 'assets/img/token logos/DICE.png';
import EGLD_logo from 'assets/img/token logos/EGLD.png';
import LPAD_logo from 'assets/img/token logos/LPAD.png';
import MARE_logo from 'assets/img/token logos/MARE.png';
import MEX_logo from 'assets/img/token logos/MEX.png';
import STEPX_logo from 'assets/img/token logos/STEPX.png';

export const advertising_data = [
    {
        name: "BTX",
        logo: BTX_logo
    },
    {
        name: "CPA",
        logo: CPA_logo
    },
    {
        name: "DICE",
        logo: DICE_logo
    },
    {
        name: "EGLD",
        logo: EGLD_logo
    },
    {
        name: "LPAD",
        logo: LPAD_logo
    },
    {
        name: "MARE",
        logo: MARE_logo
    },
    {
        name: "MEX",
        logo: MEX_logo
    },
    {
        name: "STEPX",
        logo: STEPX_logo
    }
];

export enum ICOState {
    Upcoming = 0,
    Living = 1,
    Ended = 2
}

export const ido_pools_list = [
    {
        pool_name: "bitxtoken",
        name: "BitX Token",
        description: "BTX is the ultimate utility token on the Elrond Network allowing for staking swapping farming and locking.",

        ico_status: ICOState.Upcoming,

        social_links: [
            {
                name: "website",
                link: "https://app.bitxfinance.online"
            },
            {
                name: "telegram",
                link: ""
            },
            {
                name: "discord",
                link: ""
            },
            {
                name: "twitter",
                link: ""
            },
            {
                name: "youtube",
                link: ""
            },
            {
                name: "linkedIn",
                link: ""
            },
            {
                name: "medium",
                link: ""
            },
        ],

        token: "BTX",
        token_identifier: "BTX-0f676d",
        token_decimal: 18,
        total_supply: 35000000,
        tokens_for_presale: 35000,
        tokens_for_liquidity: 350000,

        currency: "EGLD",
        ico_price: 400,

        soft_cap: 100,
        hard_cap: 100,
        liquidity_percent: 65,
        lockup_time: 365,
        listing_on: "Maiar Listing",
        listing_price: 400,
        minimum_buy: 1,
        maximum_buy: null,

        ico_start: "08/04/2022 11:00 UTC",
        ico_end: "08/04/2022 11:00 UTC",
        registration_start: "07/04/2022 11:00 UTC",
        registration_end: "07/04/2022 11:00 UTC",

        first_release_for_presale_percent: 65,
        vesting_period_each_cycle: 300,
        presale_token_release_each_cycle: 50
    }
];