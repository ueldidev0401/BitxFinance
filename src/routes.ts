import { dAppName } from 'config';
import withPageTitle from './components/PageTitle';
import BTXFinanceHome from './pages';
import NFTMint from './pages/NFTMint';
import PreSale from './pages/Presale';
import StakingHome from './pages/Staking';
import BitXStaking from './pages/Staking/BitXStaking';
import DiceStaking from './pages/Staking/DiceStaking';
import HetoStaking from './pages/Staking/HetoStaking';
import MareStaking from './pages/Staking/MareStaking';

import BitLock from './pages/Vesting';
import CreateVesting from './pages/Vesting/createVesting';
import VaultVesting from 'pages/Vesting/vaultVesting';

export const routeNames = {
  home: '/',

  unlock: '/unlock',
  ledger: '/ledger',
  walletconnect: '/walletconnect',

  staking: '/staking',
  bitxstaking: '/btx-pool',
  dicestaking: '/dice-pool',
  marestaking: '/mare-pool',
  hetostaking: '/heto-pool',

  presale: '/presale',
  nftmint: '/nft-mint',

  bitlock: '/bitlock',
  createvesting: '/bitlock/create-vesting',
  vaultvesting: '/bitlock/vault-vesting'
};

const routes: Array<any> = [
  {
    path: routeNames.staking,
    title: 'Staking',
    component: StakingHome
  },

  {
    path: routeNames.presale,
    title: 'PreSale',
    component: PreSale
  },

  {
    path: routeNames.nftmint,
    title: 'NFT Mint',
    component: NFTMint
  },

  {
    path: routeNames.home,
    title: 'BTX Finance',
    component: BTXFinanceHome
  },

  {
    path: routeNames.bitxstaking,
    title: 'BTX Pool',
    component: BitXStaking
  },

  {
    path: routeNames.dicestaking,
    title: 'Dice Pool',
    component: DiceStaking
  },

  {
    path: routeNames.marestaking,
    title: 'Mare Pool',
    component: MareStaking
  },

  {
    path: routeNames.hetostaking,
    title: 'Heto Pool',
    component: HetoStaking
  },

  {
    path: routeNames.bitlock,
    title: 'Bit Lock',
    component: BitLock
  },

  {
    path: routeNames.createvesting,
    title: 'Create Vesting',
    component: CreateVesting
  },

  {
    path: routeNames.vaultvesting,
    title: 'Vault Explorer',
    component: VaultVesting
  },
];

const mappedRoutes = routes.map((route) => {
  const title = route.title
    ? `${route.title} • ${dAppName}`
    : `${dAppName}`;

  const requiresAuth = Boolean(route.authenticatedRoute);
  const wrappedComponent = withPageTitle(title, route.component);

  return {
    path: route.path,
    component: wrappedComponent,
    authenticatedRoute: requiresAuth
  };
});

export default mappedRoutes;
