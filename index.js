const axios = require('axios');
const TelegramApi = require('node-telegram-bot-api');

const MARKET_PRICE_URL = 'https://www.binance.com/api/v3/ticker/price?symbol=';
const roundTwoDigits = (num) => +num.toFixed(2);

const token = '5024904297:AAHuuF0oliZOc_XnGaKDOYiyey9RoZKUPQQ';
const bot = new TelegramApi(token, { polling: true });

const base = 'USDT';

const coins = {
    btc: 'BTC',
    eth: 'ETH',
    sol: 'SOL',
    bnb: 'BNB',
    doge: 'DOGE',
    luna: 'LUNA',
    mana: 'MANA',
    sand: 'SAND',
    axs: 'AXS',
};

const { btc, bnb, eth, sol, doge, luna, mana, sand, axs } = coins;

const coinPrice = '_coin_price';

const coinPriceOptions = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{ text: btc, callback_data: `${btc}${coinPrice}` }, { text: eth, callback_data: `${eth}${coinPrice}` }, { text: bnb, callback_data: `${bnb}${coinPrice}` }],
            [{ text: sol, callback_data: `${sol}${coinPrice}` }, { text: doge, callback_data: `${doge}${coinPrice}` }, { text: luna, callback_data: `${luna}${coinPrice}` }],
            [{ text: mana, callback_data: `${mana}${coinPrice}` }, { text: sand, callback_data: `${sand}${coinPrice}` }, { text: axs, callback_data: `${axs}${coinPrice}` }],
        ]
    })
};

const getCoinMarketPrice = async (coin) => {
    const getCoinMarketPrice = await axios.get(`${MARKET_PRICE_URL}${coin}`);
    return roundTwoDigits(+getCoinMarketPrice.data.price);
};

const start = () => {
    bot.setMyCommands([
        { command: '/start', description: 'Старт' },
        { command: '/help', description: 'Помощь' },
        { command: '/coin_price', description: 'Цена крипто-валюты' },
    ]);

    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;
        const chatName = msg.chat.first_name;

        if (text === '/start') {
            return bot.sendMessage(chatId, `Приветствую, ${chatName}!\nУзнай цену крипто-валюты с помощью /coin_price`);
        }

        if (text === '/help') {
            return bot.sendMessage(chatId, `Список команд: \n/coin_price - цена крипто-валюты`);
        }

        if (text === '/coin_price') {
            return bot.sendMessage(chatId, 'Узнать цену крипто-валюты', coinPriceOptions);
        }

        return bot.sendMessage(chatId, 'Неверная команда, воспользуйтесь /help');

    });

    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;

        if (data.includes(coinPrice)) {
            const coinName = data.slice(0, data.indexOf('_'));
            const coinMarketPrice = await getCoinMarketPrice(`${coinName}${base}`);
            return bot.sendMessage(chatId, `${coinName}: ${coinMarketPrice}$`);
        }

    });
}

start();