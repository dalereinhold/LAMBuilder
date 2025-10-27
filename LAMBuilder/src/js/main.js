/**
 * LAM Builder - Main Application Entry Point
 * LibAddonMenu 2 Builder for Elder Scrolls Online
 */

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  // Load saved state from localStorage
  loadState();
  
  // Initialize event handlers
  initializeEventHandlers();
  
  // Initial UI render
  renderUI();
});
