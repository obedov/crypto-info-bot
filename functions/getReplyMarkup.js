export const getReplyMarkup = (options) => {
    return {
        reply_markup: JSON.stringify({
            inline_keyboard: options
        })
    };
};