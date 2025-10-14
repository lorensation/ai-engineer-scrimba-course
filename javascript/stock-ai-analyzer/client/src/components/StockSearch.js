// Stock selection utilities - vanilla JavaScript
export const createStockSelector = (container) => {
  if (!container) return null;
  
  container.innerHTML = `
    <div class="input-group">
      <input type="text" id="ticker-input" placeholder="Enter stock ticker or company name" />
      <button type="button" id="add-stock">Add Stock</button>
    </div>
    <div id="selected-stocks" class="selected-stocks">
      <!-- Selected stocks will appear here -->
    </div>
    <button type="button" id="generate-report" class="generate-btn" disabled>Generate Report</button>
  `;
  
  return {
    tickerInput: container.querySelector('#ticker-input'),
    addStockButton: container.querySelector('#add-stock'),
    selectedStocksContainer: container.querySelector('#selected-stocks'),
    reportButton: container.querySelector('#generate-report')
  };
};

export const renderStockTags = (container, stocks, onRemove) => {
  if (!container) return;
  
  container.innerHTML = '';
  
  stocks.forEach(stock => {
    const stockTag = document.createElement('div');
    stockTag.className = 'stock-tag';
    stockTag.innerHTML = `
      ${stock.name} (${stock.ticker})
      <button class="remove-stock" data-ticker="${stock.ticker}">×</button>
    `;
    
    const removeButton = stockTag.querySelector('.remove-stock');
    if (removeButton) {
      removeButton.addEventListener('click', () => onRemove(stock.ticker));
    }
    
    container.appendChild(stockTag);
  });
};