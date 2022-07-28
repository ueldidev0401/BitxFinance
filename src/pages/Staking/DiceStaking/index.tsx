import React from 'react';
import Bitx2Dice from './Bitx2Dice';
import Dice2Dice from './Dice2Dice';


const DiceStaking = () => {
    return (
        <div className='bitxwrapper'>
            <div className='container'>
                <Dice2Dice />
                <Bitx2Dice />
            </div>
        </div>
    );
};

export default DiceStaking;
