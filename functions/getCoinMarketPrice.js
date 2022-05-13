import axios from 'axios';

const MARKET_PRICE_URL = 'https://www.binance.com/api/v3/ticker/price?symbol=';
const roundTwoDigits = (num) => +num.toFixed(4);

export const getCoinMarketPrice = async (coin) => {
    const getCoinMarketPrice = await axios.get(`${MARKET_PRICE_URL}${coin}`);
    return roundTwoDigits(+getCoinMarketPrice.data.price);
};