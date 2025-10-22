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
let panelData = null;
let editPanelData = false;

/////////////////////
// App functions
/////////////////////
function addOption() {
  const newEl = {
    type: "checkbox",
    name: "New Option",
    tooltip: "Add tooltip here",
    default: true,
  };
  elements.push(newEl);
  selectedIndex = elements.length - 1;
  renderUI();
}

function addPanelData() {
  // Create a new default panelData object
  panelData = {
    name: "My Addon",
    displayName: "My Addon Settings",
    author: "AuthorName",
    version: "1.0",
    slashCommand: "/myaddon",
    registerForRefresh: true,
    registerForDefaults: true,
  };

  editPanelData = true;           // enable editing
  selectedIndex = null;           // deselect any element
  renderUI();                     // rebuild UI like Add Element does
}

function selectElement(index) {
  selectedIndex = index;
  renderUI();
}

function updateElementProperty(key, value) {
  if (selectedIndex === null) return;
  elements[selectedIndex][key] = value;
  renderPreview();
}

function removeElement(index) {
  elements.splice(index, 1);
  if (selectedIndex === index) selectedIndex = null;
  renderUI();
}

/////////////////////
// Exporter: JS -> Lua
/////////////////////
function exportToLua(elementsArr, panelDataOverride) {
  const pd = panelDataOverride || panelData;
  let lua = "";

  if (editPanelData && pd) {
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
    lua += `        type = "${escapeForLua(el.type)}",\n`;
    if (el.name) lua += `        name = "${escapeForLua(el.name)}",\n`;
    if (el.tooltip) lua += `        tooltip = "${escapeForLua(el.tooltip)}",\n`;

    lua += "        getFunc = function() return true end,\n";
    lua += "        setFunc = function(value) d(value) end,\n";

    if (el.default !== undefined && el.default !== "") {
      lua += `        default = ${formatValue(el.default)},\n`;
    }

    lua += '        width = "full",\n';
    lua += "    },\n";
  });

  lua += "}\n\n";

  if (editPanelData && pd) {
    lua += "local LAM = LibAddonMenu2\n";
    lua += `LAM:RegisterAddonPanel("${escapeForLua(pd.name)}", panelData)\n`;
    lua += `LAM:RegisterOptionControls("${escapeForLua(pd.name)}", optionsTable)\n`;
  } else {
    lua += "-- panelData editing disabled; printing only optionsTable\n";
    lua += "return optionsTable\n";
  }

  return lua;
}

function formatValue(val) {
  if (typeof val === "boolean") return val ? "true" : "false";
  if (typeof val === "number") return String(val);
  if (!isNaN(val) && val !== "") return String(val);
  return `"${escapeForLua(String(val))}"`;
}

function escapeForLua(s) {
  return String(s)
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r\n/g, "\\n")
    .replace(/\n/g, "\\n");
}

/////////////////////
// UI bindings + render
/////////////////////
const addPanelBtn = document.getElementById("addPanelDataBtn");
if (addPanelBtn && !addPanelBtn.dataset.bound) {
  addPanelBtn.onclick = addPanelData;
  addPanelBtn.dataset.bound = true;
}

const addBtn = document.getElementById("addOptionBtn");
if (addBtn && !addBtn.dataset.bound) {
  addBtn.onclick = addOption;
  addBtn.dataset.bound = true;
}

const copyBtn = document.getElementById("copyBtn");
if (copyBtn && !copyBtn.dataset.bound) {
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(exportToLua(elements, panelData));
    alert("Lua copied to clipboard!");
  };
  copyBtn.dataset.bound = true;
}

let currentPreview = "lua";

const togglePreviewBtn = document.getElementById("togglePreviewBtn");
if (togglePreviewBtn && !togglePreviewBtn.dataset.bound) {
  togglePreviewBtn.onclick = () => {
    currentPreview = currentPreview === "lua" ? "live" : "lua";
    renderPreview();
  };
  togglePreviewBtn.dataset.bound = true;
}

/////////////////////
// Rendering
/////////////////////
function renderUI() {
  renderPanelDataEditor();
  renderSidebar();
  renderEditor();
  renderPreview();
}

function renderPanelDataEditor() {
  const panelEditor = document.getElementById("panelDataEditor");
  if (!panelEditor) return;

  if (!editPanelData || !panelData) {
    panelEditor.innerHTML = `
      <h3>Panel Data</h3>
      <p>No panel data added. Click <strong>"Add Panel Data"</strong> to create one.</p>
    `;
    return;
  }

  panelEditor.innerHTML = "<h3>Panel Data</h3>";

  for (const key of Object.keys(panelData)) {
    const value = panelData[key];

    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";
    wrapper.style.gap = "8px";
    wrapper.style.marginBottom = "4px";

    const label = document.createElement("label");
    label.textContent = key;
    label.style.width = "150px";

    const input = document.createElement("input");
    input.value = value;
    input.style.flex = "1";
    input.oninput = e => {
      panelData[key] = e.target.value;
      renderPreview();
    };

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    panelEditor.appendChild(wrapper);
  }

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete Panel Data";
  deleteBtn.style.marginTop = "10px";
  deleteBtn.onclick = () => {
    if (confirm("Are you sure you want to delete panel data?")) {
      panelData = null;
      editPanelData = false;
      renderUI();
    }
  };

  panelEditor.appendChild(deleteBtn);
}

function renderSidebar() {
  const list = document.getElementById("optionsList");
  if (!list) return;
  list.innerHTML = "";
  elements.forEach((el, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}. ${el.name || "Unnamed"} (${el.type})`;
    li.style.cursor = "pointer";
    li.style.marginBottom = "5px";
    li.onclick = () => selectElement(i);
    if (i === selectedIndex) li.style.color = "#0f0";
    list.appendChild(li);
  });
}

function renderEditor() {
  const editor = document.getElementById("propertyEditor");
  if (!editor) return;

  if (!elements.length) {
    editor.innerHTML = `
      <h3>Options Properties</h3>
      <p>No options added. Click <strong>"Add Option"</strong> to create one.</p>
    `;
    return;
  }

  if (selectedIndex === null) {
    editor.innerHTML = `
      <h3>Options Properties</h3>
      <p>Select an option from the list to edit its properties.</p>
    `;
    return;
  }

  const el = elements[selectedIndex];
  editor.innerHTML = "<h3>Options Properties</h3>";

  const typeLabel = document.createElement("label");
  typeLabel.textContent = "Type:";
  const typeSelect = document.createElement("select");
  ["checkbox", "slider", "dropdown", "description"].forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    if (el.type === t) opt.selected = true;
    typeSelect.appendChild(opt);
  });
  typeSelect.onchange = e => updateElementProperty("type", e.target.value);

  const typeRow = document.createElement("div");
  typeRow.style.display = "flex";
  typeRow.style.alignItems = "center";
  typeRow.style.gap = "8px";
  typeRow.style.marginBottom = "6px";
  typeRow.appendChild(typeLabel);
  typeRow.appendChild(typeSelect);
  editor.appendChild(typeRow);

  addInput("Name", "name", el.name);
  addInput("Tooltip", "tooltip", el.tooltip);
  addInput("Default", "default", el.default, "text");

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "Delete Option";
  removeBtn.onclick = () => removeElement(selectedIndex);
  removeBtn.style.marginTop = "10px";
  editor.appendChild(removeBtn);

  function addInput(labelText, key, value, type = "text") {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";
    wrapper.style.gap = "8px";
    wrapper.style.marginBottom = "4px";

    const label = document.createElement("label");
    label.textContent = labelText;
    label.style.width = "150px";

    const input = document.createElement("input");
    input.type = type;
    input.value = value || "";
    input.style.flex = "1";
    input.oninput = e => {
      updateElementProperty(key, e.target.value);
      renderSidebar();
    };

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    editor.appendChild(wrapper);
  }
}

function renderPreview() {
  const preview = document.getElementById("preview");
  const title = document.getElementById("previewTitle");
  const output = document.getElementById("previewOutput");
  const toggleBtn = document.getElementById("togglePreviewBtn");

  if (!preview || !output || !title || !toggleBtn) return;

  if (currentPreview === "lua") {
    // Lua Preview
    preview.classList.remove("live");  // removes background image
    output.classList.remove("live");
    title.textContent = "Lua Preview";
    toggleBtn.textContent = "Switch to Live Preview";

    output.textContent = exportToLua(elements, panelData); // green-on-black text
  } else {
    // Live Preview
    preview.classList.add("live");     // sets background image on outer div
    output.classList.add("live");      // inner controls styling
    title.textContent = "Live Preview";
    toggleBtn.textContent = "Switch to Lua Preview";

    let html = "";
    elements.forEach(el => {
      const name = el.name || "(unnamed)";
      const type = (el.type || "unknown").toLowerCase();

      html += `<div>`;
      switch (type) {
        case "checkbox":
          html += `<label><input type="checkbox"> ${escapeHtml(name)}</label>`;
          break;
        case "slider":
          html += `<label>${escapeHtml(name)}</label><input type="range" min="0" max="100" value="50">`;
          break;
        case "dropdown":
          html += `<label>${escapeHtml(name)}</label>
                   <select><option>Option 1</option><option>Option 2</option></select>`;
          break;
        case "description":
          html += `<p style="margin:0; font-style:italic;">${escapeHtml(name)}</p>`;
          break;
        default:
          html += `<label>${escapeHtml(name)}</label><input type="text" placeholder="${escapeHtml(type)}">`;
          break;
      }
      html += `</div>`;
    });

    output.innerHTML = html || "<em>No elements to preview</em>";
  }
}


// small helper to avoid injecting unescaped text into live preview labels/placeholders
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Initial render
renderUI();
