// Loading spinner utilities - vanilla JavaScript
export const showLoadingSpinner = (container) => {
  if (!container) return;
  
  container.style.display = 'block';
  container.innerHTML = `
    <div class="spinner-container">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>
  `;
};

export const hideLoadingSpinner = (container) => {
  if (!container) return;
  container.style.display = 'none';
  container.innerHTML = '';
};