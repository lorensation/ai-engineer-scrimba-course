// Report display utilities - vanilla JavaScript
export const displayReport = (container, report, stockNames = '') => {
  if (!container) return;
  
  if (!report) {
    container.innerHTML = '<div class="no-report">No report available.</div>';
    return;
  }
  
  container.innerHTML = `
    <h3>AI Financial Report</h3>
    ${stockNames ? `<h4>Analysis for: ${stockNames}</h4>` : ''}
    <div class="report-content">${report}</div>
  `;
};

export const displayError = (container, error) => {
  if (!container) return;
  
  const errorMessage = typeof error === 'string' ? error : error.message || 'An error occurred';
  container.innerHTML = `<div class="error">Error: ${errorMessage}</div>`;
};

export const clearDisplay = (container) => {
  if (!container) return;
  container.innerHTML = '';
};