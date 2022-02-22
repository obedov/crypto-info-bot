const axios = require('axios');
const TelegramApi = require('node-telegram-bot-api');
const cron = require('node-cron');

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

const coinPriceCallBack = '_coin_price';

const coinPriceOptions = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{ text: btc, callback_data: `${btc}${coinPriceCallBack}` }, { text: eth, callback_data: `${eth}${coinPriceCallBack}` }, { text: bnb, callback_data: `${bnb}${coinPriceCallBack}` }],
            [{ text: sol, callback_data: `${sol}${coinPriceCallBack}` }, { text: doge, callback_data: `${doge}${coinPriceCallBack}` }, { text: luna, callback_data: `${luna}${coinPriceCallBack}` }],
            [{ text: mana, callback_data: `${mana}${coinPriceCallBack}` }, { text: sand, callback_data: `${sand}${coinPriceCallBack}` }, { text: axs, callback_data: `${axs}${coinPriceCallBack}` }],
        ]
    })
};

const coinSubscribeCallBack = '_coin_subscribe';

const coinSubscribeOptions = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{ text: btc, callback_data: `${btc}${coinSubscribeCallBack}` }],
        ]
    })
};

const timeOptions = {
    one_min: '1 мин',
    five_min: '5 мин',
    fifteen_min: '15 мин',
    one_hour: '1 час',
    half_day: '12 часов',
    one_day: '24 часа',
};

const { one_min, five_min, fifteen_min, one_hour, half_day, one_day } = timeOptions;

const timeSubscribeCallBack = '_time_subscribe';

const timeSubscribeOptions = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{ text: '1 мин', callback_data: `${one_min}${timeSubscribeCallBack}` }, { text: '5 мин', callback_data: `${five_min}${timeSubscribeCallBack}` }, { text: '15 мин', callback_data: `${fifteen_min}${timeSubscribeCallBack}` }],
            [{ text: '1 час', callback_data: `${one_hour}${timeSubscribeCallBack}` }, { text: '12 часов', callback_data: `${half_day}${timeSubscribeCallBack}` }, { text: '24 часа', callback_data: `${one_day}${timeSubscribeCallBack}` }],
        ]
    })
};

const COIN_SUBSCRIBE = [];

const getCoinMarketPrice = async (coin) => {
    const getCoinMarketPrice = await axios.get(`${MARKET_PRICE_URL}${coin}`);
    return roundTwoDigits(+getCoinMarketPrice.data.price);
};

const start = () => {
    bot.setMyCommands([
        { command: '/start', description: 'Старт' },
        { command: '/coin_price', description: 'Цена крипто-валюты' },
        { command: '/coin_subscribe', description: 'Подписаться на цену крипто-валюты' },
        { command: '/coin_unsubscribe', description: 'Отписаться от цены на крипто-валюту' },
    ]);

    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;
        const chatName = msg.chat.first_name;

        if (text === '/start') {
            return bot.sendMessage(chatId, `Приветствую, ${chatName}!\nУзнай цену крипто-валюты и подпишись на уведомления!`);
        }

        if (text === '/coin_price') {
            return bot.sendMessage(chatId, 'Узнать цену крипто-валюты', coinPriceOptions);
        }

        if (text === '/coin_subscribe') {
            return bot.sendMessage(chatId, 'Выберите крипто-валюту', coinSubscribeOptions);
        }

        if (text === '/coin_unsubscribe') {
            cron.schedule('* * * * *', () => {}).stop();
            return bot.sendMessage(chatId, 'Вы успешно отписались от уведомлений!');
        }

        return bot.sendMessage(chatId, 'Неверная команда, воспользуйтесь /help');

    });

    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;

        if (data.includes(coinPriceCallBack)) {
            const coinName = data.slice(0, data.indexOf('_'));
            const coinMarketPrice = await getCoinMarketPrice(`${coinName}${base}`);
            return bot.sendMessage(chatId, `${coinName}: ${coinMarketPrice}$`);
        }

        if (data.includes(coinSubscribeCallBack)) {
            COIN_SUBSCRIBE[0] = data.slice(0, data.indexOf('_'));
            return bot.sendMessage(chatId, 'Выберите частоту информирования', timeSubscribeOptions);
        }

        if (data.includes(timeSubscribeCallBack)) {
            COIN_SUBSCRIBE[1] = data.slice(0, data.indexOf('_'));
            // TODO fix
            cron.schedule('1 * * * *', async () => {
                const coinName = COIN_SUBSCRIBE[0];
                const coinMarketPrice = await getCoinMarketPrice(`${coinName}${base}`);
                return bot.sendMessage(chatId, `${coinName}: ${coinMarketPrice}$`);
            });
            return bot.sendMessage(chatId, `Отлично! Вы подписались на цену ${COIN_SUBSCRIBE[0]} с интервалом ${COIN_SUBSCRIBE[1]}`);
        }

    });
}

start();