import { dAppName } from 'config';
import VaultVesting from 'pages/Vesting/vaultVesting';
import withPageTitle from './components/PageTitle';
import BTXFinanceHome from './pages';
import NFTStaking from './pages/NFTStaking';
import NFTMint from './pages/NFTMint';
import PreSale from './pages/Presale';
import StakingHome from './pages/Staking';
import BitXStaking from './pages/Staking/BitXStaking';
import CpaStaking from './pages/Staking/CpaStaking';
import DiceStaking from './pages/Staking/DiceStaking';
import HetoStaking from './pages/Staking/HetoStaking';
import LpadStaking from './pages/Staking/LpadStaking';
import MareStaking from './pages/Staking/MareStaking';
import BitLock from './pages/Vesting';
import CreateVesting from './pages/Vesting/createVesting';
import Farms from './pages/Farms';

import IDOLaunchpad from 'pages/IDO';
import IDODetail from 'pages/IDO/IDODetail';
import createIDO from 'pages/IDO/createIDO';

export const routeNames = {
  home: '/',

  unlock: '/unlock',
  ledger: '/ledger',
  walletconnect: '/walletconnect',

  staking: '/staking',
  bitxstaking: '/btx-pool',
  dicestaking: '/dice-pool',
  marestaking: '/mare-pool',
  // hetostaking: '/heto-pool',
  cpastaking: '/cpa-pool',
  lpadstaking: '/lpad-pool',

  presale: '/presale',
  nftmint: '/nft-mint',
  nftstaking: '/nft-staking',

  bitlock: '/bitlock',
  createvesting: '/bitlock/create-vesting',
  vaultvesting: '/bitlock/vault-vesting/*',
  farms: '/farms',

  idolaunchpad: '/ido-launchpad',
  idodetail: '/ido-detail/*',
  createido: '/create-IDO'
};

const routes: Array<any> = [
  {
    path: routeNames.staking,
    title: 'Staking',
    component: StakingHome
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

  // {
  //   path: routeNames.hetostaking,
  //   title: 'Heto Pool',
  //   component: HetoStaking
  // },

  {
    path: routeNames.cpastaking,
    title: 'Cpa Pool',
    component: CpaStaking
  },

  {
    path: routeNames.lpadstaking,
    title: 'Lpad Pool',
    component: LpadStaking
  },

  {
    path: routeNames.bitlock,
    title: 'Bit Lock',
    component: BitLock
  },

  {
    path: routeNames.createvesting,
    title: 'Create Vesting',
    component: CreateVesting,
    authenticatedRoute: true,
  },

  {
    path: routeNames.vaultvesting,
    title: 'Vault Explorer',
    component: VaultVesting
  },

  {
    path: routeNames.nftstaking,
    title: 'NFT Staking',
    component: NFTStaking
  },

  {
    path: routeNames.farms,
    title: 'Farms',
    component: Farms
  },

  {
    path: routeNames.presale,
    title: 'PreSale',
    component: PreSale
  },

  {
    path: routeNames.idolaunchpad,
    title: 'IDOLaunchpad',
    component: IDOLaunchpad
  },

  {
    path: routeNames.idodetail,
    title: 'IDODetail',
    component: IDODetail
  },

  {
    path: routeNames.createido,
    title: 'CreateIDO',
    component: createIDO
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
