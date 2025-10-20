/* Combined app + ui + exporter for LAMBuilder
   Merges app.js, ui.js and exporter.js into a single small-file entrypoint.
   Keeps global state (elements, selectedIndex, panelData), unifies exportToLua signature,
   and provides a small escaping/formatting helper for Lua output.
*/

/////////////////////
// Core app state
/////////////////////
let elements = [];
let selectedIndex = null;

let panelData = {
  name: "My Addon Settings",
  displayName: "My Addon Settings",
  author: "AuthorName",
  version: "1.0",
  slashCommand: "/myaddon",
  registerForRefresh: true,
  registerForDefaults: true,
};

let editPanelData = true;

/////////////////////
// App functions
/////////////////////
function addElement() {
  const newEl = {
    type: "checkbox",
    name: "New Option",
    tooltip: "",
    default: false,
  };
  elements.push(newEl);
  selectedIndex = elements.length - 1;
  renderUI();
}

function selectElement(index) {
  selectedIndex = index;
  renderUI();
}

function updateElementProperty(key, value) {
  if (selectedIndex === null) return;
  elements[selectedIndex][key] = value;
  renderUI();
}

function removeElement(index) {
  elements.splice(index, 1);
  if (selectedIndex === index) selectedIndex = null;
  renderUI();
}

/////////////////////
// Exporter: JS -> Lua
/////////////////////
/*
  exportToLua(elementsArr, panelDataOverride)
  - elementsArr: array of element objects
  - panelDataOverride: optional object to use instead of current panelData
*/
function exportToLua(elementsArr, panelDataOverride) {
  const pd = panelDataOverride || panelData;
  let lua = "";

  if (editPanelData) {
    lua += "local panelData = {\n";
    lua += '    type = "panel",\n';
    for (const [key, val] of Object.entries(pd)) {
      lua += `    ${key} = ${formatValue(val)},\n`;
    }
    lua += "}\n\n";
  }

  lua += "local optionsTable = {\n";

  elementsArr.forEach(el => {
    lua += "    {\n";
    lua += `        type = \