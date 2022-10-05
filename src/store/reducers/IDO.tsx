import { getType } from 'typesafe-actions';
import * as actions from '../actions';

import {
    entityLoadingFailed,
    entityLoadingStarted,
    entityLoadingSucceeded,
    initEntityState,
    getErrorMessage
} from '../utils';

export interface IIDOState {
    poolLists: any;
    currentPoolDetail: any,
}

const initialState: IIDOState = {
    poolLists: initEntityState([]),
    currentPoolDetail: initEntityState({})
};

const states = (state = initialState, action: { type: string, payload: any }) => {
    switch (action.type) {
        case getType(actions.fetchIDOPools.request):
            return {
                ...state,
                poolLists: entityLoadingStarted(state.poolLists, action.payload)
            };

        case getType(actions.fetchIDOPools.success):
            return {
                ...state,
                poolLists: entityLoadingSucceeded(state.poolLists, action.payload)
            };

        case getType(actions.fetchIDOPools.failure):
            return {
                ...state,
                poolLists: entityLoadingFailed(state.poolLists, getErrorMessage(action.payload))
            };

        case getType(actions.fetchIDODetail.request):
            return {
                ...state,
                currentPoolDetail: entityLoadingStarted(state.currentPoolDetail, action.payload)
            };

        case getType(actions.fetchIDODetail.success):
            return {
                ...state,
                currentPoolDetail: entityLoadingSucceeded(state.currentPoolDetail, action.payload)
            };

        case getType(actions.fetchIDODetail.failure):
            return {
                ...state,
                currentPoolDetail: entityLoadingFailed(state.currentPoolDetail, getErrorMessage(action.payload))
            };

        default:
            return state;
    }
};
export default states;
