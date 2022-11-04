export const getCoinOptions = (coinList, callBackName) => {
    let coinOptions = [];
    let coinRow = [];

    if (coinList.length <= 100) {
        coinList.forEach((coin, index) => {
            if (index % 3 === 0) {
                coinOptions.push(coinRow);
                coinRow = [];
            }

            coinRow.push({ text: coin, callback_data: `${coin}${callBackName}` });
        });

        coinOptions.push(coinRow);
    }

    return coinOptions;
};