import React from 'react';
import BTX2LPAD from './Bitx2Lpad';
import LPAD2LPAD from './Lpad2Lpad';


const LpadStaking = () => {
    return (
        <div className='bitxwrapper'>
            <div className='container'>
                <LPAD2LPAD />
                <BTX2LPAD />
            </div>
        </div>
    );
};

export default LpadStaking;
