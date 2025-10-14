export const validateTicker = (ticker) => {
  const regex = /^[A-Z]{1,5}$/;
  if (!regex.test(ticker)) {
    throw new Error('Invalid ticker format. Ticker must be 1 to 5 uppercase letters.');
  }
  return ticker;
};

export const validateReportRequest = (data) => {
  if (!data || !data.tickers || !Array.isArray(data.tickers)) {
    throw new Error('Invalid request. Tickers must be provided as an array.');
  }
  data.tickers.forEach(ticker => validateTicker(ticker));
};