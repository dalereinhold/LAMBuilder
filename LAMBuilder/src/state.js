/**
 * Core application state management and local storage
 */

/////////////////////
// Core app state
/////////////////////
let objects = [];
let panelData = null;
let editPanelData = false;

/////////////////////
// Local Storage Functions
/////////////////////
function saveState() {
  try {
    const state = {
      objects: objects,
      panelData: panelData,
      editPanelData: editPanelData,
      timestamp: Date.now()
    };
    localStorage.setItem('lambuilder-state', JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save state to localStorage:', error);
  }
}

function loadState() {
  try {
    const saved = localStorage.getItem('lambuilder-state');
    if (saved) {
      const state = JSON.parse(saved);
      objects = state.objects || [];
      panelData = state.panelData || null;
      editPanelData = state.editPanelData || false;
      return true;
    }
  } catch (error) {
    console.warn('Failed to load state from localStorage:', error);
  }
  return false;
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj, (k, v) => {
    // preserve function objects with __luaFn
    if (v && typeof v === "object" && v.__luaFn) return { __luaFn: true, code: v.code };
    return v;
  }));
}