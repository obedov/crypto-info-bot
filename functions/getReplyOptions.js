/** requestObject: { textKey1: callBackValue1, textKey2: callBackValue, ... } */

export const getReplyOptions = (requestObject) => {
    const replyOptions = [];
    let replyRow = [];

    const textKeys = Object.keys(requestObject);
    const callBackValues = Object.values(requestObject);

    textKeys.forEach((text, index) => {
        if (index && index % 3 === 0) {
            replyOptions.push(replyRow);
            replyRow = [];
        }

        replyRow.push({ text, callback_data: `${callBackValues[index]}` });
    });

    replyOptions.push(replyRow);

    return replyOptions;
};