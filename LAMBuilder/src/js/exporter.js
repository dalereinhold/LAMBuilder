/**
 * Lua export functionality and utilities
 */

/////////////////////
// Exporter: JS -> Lua
/////////////////////
function exportToLua(objectsArr, panelDataOverride) {
  const pd = panelDataOverride || panelData;
  let lua = "";

  if (editPanelData && pd) {
    lua += "local panelData = {\n";
    // Ensure type = "panel" always present
    lua += '    type = "panel",\n';
    for (const [key, val] of Object.entries(pd)) {
      // skip 'type' because we already added it
      if (key === "type") continue;
      lua += `    ${key} = ${luaValue(val)},\n`;
    }
    lua += "}\n\n";
  }

  lua += "local optionsTable = {\n";

  objectsArr.forEach(obj => {
    lua += "    {\n";
    for (const [key, v] of Object.entries(obj)) {
      // Skip blank fields (empty strings, empty arrays, null, undefined)
      if (v === "" || v === null || v === undefined ||
        (Array.isArray(v) && v.length === 0)) {
        continue;
      }

      // write property
      // Special handling for default field - output as raw text
      if (key === "default") {
        lua += `        ${key} = ${v},\n`;
      } else {
        // 'type' and 'name' commonly strings: still go through luaValue to handle function objects etc.
        lua += `        ${key} = ${luaValue(v)},\n`;
      }
    }
    lua += "    },\n";
  });

  lua += "}\n\n";

  if (editPanelData && pd) {
    lua += "local LAM = LibAddonMenu2\n";
    lua += `LAM:RegisterAddonPanel("${escapeForLua(pd.name || '')}", panelData)\n`;
    lua += `LAM:RegisterOptionControls("${escapeForLua(pd.name || '')}", optionsTable)\n`;
  } else {
    lua += "-- panelData editing disabled; printing only optionsTable\n";
    lua += "return optionsTable\n";
  }

  return lua;
}

function luaValue(val) {
  if (val === null || val === undefined) return "nil";
  if (typeof val === "boolean") return val ? "true" : "false";
  if (typeof val === "number") return String(val);
  // function object
  if (val && typeof val === "object" && val.__luaFn) {
    return val.code;
  }
  if (Array.isArray(val)) {
    return "{" + val.map(v => luaValue(v)).join(", ") + "}";
  }
  if (typeof val === "object") {
    // map/object -> lua table with key = value
    const parts = [];
    for (const [key, value] of Object.entries(val)) {
      // if key is valid lua identifier
      if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
        parts.push(`${key} = ${luaValue(value)}`);
      } else {
        parts.push(`["${escapeForLua(key)}"] = ${luaValue(value)}`);
      }
    }
    return "{" + parts.join(", ") + "}";
  }
  // string
  return `"${escapeForLua(String(val))}"`;
}

function formatValue(val) {
  return luaValue(val);
}

function escapeForLua(s) {
  return String(s)
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r\n/g, "\\n")
    .replace(/\n/g, "\\n");
}

// Helper function for HTML escaping
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}