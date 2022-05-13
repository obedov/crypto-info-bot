/** https://crontab.guru/ */

export const getCronExpression = (interval) => {
    let cronExpression = '* * * * *';
    
    if (interval === '5m') cronExpression = '*/5 * * * *';
    if (interval === '15m') cronExpression = '*/15 * * * *';

    if (interval === '30m') cronExpression = '*/30 * * * *';
    if (interval === '1h') cronExpression = '0 */1 * * *';
    if (interval === '3h') cronExpression = '0 */3 * * *';

    if (interval === '6h') cronExpression = '0 */6 * * *';
    if (interval === '12h') cronExpression = '0 */12 * * *';
    if (interval === '24h') cronExpression = '0 */24 * * *';

    return cronExpression;
}
