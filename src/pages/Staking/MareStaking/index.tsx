import React from 'react';
import BTX2Mare from './Bitx2Mare';
import Mare2Mare from './Mare2Mare';


const MareStaking = () => {
    return (
        <div className='bitxwrapper'>
            <div className='container'>
                <Mare2Mare />
                <BTX2Mare />
            </div>
        </div>
    );
};

export default MareStaking;
