import axios from 'axios';

export const getCoins = async () => {
    const response = await axios.get('https://www.binance.com/api/v3/exchangeInfo');

    const coinList = response?.data?.symbols?.map(it => {
        if (it?.symbol.includes('USDT') && it?.quoteAsset.includes('USDT') && it?.status !== 'BREAK') {
            return it?.symbol.replace('USDT', '');
        }
    })
        .filter(coin => coin && !coin.endsWith('UP') && !coin.endsWith('DOWN'))
        .sort();

    return coinList;
};
