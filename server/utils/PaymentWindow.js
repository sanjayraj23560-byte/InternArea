export const isWithinPaymentWindow = () => {
    // return true;
    const now = new Date();

    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const ist = new Date(now.getTime() + istOffsetMs);

    const hours = ist.getUTCHours();
    const minutes = ist.getUTCMinutes();
    const totalMinutes = hours * 60 + minutes;

    const windowStart = 10 * 60;   
    const windowEnd = 11 * 60;     

    return totalMinutes >= windowStart && totalMinutes < windowEnd;
};