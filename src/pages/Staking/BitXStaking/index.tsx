import React from 'react';
import './index.scss';

import Btx2BtxStakingCard from './Bitx2Bitx';
import Bitx2Mex from './Bitx2Mex';

const Staking = () => {
    return (
        <div className='bitxwrapper'>
            <div className='container'>
                <Btx2BtxStakingCard />
                <Bitx2Mex />
            </div>
        </div>
    );
};

export default Staking;
