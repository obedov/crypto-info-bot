import TelegramApi from 'node-telegram-bot-api';
import cron from 'node-cron';
import {
    getCronExpression,
    getCoinOptions,
    getCoinMarketPrice,
    getReplyOptions,
    getReplyMarkup
} from './functions/index.js';
import { timeOptionsMap, getCoinTimeSubscribeOptions } from './constants/constants.js';

const token = '';
const bot = new TelegramApi(token, { polling: true });

const base = 'USDT';

let coins = ['BTC', 'ETH', 'SOL', 'DOGE', 'LUNA', 'NEAR'];

const coinPriceCallBack = '_coin_price';
const coinSubscribeCallBack = '_coin_subscribe';
const coinUnsubscribeCallBack = '_coin_unsubscribe';
const timeSubscribeCallBack = '_time_subscribe';
const timeUnsubscribeCallBack = '_time_unsubscribe';
const backToCoinSubscribeCallBack = '_back_to_coin_subscribe';
const backToCoinUnsubscribeCallBack = '_back_to_coin_unsubscribe';
const cancelSubscribeCallBack = '_cancel_subscribe';
const cancelUnsubscribeCallBack = '_cancel_unsubscribe';
const cancelPriceCallBack = '_cancel_price';

const backToCoinSubscribeOption = [{ text: 'Назад', callback_data: `${backToCoinSubscribeCallBack}` }];
const backToCoinUnsubscribeOption = [{ text: 'Назад', callback_data: `${backToCoinUnsubscribeCallBack}` }];
const cancelSubscribeOption = [{ text: 'Отмена', callback_data: `${cancelSubscribeCallBack}` }]
const cancelUnsubscribeOption = [{ text: 'Отмена', callback_data: `${cancelUnsubscribeCallBack}` }]
const cancelPriceOption = [{ text: 'Отмена', callback_data: `${cancelPriceCallBack}` }]

const taskSubscriptions = {};
const coinSubscriptions = [];
const coinTimeSubscriptions = [];
let subscribeMessageId = '';
let unSubscribeMessageId = '';
let priceMessageId = '';

const start = () => {
    bot.setMyCommands([
        { command: '/price', description: 'Цена крипты' },
        { command: '/subscribe', description: 'Подписаться' },
        { command: '/unsubscribe', description: 'Отписаться' },
    ]);

    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;
        const messageId = msg.message_id;

        if (text === '/price') {
            priceMessageId = messageId;
            const options = getCoinOptions(coins, coinPriceCallBack);
            options.push(cancelPriceOption);
            const replyMarkup = getReplyMarkup(options);

            return bot.sendMessage(chatId, 'Узнать цену крипты', replyMarkup);
        }

        if (text === '/subscribe') {
            subscribeMessageId = messageId;
            const options = getCoinOptions(coins, coinSubscribeCallBack);
            options.push(cancelSubscribeOption);
            const replyMarkup = getReplyMarkup(options);

            return bot.sendMessage(chatId, 'Выберите крипту для подписки', replyMarkup);
        }

        if (text === '/unsubscribe') {
            unSubscribeMessageId = messageId;
            if (coinSubscriptions.length > 0) {
                const coinUnsubscribeOptions = {};
                coinSubscriptions.forEach(coin => {
                    coinUnsubscribeOptions[coin] = `${coin}${coinUnsubscribeCallBack}`;
                })
                const options = getReplyOptions(coinUnsubscribeOptions);
                options.push(cancelUnsubscribeOption);
                const replyMarkup = getReplyMarkup(options);

                return bot.sendMessage(chatId, 'Выберите крипту для отписки', replyMarkup);
            } else {
                return bot.sendMessage(chatId, 'У вас нет подписок /subscribe');
            }
        }

        return bot.sendMessage(chatId, 'Неправильная команда');
    });

    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        const messageId = msg.message.message_id;

        if (data.includes(coinPriceCallBack)) {
            const coin = data.slice(0, data.indexOf('_'));
            const coinMarketPrice = await getCoinMarketPrice(`${coin}${base}`);

            return bot.sendMessage(chatId, `*${coin}*: ${coinMarketPrice}$`, { parse_mode: 'Markdown' });
        }

        if (data.includes(cancelPriceCallBack)) {
            if (messageId) {
                await bot.deleteMessage(chatId, messageId);
            }
            if (priceMessageId) {
                await bot.deleteMessage(chatId, priceMessageId);
                priceMessageId = '';
            }
        }

        if (data.includes(cancelSubscribeCallBack)) {
            if (messageId) {
                await bot.deleteMessage(chatId, messageId);
            }
            if (subscribeMessageId) {
                await bot.deleteMessage(chatId, subscribeMessageId);
                subscribeMessageId = '';
            }
        }

        if (data.includes(cancelUnsubscribeCallBack)) {
            if (messageId) {
                await bot.deleteMessage(chatId, messageId);
            }
            if (unSubscribeMessageId) {
                await bot.deleteMessage(chatId, unSubscribeMessageId);
                unSubscribeMessageId = '';
            }
        }

        if (data.includes(backToCoinSubscribeCallBack)) {
            const options = getCoinOptions(coins, coinSubscribeCallBack);
            options.push(cancelSubscribeOption);
            const replyMarkup = getReplyMarkup(options);
            if (messageId) await bot.deleteMessage(chatId, messageId);

            return bot.sendMessage(chatId, 'Выберите крипту для подписки', replyMarkup);
        }

        if (data.includes(backToCoinUnsubscribeCallBack)) {
            if (coinSubscriptions.length > 0) {
                const coinUnsubscribeOptions = {};
                coinSubscriptions.forEach(coin => {
                    coinUnsubscribeOptions[coin] = `${coin}${coinUnsubscribeCallBack}`;
                })
                const options = getReplyOptions(coinUnsubscribeOptions);
                options.push(cancelUnsubscribeOption);
                const replyMarkup = getReplyMarkup(options);
                if (messageId) await bot.deleteMessage(chatId, messageId);

                return bot.sendMessage(chatId, 'Выберите крипту для отписки', replyMarkup);
            } else {
                if (messageId) await bot.deleteMessage(chatId, messageId);

                return bot.sendMessage(chatId, 'У вас нет подписок /subscribe');
            }
        }

        if (data.includes(coinSubscribeCallBack)) {
            const coin = data.slice(0, data.indexOf('_'));
            const options = getReplyOptions(getCoinTimeSubscribeOptions(coin));
            options.push(backToCoinSubscribeOption);
            const replyMarkup = getReplyMarkup(options);
            if (messageId) await bot.deleteMessage(chatId, messageId);

            return bot.sendMessage(chatId, 'Выберите частоту уведомлений', replyMarkup);
        }

        if (data.includes(timeSubscribeCallBack)) {
            const coin = data.slice(0, data.indexOf('_'));
            const dataWithoutCoin = data.replace(`${coin}_`, '');
            const interval = dataWithoutCoin.slice(0, dataWithoutCoin.indexOf('_'));
            const cron_expression = getCronExpression(interval);

            const task = cron.schedule(cron_expression, async () => {
                const coinMarketPrice = await getCoinMarketPrice(`${coin}${base}`);
                return bot.sendMessage(chatId, `*${coin}*: ${coinMarketPrice}$`, { parse_mode: 'Markdown' });
            });

            const coinInterval = `${coin}_${interval}`;

            taskSubscriptions[coinInterval] = task;
            if (!coinSubscriptions.includes(coin)) coinSubscriptions.push(`${coin}`);
            if (!coinTimeSubscriptions.includes(coinInterval)) coinTimeSubscriptions.push(coinInterval);

            return bot.sendMessage(chatId, `Вы подписались на цену *${coin}* с интервалом в *${timeOptionsMap[interval]}*`, { parse_mode: 'Markdown' });
        }

        if (data.includes(coinUnsubscribeCallBack)) {
            const coin = data.slice(0, data.indexOf('_'));
            const timeUnsubscribeOptions = {};
            coinTimeSubscriptions.forEach(coinTime=> {
                if (coinTime.includes(coin)) {
                    const interval = coinTime.replace(`${coin}_`, '');
                    timeUnsubscribeOptions[`${timeOptionsMap[interval]}`] = `${coin}_${interval}${timeUnsubscribeCallBack}`;
                }
            })

            const options = getReplyOptions(timeUnsubscribeOptions);
            options.push(backToCoinUnsubscribeOption);
            const replyMarkup = getReplyMarkup(options);
            if (messageId) await bot.deleteMessage(chatId, messageId);

            return bot.sendMessage(chatId, 'Выберите частоту уведомлений для отмены', replyMarkup);
        }

        if (data.includes(timeUnsubscribeCallBack)) {
            const coin = data.slice(0, data.indexOf('_'));
            const dataWithoutCoin = data.replace(`${coin}_`, '');
            const interval = dataWithoutCoin.slice(0, dataWithoutCoin.indexOf('_'));
            const coinInterval = `${coin}_${interval}`;

            const activeTask = taskSubscriptions[coinInterval];
            activeTask.stop();

            const coinTimeIndex = coinTimeSubscriptions.indexOf(coinInterval);
            if (coinTimeIndex > -1) {
                coinTimeSubscriptions.splice(coinTimeIndex, 1);
            }

            const isCoinNotInList = coinTimeSubscriptions.every(item => !item.includes(coin));

            const coinIndex = coinSubscriptions.indexOf(coin);
            if (coinIndex > -1 && isCoinNotInList) {
                coinSubscriptions.splice(coinIndex, 1);
            }

            delete taskSubscriptions[coinInterval];

            return bot.sendMessage(chatId, `Вы отписались от цены на *${coin}* с интервалом в *${timeOptionsMap[interval]}*`, { parse_mode: 'Markdown' });
        }
    });
}

start();