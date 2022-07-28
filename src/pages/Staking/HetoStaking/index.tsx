import React from 'react';
import BTX2HETO from './Bitx2Heto';
import Heto2Heto from './Heto2Heto';


const MareStaking = () => {
    return (
        <div className='bitxwrapper'>
            <div className='container'>
                <Heto2Heto />
                <BTX2HETO />
            </div>
        </div>
    );
};

export default MareStaking;
