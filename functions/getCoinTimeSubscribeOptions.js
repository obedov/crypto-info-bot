import { timeOptionsMap } from '../constants/constants.js';
import { timeSubscribeCallBack } from '../constants/callbacks.js';

export const getCoinTimeSubscribeOptions = (coin) => {
    const options = {};
    const timeKeys = Object.keys(timeOptionsMap);
    const timeValues = Object.values(timeOptionsMap);

    timeKeys.forEach((timeKey, index) => {
        options[timeValues[index]] = `${coin}_${timeKey}_${timeSubscribeCallBack}`;
    });

    return options;
};