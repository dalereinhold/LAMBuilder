/**
 * Event handlers and UI bindings
 */

/////////////////////
// UI Event Bindings
/////////////////////
function initializeEventHandlers() {
  // Panel data button
  const addPanelBtn = document.getElementById("addPanelDataBtn");
  if (addPanelBtn && !addPanelBtn.dataset.bound) {
    addPanelBtn.onclick = addPanelData;
    addPanelBtn.dataset.bound = true;
  }

  // Clear menu button
  const clearMenuBtn = document.getElementById("clearMenuBtn");
  if (clearMenuBtn && !clearMenuBtn.dataset.bound) {
    clearMenuBtn.onclick = clearMenu;
    clearMenuBtn.dataset.bound = true;
  }

  // Object creation buttons
  const addHeaderBtn = document.getElementById("addHeaderBtn");
  if (addHeaderBtn && !addHeaderBtn.dataset.bound) {
    addHeaderBtn.onclick = addHeader;
    addHeaderBtn.dataset.bound = true;
  }

  const addDescriptionBtn = document.getElementById("addDescriptionBtn");
  if (addDescriptionBtn && !addDescriptionBtn.dataset.bound) {
    addDescriptionBtn.onclick = addDescription;
    addDescriptionBtn.dataset.bound = true;
  }

  const addCheckboxBtn = document.getElementById("addCheckboxBtn");
  if (addCheckboxBtn && !addCheckboxBtn.dataset.bound) {
    addCheckboxBtn.onclick = addCheckbox;
    addCheckboxBtn.dataset.bound = true;
  }

  const addSliderBtn = document.getElementById("addSliderBtn");
  if (addSliderBtn && !addSliderBtn.dataset.bound) {
    addSliderBtn.onclick = addSlider;
    addSliderBtn.dataset.bound = true;
  }

  const addDropdownBtn = document.getElementById("addDropdownBtn");
  if (addDropdownBtn && !addDropdownBtn.dataset.bound) {
    addDropdownBtn.onclick = addDropdown;
    addDropdownBtn.dataset.bound = true;
  }

  const addButtonBtn = document.getElementById("addButtonBtn");
  if (addButtonBtn && !addButtonBtn.dataset.bound) {
    addButtonBtn.onclick = addButton;
    addButtonBtn.dataset.bound = true;
  }

  const addSubmenuBtn = document.getElementById("addSubmenuBtn");
  if (addSubmenuBtn && !addSubmenuBtn.dataset.bound) {
    addSubmenuBtn.onclick = addSubmenu;
    addSubmenuBtn.dataset.bound = true;
  }

  const addColorpickerBtn = document.getElementById("addColorpickerBtn");
  if (addColorpickerBtn && !addColorpickerBtn.dataset.bound) {
    addColorpickerBtn.onclick = addColorpicker;
    addColorpickerBtn.dataset.bound = true;
  }

  // Sample menu button
  const sampleBtn = document.getElementById("sampleMenuBtn");
  if (sampleBtn && !sampleBtn.dataset.bound) {
    sampleBtn.onclick = () => {
      if (confirm("Load sample menu? This will replace current panel and options.")) {
        loadSampleMenu();
      }
    };
    sampleBtn.dataset.bound = true;
  }

  // Copy button
  const copyBtn = document.getElementById("copyBtn");
  if (copyBtn && !copyBtn.dataset.bound) {
    copyBtn.onclick = () => {
      const luaCode = exportToLua(objects, panelData);
      navigator.clipboard.writeText(luaCode).then(() => {
        alert("Lua code copied to clipboard!");
      }).catch(() => {
        alert("Failed to copy to clipboard. Please try again.");
      });
    };
    copyBtn.dataset.bound = true;
  }

  // Download button
  const downloadBtn = document.getElementById("downloadBtn");
  if (downloadBtn && !downloadBtn.dataset.bound) {
    downloadBtn.onclick = () => {
      const luaCode = exportToLua(objects, panelData);
      const filename = (panelData && panelData.name ? panelData.name : 'addon') + '.lua';
      const blob = new Blob([luaCode], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };
    downloadBtn.dataset.bound = true;
  }
}