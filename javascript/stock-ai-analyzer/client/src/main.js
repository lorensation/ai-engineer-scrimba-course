import { fetchResolvedTicker, generateMultiStockReport } from './utils/api.js';
import { validateTicker, debounce } from './utils/helpers.js';
import { displayReport, displayError, clearDisplay } from './components/ReportDisplay.js';

// DOM element selectors
const getElement = (id) => document.getElementById(id);

// Initialize DOM elements
let tickerInput, addStockButton, selectedStocksContainer, reportButton, resultDisplay, loadingSpinner;

// State management
const selectedStocks = new Set();
const MAX_STOCKS = 3;

const initializeElements = () => {
  tickerInput = getElement('ticker-input');
  addStockButton = getElement('add-stock');
  selectedStocksContainer = getElement('selected-stocks');
  reportButton = getElement('generate-report');
  resultDisplay = getElement('result-display');
  loadingSpinner = getElement('loading-spinner');
};

// Utility functions
const showLoading = () => {
  if (loadingSpinner) loadingSpinner.style.display = 'block';
};

const hideLoading = () => {
  if (loadingSpinner) loadingSpinner.style.display = 'none';
};

const displayResult = (content) => {
  if (resultDisplay) {
    resultDisplay.innerHTML = content;
  } else {
    console.log('Result:', content);
  }
};

const showError = (error) => {
  displayError(resultDisplay, error);
  console.error('Display error:', error);
};

// Stock management functions
const renderSelectedStocks = () => {
  if (!selectedStocksContainer) return;
  
  selectedStocksContainer.innerHTML = '';
  
  selectedStocks.forEach(stock => {
    const stockTag = document.createElement('div');
    stockTag.className = 'stock-tag';
    stockTag.innerHTML = `
      ${stock.name} (${stock.ticker})
      <button class="remove-stock" data-ticker="${stock.ticker}">×</button>
    `;
    selectedStocksContainer.appendChild(stockTag);
  });
  
  // Update report button state
  if (reportButton) {
    reportButton.disabled = selectedStocks.size === 0;
  }
};

const addStock = async () => {
  if (!tickerInput?.value) return;
  
  const ticker = tickerInput.value.trim().toUpperCase();
  if (!ticker) return;
  
  // Validate ticker format
  if (!validateTicker(ticker)) {
    showError(new Error(`Invalid ticker format: ${ticker}. Please enter 1-5 letters.`));
    return;
  }
  
  if (selectedStocks.size >= MAX_STOCKS) {
    showError(new Error(`Maximum of ${MAX_STOCKS} stocks allowed`));
    return;
  }
  
  // Check if stock already selected
  const existingStock = Array.from(selectedStocks).find(stock => stock.ticker === ticker);
  if (existingStock) {
    showError(new Error(`${ticker} is already selected`));
    return;
  }
  
  showLoading();
  
  try {
    const resolvedTicker = await fetchResolvedTicker(ticker);
    console.log('Resolved ticker:', resolvedTicker);
    
    if (resolvedTicker && resolvedTicker.ticker) {
      selectedStocks.add({
        ticker: resolvedTicker.ticker,
        name: resolvedTicker.name || resolvedTicker.ticker
      });
      
      tickerInput.value = '';
      renderSelectedStocks();
      clearDisplay(resultDisplay); // Clear any previous errors
    } else {
      showError(new Error(`Could not resolve ticker for: ${ticker}`));
    }
  } catch (error) {
    console.error('Add stock failed:', error);
    showError(error);
  } finally {
    hideLoading();
  }
};

const removeStock = (ticker) => {
  const stockToRemove = Array.from(selectedStocks).find(stock => stock.ticker === ticker);
  if (stockToRemove) {
    selectedStocks.delete(stockToRemove);
    renderSelectedStocks();
  }
};

const handleReportGeneration = async () => {
  if (selectedStocks.size === 0) {
    showError(new Error('Please select at least one stock'));
    return;
  }
  
  showLoading();
  if (reportButton) reportButton.disabled = true;
  
  try {
    const stockList = Array.from(selectedStocks);
    console.log('Generating report for stocks:', stockList);
    
    const report = await generateMultiStockReport(stockList);
    console.log('Generated report:', report);
    
    const stockNames = stockList.map(stock => `${stock.name} (${stock.ticker})`).join(', ');
    displayReport(resultDisplay, report, stockNames);
  } catch (error) {
    console.error('Report generation failed:', error);
    // Handle 429 Too Many Requests from server
    if (error?.message?.includes('429') || error?.status === 429) {
      showError(new Error('Rate limit hit. Please wait a few seconds and try again.'));
    } else {
      showError(error);
    }
  } finally {
    hideLoading();
    if (reportButton) reportButton.disabled = selectedStocks.size === 0;
  }
};

// Event listeners setup
const setupEventListeners = () => {
  // Create debounced version of addStock for better UX
  const debouncedAddStock = debounce(addStock, 300);
  
  if (addStockButton) {
    addStockButton.addEventListener('click', addStock);
  }
  
  if (reportButton) {
    reportButton.addEventListener('click', handleReportGeneration);
  }
  
  if (tickerInput) {
    // Allow adding stock by pressing Enter
    tickerInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addStock();
      }
    });
    
    // Clear errors when user starts typing
    tickerInput.addEventListener('input', () => {
      if (resultDisplay?.innerHTML.includes('error')) {
        clearDisplay(resultDisplay);
      }
    });
  }
  
  if (selectedStocksContainer) {
    // Handle remove stock clicks using event delegation
    selectedStocksContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-stock')) {
        const ticker = e.target.getAttribute('data-ticker');
        removeStock(ticker);
      }
    });
  }
};

// Main initialization function
const initialize = () => {
  initializeElements();
  setupEventListeners();
  renderSelectedStocks(); // Initialize empty state
  
  // Log what elements were found for debugging
  console.log('Initialized elements:', {
    tickerInput: !!tickerInput,
    addStockButton: !!addStockButton,
    selectedStocksContainer: !!selectedStocksContainer,
    reportButton: !!reportButton,
    resultDisplay: !!resultDisplay,
    loadingSpinner: !!loadingSpinner
  });
};

// DOM ready initialization following JS rules
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Export for testing
export { addStock, removeStock, handleReportGeneration, initialize };