/**
 * UI rendering functions and DOM manipulation
 */

/////////////////////
// Main Rendering Functions
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

  // Render each field of the panel data (except type)
  Object.keys(panelData).forEach(key => {
    if (key === "type") return; // Skip type field - not editable
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
        saveState();
        renderPreview();
      };
    } else if (typeof value === "number") {
      input.type = "number";
      input.value = value;
      input.oninput = e => {
        const n = parseFloat(e.target.value);
        panelData[key] = isNaN(n) ? e.target.value : n;
        saveState();
        renderPreview();
      };
    } else {
      input.type = "text";
      input.value = value == null ? "" : value;
      input.oninput = e => {
        panelData[key] = e.target.value;
        saveState();
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
    
    // Create move buttons HTML
    const moveButtonsHtml = `
      <div class="move-buttons">
        <button class="move-btn" onclick="moveObjectUp(${index})" ${index === 0 ? 'disabled' : ''} title="Move Up">↑</button>
        <button class="move-btn" onclick="moveObjectDown(${index})" ${index === objects.length - 1 ? 'disabled' : ''} title="Move Down">↓</button>
      </div>
    `;
    
    objectSection.innerHTML = `
      <div class="object-header">
        <h3>${obj.type.charAt(0).toUpperCase() + obj.type.slice(1)} (${obj.name || "Unnamed"})</h3>
        <div class="object-controls">
          ${moveButtonsHtml}
          <button class="delete-object-btn" onclick="removeObject(${index})">Delete</button>
        </div>
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

  // Render each field of the object (except type)
  Object.keys(obj).forEach(key => {
    if (key === "type") return; // Skip type field - not editable

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
        saveState();
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
          saveState();
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
        saveState();
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
        saveState();
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
        saveState();
        renderPreview();
        // Update header title if name changes
        if (key === "name") {
          const header = document.querySelector(`#object-${index}`).parentElement.querySelector("h3");
          if (header) {
            header.textContent = `${objects[index].type.charAt(0).toUpperCase() + objects[index].type.slice(1)} (${e.target.value || "Unnamed"})`;
          }
        }
      };
    }

    fieldDiv.appendChild(label);
    fieldDiv.appendChild(input);
    fieldsContainer.appendChild(fieldDiv);
  });
}

function renderPreview() {
  const output = document.getElementById("previewOutput");
  if (!output) return;

  const luaCode = exportToLua(objects, panelData);
  
  // Create simple code block with line numbers and syntax highlighting
  output.innerHTML = `<pre class="line-numbers language-lua"><code class="language-lua">${escapeHtml(luaCode)}</code></pre>`;

  // Apply Prism syntax highlighting
  if (typeof Prism !== 'undefined') {
    Prism.highlightAllUnder(output);
  }
}