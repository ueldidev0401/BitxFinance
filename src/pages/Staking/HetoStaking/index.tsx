import React from 'react';
import BTX2HETO from './Bitx2Heto';
import Heto2Heto from './Heto2Heto';


const HetoStaking = () => {
    return (
        <div className='bitxwrapper'>
            <div className='container'>
                <Heto2Heto />
                <BTX2HETO />
            </div>
        </div>
    );
};

export default HetoStaking;
