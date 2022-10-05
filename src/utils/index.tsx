import {
    Address,
	U64Value,
	List,
} from '@elrondnetwork/erdjs';

export const SECOND_IN_MILLI = 1000;
export const ONE_DAY_IN_SECONDS = 24 * 3600;
export const TIMEOUT = 10000;

export function getCurrentTimestamp() {
    return (new Date()).getTime();
}

export function isValidAddress(address: string) {
    if (!address) return false;
    
    try {
        const addr = new Address(address);
        return true;
    } catch(e) {
        return false;
    }
}

export function createListOfU64(items: number[]): List {
    const itemsTyped = items.map(item => new U64Value(item));
    return List.fromItems(itemsTyped);
}

export * from './convert';
export * from './api';
export * from './state';