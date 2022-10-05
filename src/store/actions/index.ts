import {
    createAction as action,
    createAsyncAction as asyncAction
} from 'typesafe-actions';

export const fetchIDOPools: any = asyncAction(
    'ido/FETCH_IDO_POOLS',
    'ido/FETCH_IDO_POOLS_SUCCESS',
    'ido/FETCH_IDO_POOLS_FAIL'
)();

export const fetchIDODetail: any = asyncAction(
    'ido/FETCH_IDO_DETAIL',
    'ido/FETCH_IDO_DETAIL_SUCCESS',
    'ido/FETCH_IDO_DETAIL_FAIL'
)();