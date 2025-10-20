/* // Global toggle: enable editing the LAM panel metadata
let editPanelData = true;

// Editable panel metadata (this is the actual panelData)
let panelData = {
  name: "My Addon Settings",
  displayName: "My Addon Settings",
  author: "AuthorName",
  version: "1.0",
  slashCommand: "/myaddon",
  registerForRefresh: true,
  registerForDefaults: true,
};

// Export elements to Lua for LAM
function exportToLua(elements) {
  let lua = "";

  // Panel Data Section (only if enabled)
  if (editPanelData) {
    lua += "local panelData = {\n";
    lua += "    type = \"panel\",\n";
    for (const [key, val] of Object.entries(panelData)) {
      lua += `    ${key} = ${formatValue(val)},\n`;
    }
    lua += "}\n\n";
  }

  // Options Table
  lua += "local optionsTable = {\n";

  elements.forEach(el => {
    lua += "    {\n";
    lua += `        type = "${el.type}",\n`;

    if (el.name) lua += `        name = "${el.name}",\n`;
    if (el.tooltip) lua += `        tooltip = "${el.tooltip}",\n`;

    // Example functions (later can be user-defined)
    lua += `        getFunc = function() return true end,\n`;
    lua += `        setFunc = function(value) d(value) end,\n`;

    if (el.default !== undefined && el.default !== "")
      lua += `        default = ${formatValue(el.default)},\n`;

    lua += `        width = "full",\n`;
    lua += "    },\n";
  });

  lua += "}\n\n";

  // LAM registration
  if (editPanelData) {
    lua += "local LAM = LibAddonMenu2\n";
    lua += `LAM:RegisterAddonPanel("${panelData.name}", panelData)\n`;
    lua += `LAM:RegisterOptionControls("${panelData.name}", optionsTable)\n`;
  } else {
    lua += "-- panelData editing disabled; printing only optionsTable\n";
    lua += "return optionsTable\n";
  }

  return lua;
}

// Helper: format JS values into Lua syntax
function formatValue(val) {
  if (typeof val === "boolean") return val ? "true" : "false";
  if (!isNaN(val)) return val;
  return `"${val}"`;
}
 */

let editPanelData = true;

// Export elements to Lua for LAM
function exportToLua(elements) {
  let lua = "";

  if (editPanelData) {
    lua += "local panelData = {\n";
    lua += "    type = \"panel\",\n";
    for (const [key, val] of Object.entries(panelData)) {
      lua += `    ${key} = ${formatValue(val)},\n`;
    }
    lua += "}\n\n";
  }

  lua += "local optionsTable = {\n";
  elements.forEach(el => {
    lua += "    {\n";
    lua += `        type = "${el.type}",\n`;
    if (el.name) lua += `        name = "${el.name}",\n`;
    if (el.tooltip) lua += `        tooltip = "${el.tooltip}",\n`;
    lua += "        getFunc = function() return true end,\n";
    lua += "        setFunc = function(value) d(value) end,\n";
    if (el.default !== undefined && el.default !== "")
      lua += `        default = ${formatValue(el.default)},\n`;
    lua += "        width = \"full\",\n";
    lua += "    },\n";
  });
  lua += "}\n\n";

  if (editPanelData) {
    lua += "local LAM = LibAddonMenu2\n";
    lua += `LAM:RegisterAddonPanel("${panelData.name}", panelData)\n`;
    lua += `LAM:RegisterOptionControls("${panelData.name}", optionsTable)\n`;
  } else {
    lua += "-- panelData editing disabled; printing only optionsTable\n";
    lua += "return optionsTable\n";
  }

  return lua;
}

// Format JS values to Lua
function formatValue(val) {
  if (typeof val === "boolean") return val ? "true" : "false";
  if (!isNaN(val) && val !== "") return val;
  return `"${val}"`;
}