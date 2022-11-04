/** https://crontab.guru/ */

export const getCronExpression = (interval) => {
    let cronExpression = '* * * * *';

    switch (interval){
        case '5m':
            cronExpression = '*/5 * * * *';
            break;
        case '15m':
            cronExpression = '*/15 * * * *';
            break;
        case '30m':
            cronExpression = '*/30 * * * *';
            break;
        case '1h':
            cronExpression = '0 */1 * * *';
            break;
        case '3h':
            cronExpression = '0 */3 * * *';
            break;
        case '6h':
            cronExpression = '0 */6 * * *';
            break;
        case '12h':
            cronExpression = '0 */12 * * *';
            break;
        case '24h':
            cronExpression = '0 */24 * * *';
            break;
        default:
            cronExpression = '* * * * *';
    }

    return cronExpression;
}
