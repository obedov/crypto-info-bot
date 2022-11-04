import {
    backToCoinSubscribeCallBack,
    backToCoinUnsubscribeCallBack,
    cancelPriceCallBack,
    cancelSubscribeCallBack,
    cancelUnsubscribeCallBack
} from './callbacks.js';

export const backToCoinSubscribeOption = [{ text: 'Back', callback_data: `${backToCoinSubscribeCallBack}` }];
export const backToCoinUnsubscribeOption = [{ text: 'Back', callback_data: `${backToCoinUnsubscribeCallBack}` }];
export const cancelSubscribeOption = [{ text: 'Cancel', callback_data: `${cancelSubscribeCallBack}` }];
export const cancelUnsubscribeOption = [{ text: 'Cancel', callback_data: `${cancelUnsubscribeCallBack}` }];
export const cancelPriceOption = [{ text: 'Cancel', callback_data: `${cancelPriceCallBack}` }];