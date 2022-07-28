import {
    SmartContract,
    DefaultSmartContractController, 
} from '@elrondnetwork/erdjs';

export interface IContractInteractor {
    contract: SmartContract;
    controller: DefaultSmartContractController;
}

export interface IBtx2BtxStakeSetting {
    stake_token?: string;
    reward_token?: string;
    min_stake_limit?: number;
    lock_period?: number;
    undelegation_period?: number;
    claim_lock_period?: number;
    apr?: number;
    total_staked_amount?: number;
    number_of_stakers?: number;
}

export interface IBtx2MexStakeSetting {
    stake_token?: string;
    reward_token?: string;
    min_stake_limit?: number;
    max_stake_limit?: number;
    lock_period?: number;
    undelegation_period?: number;
    claim_lock_period?: number;
    apr?: number;
    total_staked_amount?: number;
    number_of_stakers?: number;
}

export interface IStakeAccount {
    address: string,
    staked_amount: number,
    lock_end_timestamp: number,
    unstaked_amount: number,
    undelegation_end_timestamp: number,
    collectable_amount: number,
    reward_amount: number,
    last_claim_timestamp: number,
}

/** presale */
export enum Status {
    NotStarted,
    Started,
    Ended
}

export const convertToStatus = (s: string) => {
    if (s == 'NotStarted') {
        return Status.NotStarted;
    }
    if (s == 'Started') {
        return Status.Started;
    }
    return Status.Ended;
};

export interface ISaleStatusProvider {
    status: Status;
    leftTimestamp: number;
    goal: number;
    totalBoughtAmountOfEsdt: number;
}

export interface IAccountStateProvider {
    accountState: number;
}