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
// Sample data (converted from sample.lua)
// Functions are stored as objects { __luaFn: true, code: "function(...) ... end" }
// so they can be edited as raw Lua code and exported without quotes.
const sampleTemplate = {
  panelData: {
    type: "panel",
    name: "Window Title",
    displayName: "Longer Window Title",
    author: "Seerah",
    version: "1.3",
    slashCommand: "/myaddon",
    registerForRefresh: true,
    registerForDefaults: true,
  },
  optionsTable: [
    {
      type: "header",
      name: "My Header",
      width: "full",
    },
    {
      type: "description",
      title: null,
      text: "My description text to display. blah blah blah blah blah blah blah - even more sample text!!",
      width: "full",
    },
    {
      type: "dropdown",
      name: "My Dropdown",
      tooltip: "Dropdown's tooltip text.",
      choices: ["table", "of", "choices"],
      getFunc: { __luaFn: true, code: "function() return \"of\" end" },
      setFunc: { __luaFn: true, code: "function(var) print(var) end" },
      width: "half",
      warning: "Will need to reload the UI.",
    },
    {
      type: "dropdown",
      name: "My Dropdown",
      tooltip: "Dropdown's tooltip text.",
      choices: ["table", "of", "choices"],
      getFunc: { __luaFn: true, code: "function() return \"of\" end" },
      setFunc: { __luaFn: true, code: "function(var) print(var) end" },
      width: "half",
      warning: "Will need to reload the UI.",
    },
    {
      type: "slider",
      name: "My Slider",
      tooltip: "Slider's tooltip text.",
      min: 0,
      max: 20,
      step: 1,
      getFunc: { __luaFn: true, code: "function() return 3 end" },
      setFunc: { __luaFn: true, code: "function(value) d(value) end" },
      width: "half",
      default: 5,
    },
    {
      type: "button",
      name: "My Button",
      tooltip: "Button's tooltip text.",
      func: { __luaFn: true, code: "function() d(\"button pressed!\") end" },
      width: "half",
      warning: "Will need to reload the UI.",
    },
    {
      type: "submenu",
      name: "Submenu Title",
      tooltip: "My submenu tooltip",
      controls: [
        {
          type: "checkbox",
          name: "My Checkbox",
          tooltip: "Checkbox's tooltip text.",
          getFunc: { __luaFn: true, code: "function() return true end" },
          setFunc: { __luaFn: true, code: "function(value) d(value) end" },
          width: "half",
          warning: "Will need to reload the UI.",
        },
        {
          type: "colorpicker",
          name: "My Color Picker",
          tooltip: "Color Picker's tooltip text.",
          getFunc: { __luaFn: true, code: "function() return 1, 0, 0, 1 end" },
          setFunc: { __luaFn: true, code: "function(r,g,b,a) print(r, g, b, a) end" },
          width: "half",
          warning: "warning text",
        },
        {
          type: "editbox",
          name: "My Editbox",
          tooltip: "Editbox's tooltip text.",
          getFunc: { __luaFn: true, code: "function() return \"this is some text\" end" },
          setFunc: { __luaFn: true, code: "function(text) print(text) end" },
          isMultiline: false,
          width: "half",
          warning: "Will need to reload the UI.",
          default: "",
        },
      ],
    },
    {
      type: "custom",
      reference: "MyAddonCustomControl",
      refreshFunc: { __luaFn: true, code: "function(customControl) end" },
      width: "half",
    },
    {
      type: "texture",
      image: "EsoUI\\Art\\ActionBar\\abilityframe64_up.dds",
      imageWidth: 64,
      imageHeight: 64,
      tooltip: "Image's tooltip text.",
      width: "half",
    },
  ],
};

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj, (k, v) => {
    // preserve function objects with __luaFn
    if (v && typeof v === "object" && v.__luaFn) return { __luaFn: true, code: v.code };
    return v;
  }));
}

/////////////////////
// App functions
/////////////////////
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
  renderUI();
}

function addHeader() {
  const newHeader = {
    type: "header",
    name: "New Header",
    width: "full",
  };

  elements.push(newHeader);
  selectedIndex = elements.length - 1;
  renderUI();
}

function addDescription() {
  const newDesc = {
    type: "description",
    title: null,
    text: "Description text",
    width: "full",
  };
  elements.push(newDesc);
  selectedIndex = elements.length - 1;
  renderUI();
}

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

function loadSampleMenu() {
  const clone = deepClone(sampleTemplate);
  panelData = clone.panelData;
  elements = clone.optionsTable;
  editPanelData = true;
  selectedIndex = null;
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

  elementsArr.forEach(el => {
    lua += "    {\n";
    for (const [k, v] of Object.entries(el)) {
      // write property
      // 'type' and 'name' commonly strings: still go through luaValue to handle function objects etc.
      lua += `        ${k} = ${luaValue(v)},\n`;
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

/////////////////////
// UI bindings + render
/////////////////////
const addPanelBtn = document.getElementById("addPanelDataBtn");
if (addPanelBtn && !addPanelBtn.dataset.bound) {
  addPanelBtn.onclick = addPanelData;
  addPanelBtn.dataset.bound = true;
}

const addHeaderBtn = document.getElementById("addHeaderBtn");
if (addHeaderBtn && !addHeaderBtn.dataset.bound) {
  addHeaderBtn.onclick = addHeader;
  addHeaderBtn.dataset.bound = true;
}

const addDescBtn = document.getElementById("addDescriptionBtn");
if (addDescBtn && !addDescBtn.dataset.bound) {
  addDescBtn.onclick = addDescription;
  addDescBtn.dataset.bound = true;
}

const addBtn = document.getElementById("addOptionBtn");
if (addBtn && !addBtn.dataset.bound) {
  addBtn.onclick = addOption;
  addBtn.dataset.bound = true;
}

const sampleBtn = document.getElementById("sampleMenuBtn");
if (sampleBtn && !sampleBtn.dataset.bound) {
  sampleBtn.onclick = () => {
    if (confirm("Load sample menu? This will replace current panel and options.")) {
      loadSampleMenu();
    }
  };
  sampleBtn.dataset.bound = true;
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

    // Choose input type based on the value's JS type
    let input;
    if (typeof value === "boolean") {
      input = document.createElement("input");
      input.type = "checkbox";
      input.checked = value;
      input.onchange = e => {
        panelData[key] = e.target.checked;
        renderPreview();
      };
    } else if (typeof value === "number") {
      input = document.createElement("input");
      input.type = "number";
      input.value = value;
      input.oninput = e => {
        const n = parseFloat(e.target.value);
        panelData[key] = isNaN(n) ? e.target.value : n;
        renderPreview();
      };
    } else {
      input = document.createElement("input");
      input.value = value == null ? "" : value;
      input.style.flex = "1";
      input.oninput = e => {
        panelData[key] = e.target.value;
        renderPreview();
      };
    }

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

  // Type selector (keep common choices, but user can edit raw type below)
  const typeLabel = document.createElement("label");
  typeLabel.textContent = "Type:";
  const typeSelect = document.createElement("select");
  ["checkbox", "slider", "dropdown", "description", "header", "button", "submenu", "custom", "texture", "editbox", "colorpicker"].forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    if (el.type === t) opt.selected = true;
    typeSelect.appendChild(opt);
  });
  typeSelect.onchange = e => {
    updateElementProperty("type", e.target.value);
    renderEditor(); // re-render to reflect fields
  };

  const typeRow = document.createElement("div");
  typeRow.style.display = "flex";
  typeRow.style.alignItems = "center";
  typeRow.style.gap = "8px";
  typeRow.style.marginBottom = "6px";
  typeRow.appendChild(typeLabel);
  typeRow.appendChild(typeSelect);
  editor.appendChild(typeRow);

  // Generic editor: iterate all keys on the element and provide appropriate input
  function addField(key, value) {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";
    wrapper.style.gap = "8px";
    wrapper.style.marginBottom = "6px";

    const label = document.createElement("label");
    label.textContent = key + ":";
    label.style.width = "150px";

    // Function object editor (raw Lua)
    if (value && typeof value === "object" && value.__luaFn) {
      const ta = document.createElement("textarea");
      ta.value = value.code;
      ta.style.width = "100%";
      ta.style.height = "70px";
      ta.oninput = e => {
        elements[selectedIndex][key].code = e.target.value;
        renderPreview();
      };
      wrapper.appendChild(label);
      wrapper.appendChild(ta);
      editor.appendChild(wrapper);
      return;
    }

    // Arrays / Objects -> JSON editor textarea
    if (Array.isArray(value) || (value && typeof value === "object")) {
      const ta = document.createElement("textarea");
      try {
        ta.value = JSON.stringify(value, null, 2);
      } catch {
        ta.value = String(value);
      }
      ta.style.width = "100%";
      ta.style.height = "90px";
      ta.onblur = e => {
        try {
          const parsed = JSON.parse(e.target.value);
          elements[selectedIndex][key] = parsed;
          renderPreview();
          renderSidebar();
        } catch (err) {
          alert("Invalid JSON: " + err.message);
          // keep old value
        }
      };
      wrapper.appendChild(label);
      wrapper.appendChild(ta);

      // If this is controls (submenu), add a quick helper to open nested editor by selecting the item
      if (key === "controls") {
        const hint = document.createElement("div");
        hint.innerHTML = `<small style="display:block;margin-left:150px;color:#888">You can edit nested controls as JSON or edit each control by selecting it in the sidebar (they will appear after loading sample or adding them manually).</small>`;
        editor.appendChild(wrapper);
        editor.appendChild(hint);
        return;
      }

      editor.appendChild(wrapper);
      return;
    }

    // Primitive editors
    if (typeof value === "boolean") {
      const inp = document.createElement("input");
      inp.type = "checkbox";
      inp.checked = value;
      inp.onchange = e => {
        elements[selectedIndex][key] = e.target.checked;
        renderPreview();
      };
      wrapper.appendChild(label);
      wrapper.appendChild(inp);
      editor.appendChild(wrapper);
      return;
    }

    if (typeof value === "number") {
      const inp = document.createElement("input");
      inp.type = "number";
      inp.value = String(value);
      inp.oninput = e => {
        const n = parseFloat(e.target.value);
        elements[selectedIndex][key] = isNaN(n) ? e.target.value : n;
        renderPreview();
      };
      wrapper.appendChild(label);
      wrapper.appendChild(inp);
      editor.appendChild(wrapper);
      return;
    }

    // default text input
    const inp = document.createElement("input");
    inp.type = "text";
    inp.value = value == null ? "" : value;
    inp.style.flex = "1";
    inp.oninput = e => {
      elements[selectedIndex][key] = e.target.value;
      renderPreview();
      renderSidebar();
    };
    wrapper.appendChild(label);
    wrapper.appendChild(inp);
    editor.appendChild(wrapper);
  }

  // Render every property of the element
  for (const key of Object.keys(el)) {
    addField(key, el[key]);
  }

  // Button to add a new blank property on this element
  const addPropBtn = document.createElement("button");
  addPropBtn.textContent = "Add Property";
  addPropBtn.style.marginTop = "8px";
  addPropBtn.onclick = () => {
    const propName = prompt("Property name (key):");
    if (!propName) return;
    // default string value
    elements[selectedIndex][propName] = "";
    renderEditor();
  };
  editor.appendChild(addPropBtn);

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "Delete Option";
  removeBtn.onclick = () => {
    if (confirm("Delete this option?")) {
      removeElement(selectedIndex);
    }
  };
  removeBtn.style.marginTop = "10px";
  removeBtn.style.marginLeft = "8px";
  editor.appendChild(removeBtn);
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

      html += `<div style="margin-bottom:8px;">`;
      switch (type) {
        case "checkbox":
          html += `<label><input type="checkbox"> ${escapeHtml(name)}</label>`;
          break;
        case "slider":
          const min = el.min != null ? el.min : 0;
          const max = el.max != null ? el.max : 100;
          const value = el.default != null ? el.default : Math.floor((min + max) / 2);
          html += `<label>${escapeHtml(name)}</label><input type="range" min="${escapeHtml(min)}" max="${escapeHtml(max)}" value="${escapeHtml(value)}">`;
          break;
        case "dropdown":
          html += `<label>${escapeHtml(name)}</label><select>`;
          if (Array.isArray(el.choices)) {
            el.choices.forEach(c => {
              html += `<option>${escapeHtml(c)}</option>`;
            });
          } else {
            html += `<option>Option 1</option><option>Option 2</option>`;
          }
          html += `</select>`;
          break;
        case "description":
          html += `<p style="margin:0; font-style:italic;">${escapeHtml(el.text || el.name || "")}</p>`;
          break;
        case "header":
          html += `<h3 style="margin: 8px 0;">${escapeHtml(name)}</h3>`;
          break;
        case "button":
          html += `<button>${escapeHtml(name)}</button>`;
          break;
        case "submenu":
          html += `<details><summary>${escapeHtml(name)}</summary>`;
          if (Array.isArray(el.controls)) {
            el.controls.forEach(c => {
              html += `<div style="margin:6px 8px 6px 8px;">`;
              html += `<small style="color:#999">${escapeHtml(c.type || "")}</small><br>`;
              html += `${escapeHtml(c.name || "")}`;
              html += `</div>`;
            });
          }
          html += `</details>`;
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
