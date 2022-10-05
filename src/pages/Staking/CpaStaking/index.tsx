import React from 'react';
import BTX2CPA from './Bitx2Cpa';
import CPA2CPA from './Cpa2Cpa';


const CpaStaking = () => {
    return (
        <div className='bitxwrapper'>
            <div className='container'>
                <CPA2CPA />
                <BTX2CPA />
            </div>
        </div>
    );
};

export default CpaStaking;
