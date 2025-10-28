/**
 * Object creation, manipulation, and management functions
 */

/////////////////////
// Panel Data Functions
/////////////////////
function addPanelData() {
  // Create a new default panelData object with all required fields
  panelData = {
    type: "panel",
    name: "MyAddon",
    displayName: "My Addon Settings",
    author: "AuthorName",
    version: "1.0",
    slashCommand: "/myaddon",
    registerForRefresh: true,
    registerForDefaults: true,
  };

  editPanelData = true;
  saveState();
  renderUI();
}

function deletePanelData() {
  if (confirm("Are you sure you want to delete panel data? This cannot be undone.")) {
    panelData = null;
    editPanelData = false;
    saveState();
    renderUI();
  }
}

/////////////////////
// Object Creation Functions
/////////////////////
function addHeader() {
  const newObj = {
    type: "header",
    name: "New Header",
    width: "full"
  };
  objects.push(newObj);
  saveState();
  renderUI();
}

function addDescription() {
  const newObj = {
    type: "description",
    text: "Description text",
    width: "full"
  };
  objects.push(newObj);
  saveState();
  renderUI();
}

function addCheckbox() {
  const newObj = {
    type: "checkbox",
    name: "New Checkbox",
    tooltip: "Checkbox tooltip",
    getFunc: { __luaFn: true, code: "function() return true end" },
    setFunc: { __luaFn: true, code: "function(value) d(value) end" },
    width: "full",
    default: ""
  };
  objects.push(newObj);
  saveState();
  renderUI();
}

function addSlider() {
  const newObj = {
    type: "slider",
    name: "New Slider",
    tooltip: "Slider tooltip",
    min: 0,
    max: 100,
    step: 1,
    getFunc: { __luaFn: true, code: "function() return 50 end" },
    setFunc: { __luaFn: true, code: "function(value) d(value) end" },
    width: "full",
    default: ""
  };
  objects.push(newObj);
  saveState();
  renderUI();
}

function addDropdown() {
  const newObj = {
    type: "dropdown",
    name: "New Dropdown",
    tooltip: "Dropdown tooltip",
    choices: ["Option 1", "Option 2", "Option 3"],
    getFunc: { __luaFn: true, code: "function() return \"Option 1\" end" },
    setFunc: { __luaFn: true, code: "function(var) print(var) end" },
    width: "full",
    default: ""
  };
  objects.push(newObj);
  saveState();
  renderUI();
}

function addButton() {
  const newObj = {
    type: "button",
    name: "New Button",
    tooltip: "Button tooltip",
    func: { __luaFn: true, code: "function() d(\"button pressed!\") end" },
    width: "full",
  };
  objects.push(newObj);
  saveState();
  renderUI();
}

function addSubmenu() {
  const newObj = {
    type: "submenu",
    name: "New Submenu",
    tooltip: "Submenu tooltip",
    controls: [],
    width: "full",
    default: ""
  };
  objects.push(newObj);
  saveState();
  renderUI();
}

function addColorpicker() {
  const newObj = {
    type: "colorpicker",
    name: "New Color Picker",
    tooltip: "Color picker tooltip",
    getFunc: { __luaFn: true, code: "function() return 1, 0, 0, 1 end" },
    setFunc: { __luaFn: true, code: "function(r,g,b,a) print(r, g, b, a) end" },
    width: "full",
    default: ""
  };
  objects.push(newObj);
  saveState();
  renderUI();
}

/////////////////////
// Object Manipulation Functions
/////////////////////
function removeObject(index) {
  if (confirm("Are you sure you want to delete this object? This cannot be undone.")) {
    objects.splice(index, 1);
    saveState();
    renderUI();
  }
}

function moveObjectUp(index) {
  if (index > 0) {
    const temp = objects[index];
    objects[index] = objects[index - 1];
    objects[index - 1] = temp;
    saveState();
    renderUI();
  }
}

function moveObjectDown(index) {
  if (index < objects.length - 1) {
    const temp = objects[index];
    objects[index] = objects[index + 1];
    objects[index + 1] = temp;
    saveState();
    renderUI();
  }
}

function loadSampleMenu() {
  const clone = deepClone(sampleTemplate);
  panelData = clone.panelData;
  objects = clone.optionsTable;
  editPanelData = true;

  saveState();
  renderUI();
}

function clearMenu() {
  if (confirm("Are you sure you want to clear all panel data and objects? This cannot be undone.")) {
    panelData = null;
    editPanelData = false;
    objects = [];
    saveState();
    renderUI();
  }
}