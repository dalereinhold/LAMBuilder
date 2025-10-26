/* Combined app + ui + exporter for LAMBuilder
   Merges app.js, ui.js and exporter.js into a single small-file entrypoint.
   Keeps global state (objects, panelData), unifies exportToLua signature,
   and provides a small escaping/formatting helper for Lua output.
*/

/////////////////////
// Core app state
/////////////////////
let objects = [];

let panelData = null;
let editPanelData = false;

/////////////////////
// Functions are stored as objects { __luaFn: true, code: "function(...) ... end" }
// so they can be edited as raw Lua code and exported without quotes.
const sampleTemplate = {
  panelData: {
    type: "panel",
    name: "My Addon",
    displayName: "My Addon Settings",
    author: "AuthorName",
    version: "1.0",
    slashCommand: "/myaddon",
    registerForRefresh: true,
    registerForDefaults: true,
  },
  optionsTable: [
    {
      type: "header",
      name: "My First Header",
      width: "full",
    },
    {
      type: "description",
      text: "This is my first section containing only full widths.",
      width: "full",
    },
    {
      type: "checkbox",
      name: "My Checkbox",
      tooltip: "Checkbox's tooltip text.",
      getFunc: { __luaFn: true, code: "function() return true end" },
      setFunc: { __luaFn: true, code: "function(value) d(value) end" },
      width: "full",
    },
    {
      type: "dropdown",
      name: "My Dropdown",
      tooltip: "Dropdown's tooltip text.",
      choices: ["table", "of", "choices"],
      getFunc: { __luaFn: true, code: "function() return \"of\" end" },
      setFunc: { __luaFn: true, code: "function(var) print(var) end" },
      width: "full",
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
      width: "full",
      default: 5,
    },
    {
      type: "colorpicker",
      name: "My Color Picker",
      tooltip: "Color Picker's tooltip text.",
      getFunc: { __luaFn: true, code: "function() return 1, 0, 0, 1 end" },
      setFunc: { __luaFn: true, code: "function(r,g,b,a) print(r, g, b, a) end" },
      width: "full",
    },
    {
      type: "button",
      name: "My Button",
      tooltip: "Button's tooltip text.",
      func: { __luaFn: true, code: "function() d(\"button pressed!\") end" },
      width: "full",
    },
    {
      type: "header",
      name: "My Second Header",
      width: "full",
    },
    {
      type: "description",
      text: "This is my second section containing only half widths.",
      width: "full",
    },
    {
      type: "checkbox",
      name: "My Checkbox",
      tooltip: "Checkbox's tooltip text.",
      getFunc: { __luaFn: true, code: "function() return true end" },
      setFunc: { __luaFn: true, code: "function(value) d(value) end" },
      width: "half",
    },
    {
      type: "dropdown",
      name: "My Dropdown",
      tooltip: "Dropdown's tooltip text.",
      choices: ["table", "of", "choices"],
      getFunc: { __luaFn: true, code: "function() return \"of\" end" },
      setFunc: { __luaFn: true, code: "function(var) print(var) end" },
      width: "half",
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
      type: "colorpicker",
      name: "My Color Picker",
      tooltip: "Color Picker's tooltip text.",
      getFunc: { __luaFn: true, code: "function() return 1, 0, 0, 1 end" },
      setFunc: { __luaFn: true, code: "function(r,g,b,a) print(r, g, b, a) end" },
      width: "half",
    },
    {
      type: "button",
      name: "My Button",
      tooltip: "Button's tooltip text.",
      func: { __luaFn: true, code: "function() d(\"button pressed!\") end" },
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
  renderUI();
}

// Individual add functions for each object type
function addHeader() {
  const newObj = {
    type: "header",
    name: "New Header",
    width: "full"
  };
  objects.push(newObj);
  renderUI();
}

function addDescription() {
  const newObj = {
    type: "description",
    text: "Description text",
    width: "full"
  };
  objects.push(newObj);
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
    default: true
  };
  objects.push(newObj);
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
    default: 50
  };
  objects.push(newObj);
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
  };
  objects.push(newObj);
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
  renderUI();
}

function addSubmenu() {
  const newObj = {
    type: "submenu",
    name: "New Submenu",
    tooltip: "Submenu tooltip",
    controls: [],
    width: "full"
  };
  objects.push(newObj);
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
  };
  objects.push(newObj);
  renderUI();
}



function removeObject(index) {
  objects.splice(index, 1);
  renderUI();
}

function loadSampleMenu() {
  const clone = deepClone(sampleTemplate);
  panelData = clone.panelData;
  objects = clone.optionsTable;
  editPanelData = true;

  renderUI();
}

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
      // 'type' and 'name' commonly strings: still go through luaValue to handle function objects etc.
      lua += `        ${key} = ${luaValue(v)},\n`;
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


// Bind all the individual add buttons
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
    navigator.clipboard.writeText(exportToLua(objects, panelData));
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
  renderObjectsContainer();
  renderPreview();
}

function renderPanelDataEditor() {
  const panelEditor = document.getElementById("panelDataEditor");
  if (!panelEditor) return;

  if (!editPanelData || !panelData) {
    panelEditor.innerHTML = `<p>No panel data added. Use the "Add Panel" button to create one.</p>`;
    return;
  }

  panelEditor.innerHTML = "";

  const panelSection = document.createElement("div");
  panelSection.className = "object-section";
  panelSection.innerHTML = `
    <div class="object-header">
      <h3>Panel Data (${panelData.name || "Unnamed Panel"})</h3>
      <button class="delete-object-btn" onclick="deletePanelData()">Delete</button>
    </div>
    <div class="object-fields" id="panel-fields"></div>
  `;
  panelEditor.appendChild(panelSection);

  // Render panel data fields
  renderPanelDataFields();
}

function renderPanelDataFields() {
  const fieldsContainer = document.getElementById("panel-fields");
  if (!fieldsContainer) return;

  fieldsContainer.innerHTML = "";

  // Render each field of the panel data
  Object.keys(panelData).forEach(key => {
    const value = panelData[key];
    const fieldDiv = document.createElement("div");
    fieldDiv.className = "field-row";

    const label = document.createElement("label");
    label.textContent = key + ":";
    label.className = "field-label";

    let input = document.createElement("input");
    input.className = "field-input";

    // Handle different value types
    if (typeof value === "boolean") {
      input.type = "text";
      input.value = value ? "true" : "false";
      input.oninput = e => {
        panelData[key] = e.target.value === "true";
        renderPreview();
      };
    } else if (typeof value === "number") {
      input.type = "number";
      input.value = value;
      input.oninput = e => {
        const n = parseFloat(e.target.value);
        panelData[key] = isNaN(n) ? e.target.value : n;
        renderPreview();
      };
    } else {
      input.type = "text";
      input.value = value == null ? "" : value;
      input.oninput = e => {
        panelData[key] = e.target.value;
        renderPreview();
        // Update header title if name changes
        if (key === "name") {
          const header = document.querySelector(".object-section h3");
          if (header) {
            header.textContent = `Panel Data (${e.target.value || "Unnamed Panel"})`;
          }
        }
      };
    }

    fieldDiv.appendChild(label);
    fieldDiv.appendChild(input);
    fieldsContainer.appendChild(fieldDiv);
  });
}

function deletePanelData() {
  if (confirm("Are you sure you want to delete panel data?")) {
    panelData = null;
    editPanelData = false;
    renderUI();
  }
}

function renderObjectsContainer() {
  const container = document.getElementById("objectsContainer");
  if (!container) return;

  if (objects.length === 0) {
    container.innerHTML = "<p>No objects added. Use the buttons on the left to add objects.</p>";
    return;
  }

  container.innerHTML = "";

  objects.forEach((obj, index) => {
    const objectSection = document.createElement("div");
    objectSection.className = "object-section";
    objectSection.innerHTML = `
      <div class="object-header">
        <h3>${obj.name || "Unnamed"} (${obj.type})</h3>
        <button class="delete-object-btn" onclick="removeObject(${index})">Delete</button>
      </div>
      <div class="object-fields" id="object-${index}"></div>
    `;
    container.appendChild(objectSection);

    // Render fields for this object
    renderObjectFields(obj, index);
  });
}

function renderObjectFields(obj, index) {
  const fieldsContainer = document.getElementById(`object-${index}`);
  if (!fieldsContainer) return;

  fieldsContainer.innerHTML = "";

  // Render each field of the object
  Object.keys(obj).forEach(key => {
    if (key === "type") return; // Skip type field

    const value = obj[key];
    const fieldDiv = document.createElement("div");
    fieldDiv.className = "field-row";

    const label = document.createElement("label");
    label.textContent = key + ":";
    label.className = "field-label";

    let input;

    // Function object editor (raw Lua)
    if (value && typeof value === "object" && value.__luaFn) {
      input = document.createElement("textarea");
      input.value = value.code;
      input.className = "field-textarea";
      input.oninput = e => {
        objects[index][key].code = e.target.value;
        renderPreview();
      };
    }
    // Arrays / Objects -> JSON editor
    else if (Array.isArray(value) || (value && typeof value === "object")) {
      input = document.createElement("textarea");
      input.value = JSON.stringify(value, null, 2);
      input.className = "field-textarea";
      input.onblur = e => {
        try {
          const parsed = JSON.parse(e.target.value);
          objects[index][key] = parsed;
          renderPreview();
        } catch (err) {
          alert("Invalid JSON: " + err.message);
        }
      };
    }
    // Boolean values
    else if (typeof value === "boolean") {
      input = document.createElement("input");
      input.type = "text";
      input.value = value ? "true" : "false";
      input.className = "field-input";
      input.oninput = e => {
        objects[index][key] = e.target.value === "true";
        renderPreview();
      };
    }
    // Number values
    else if (typeof value === "number") {
      input = document.createElement("input");
      input.type = "number";
      input.value = value;
      input.className = "field-input";
      input.oninput = e => {
        const n = parseFloat(e.target.value);
        objects[index][key] = isNaN(n) ? e.target.value : n;
        renderPreview();
      };
    }
    // String values
    else {
      input = document.createElement("input");
      input.type = "text";
      input.value = value == null ? "" : value;
      input.className = "field-input";
      input.oninput = e => {
        objects[index][key] = e.target.value;
        renderPreview();
      };
    }

    fieldDiv.appendChild(label);
    fieldDiv.appendChild(input);
    fieldsContainer.appendChild(fieldDiv);
  });
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

    output.textContent = exportToLua(objects, panelData);
  } else {
    // Live Preview
    preview.classList.add("live");     // sets background image on outer div
    output.classList.add("live");      // inner controls styling
    title.textContent = "Live Preview";
    toggleBtn.textContent = "Switch to Lua Preview";

    let html = "";

    // Add panel data if available
    if (editPanelData && panelData) {
      html += `<div class="live-panel-data">`;
      html += `<div class="live-panel-header">${escapeHtml(panelData.displayName || panelData.name || "Addon Settings")}</div>`;
      if (panelData.version) {
        html += `<div class="live-panel-info">Version: ${escapeHtml(panelData.version)}</div>`;
      }
      if (panelData.author) {
        html += `<div class="live-panel-info">Author: ${escapeHtml(panelData.author)}</div>`;
      }
      html += `</div>`;
    }

    // Group objects by sections (header to header)
    const sections = [];
    let currentSection = { header: null, objects: [] };

    objects.forEach(obj => {
      if (obj.type === "header") {
        // Start new section
        if (currentSection.header || currentSection.objects.length > 0) {
          sections.push(currentSection);
        }
        currentSection = { header: obj, objects: [] };
      } else {
        // Add to current section
        currentSection.objects.push(obj);
      }
    });

    // Add the last section
    if (currentSection.header || currentSection.objects.length > 0) {
      sections.push(currentSection);
    }

    // Render sections
    sections.forEach((section, sectionIndex) => {
      html += `<div class="live-object">`;

      // No HR breaks - let sections flow naturally

      // Add header if exists
      if (section.header) {
        html += `<h3>${escapeHtml(section.header.name || "Section")}</h3>`;
      }

      // Group objects by width for layout
      const layoutGroups = [];
      let currentRow = [];

      section.objects.forEach(obj => {
        const width = obj.width || "full";

        if (width === "full") {
          // Full width objects get their own row
          if (currentRow.length > 0) {
            layoutGroups.push(currentRow);
            currentRow = [];
          }
          layoutGroups.push([obj]);
        } else if (width === "half") {
          // Half width objects can share rows
          currentRow.push(obj);
          if (currentRow.length >= 2) {
            layoutGroups.push(currentRow);
            currentRow = [];
          }
        } else {
          // Default to full width for unknown widths
          if (currentRow.length > 0) {
            layoutGroups.push(currentRow);
            currentRow = [];
          }
          layoutGroups.push([obj]);
        }
      });

      // Add remaining objects in current row
      if (currentRow.length > 0) {
        layoutGroups.push(currentRow);
      }

      // Render layout groups
      layoutGroups.forEach((group, groupIndex) => {
        html += `<div class="live-controls-row">`;

        group.forEach(obj => {
          const name = obj.name || "(unnamed)";
          const type = (obj.type || "unknown").toLowerCase();
          const width = obj.width || "full";
          const widthClass = width === "half" ? "live-control-half" : "live-control-full";

          html += `<div class="${widthClass}">`;

          function renderControl(obj, isFullWidth) {
            const name = obj.name || "(unnamed)";
            const type = (obj.type || "unknown").toLowerCase();

            // For full width, separate label and control
            if (isFullWidth) {
              let controlHtml = '';

              switch (type) {
                case "checkbox":
                  return `<span class="control-label">${escapeHtml(name)}</span><span class="control-input"><span class="checkbox-toggle">ON</span></span>`;
                case "slider":
                  const min = obj.min != null ? obj.min : 0;
                  const max = obj.max != null ? obj.max : 100;
                  const value = obj.default != null ? obj.default : Math.floor((min + max) / 2);
                  return `<span class="control-label">${escapeHtml(name)}</span><span class="control-input eso-slider"><span class="slider-value">${min}</span><input type="range" min="${escapeHtml(min)}" max="${escapeHtml(max)}" value="${escapeHtml(value)}"><span class="slider-value">${max}</span></span>`;
                case "dropdown":
                  let dropdown = `<span class="control-label">${escapeHtml(name)}</span><span class="control-input"><select>`;
                  if (Array.isArray(obj.choices)) {
                    obj.choices.forEach(c => {
                      dropdown += `<option>${escapeHtml(c)}</option>`;
                    });
                  } else {
                    dropdown += `<option>Option 1</option><option>Option 2</option>`;
                  }
                  dropdown += `</select></span>`;
                  return dropdown;
                case "description":
                  return `<p style="margin: 0;">${escapeHtml(obj.text || obj.name || "")}</p>`;
                case "button":
                  return `<span class="control-label">${escapeHtml(name)}</span><span class="control-input"><button>${escapeHtml(name)}</button></span>`;
                case "submenu":
                  let submenu = `<span class="control-label">${escapeHtml(name)}</span><span class="control-input"><details><summary>Expand</summary><div class="submenu-content">`;
                  if (Array.isArray(obj.controls)) {
                    obj.controls.forEach(c => {
                      submenu += `<div style="margin-bottom: 10px;"><strong>${escapeHtml(c.name || "")}</strong> (${escapeHtml(c.type || "")})</div>`;
                    });
                  }
                  submenu += `</div></details></span>`;
                  return submenu;
                case "colorpicker":
                  return `<span class="control-label">${escapeHtml(name)}</span><span class="control-input"><input type="color" value="#ff0000"></span>`;
                default:
                  return `<span class="control-label">${escapeHtml(name)}</span><span class="control-input"><input type="text" placeholder="${escapeHtml(type)}"></span>`;
              }
            } else {
              // For half width, keep compact layout
              switch (type) {
                case "checkbox":
                  return `<label>${escapeHtml(name)} <input type="checkbox" checked></label>`;
                case "slider":
                  const min = obj.min != null ? obj.min : 0;
                  const max = obj.max != null ? obj.max : 100;
                  const value = obj.default != null ? obj.default : Math.floor((min + max) / 2);
                  return `<label>${escapeHtml(name)}</label><input type="range" min="${escapeHtml(min)}" max="${escapeHtml(max)}" value="${escapeHtml(value)}">`;
                case "dropdown":
                  let dropdown = `<label>${escapeHtml(name)}</label><select>`;
                  if (Array.isArray(obj.choices)) {
                    obj.choices.forEach(c => {
                      dropdown += `<option>${escapeHtml(c)}</option>`;
                    });
                  } else {
                    dropdown += `<option>Option 1</option><option>Option 2</option>`;
                  }
                  dropdown += `</select>`;
                  return dropdown;
                case "description":
                  return `<p>${escapeHtml(obj.text || obj.name || "")}</p>`;
                case "button":
                  return `<button>${escapeHtml(name)}</button>`;
                case "submenu":
                  let submenu = `<details><summary>${escapeHtml(name)}</summary><div class="submenu-content">`;
                  if (Array.isArray(obj.controls)) {
                    obj.controls.forEach(c => {
                      submenu += `<div style="margin-bottom: 10px;"><strong>${escapeHtml(c.name || "")}</strong> (${escapeHtml(c.type || "")})</div>`;
                    });
                  }
                  submenu += `</div></details>`;
                  return submenu;
                case "colorpicker":
                  return `<label>${escapeHtml(name)}</label><input type="color" value="#ff0000">`;
                default:
                  return `<label>${escapeHtml(name)}</label><input type="text" placeholder="${escapeHtml(type)}">`;
              }
            }
          }

          html += renderControl(obj, width === "full");
          html += `</div>`;
        });

        html += `</div>`;
      });

      html += `</div>`;
    });

    output.innerHTML = html || "<em>No objects to preview</em>";
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
