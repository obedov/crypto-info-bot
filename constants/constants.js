const timeSubscribeCallBack = 'time_subscribe';

export const getCoinTimeSubscribeOptions = (coin) => {
    const options = {};
    const timeKeys = Object.keys(timeOptionsMap);
    const timeValues = Object.values(timeOptionsMap);

    timeKeys.forEach((timeKey, index) => {
        options[timeValues[index]] = `${coin}_${timeKey}_${timeSubscribeCallBack}`;
    });

    return options;
};

export const timeOptionsMap = {
    '1m': '1 мин',
    '5m': '5 мин',
    '15m': '15 мин',
    '30m': '30 мин',
    '1h': '1 час',
    '3h': '3 часа',
    '6h': '6 часов',
    '12h': '12 часов',
    '24h': '24 часа',
};