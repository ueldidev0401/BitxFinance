/* eslint-disable import/order */
import * as actions from '../index';
import { ido_pools_list } from '../../../pages/IDO/data';

export const fetchIDOPools = () => async (dispatch: any) => {
    dispatch(actions.fetchIDOPools.request());
    try {
        const data = ido_pools_list;
        dispatch(actions.fetchIDOPools.success(data));
    } catch (err) {
        dispatch(actions.fetchIDODetail.failure(err));
    }
};

export const fetchIDODetail = (payload: any) => async (dispatch: any) => {
    dispatch(actions.fetchIDODetail.request());
    try {
        const data = ido_pools_list.filter(items => items.pool_name == payload.data)[0];
        dispatch(actions.fetchIDODetail.success(data));
    } catch (err) {
        dispatch(actions.fetchIDODetail.failure(err));
    }
};