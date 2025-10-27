# LAM Builder

**LibAddonMenu 2 Builder for Elder Scrolls Online**

A modern, web-based visual builder for creating LibAddonMenu 2 (LAM) configuration panels for Elder Scrolls Online addons. Build complex settings interfaces with a drag-and-drop style interface and export clean, production-ready Lua code.

![LAM Builder](https://img.shields.io/badge/ESO-LibAddonMenu%202-blue) ![Made with Love](https://img.shields.io/badge/Made%20with-❤️%20%26%20👻%20Kiro-purple)

## ✨ Features

### 🎯 Core Functionality
- **Visual Interface Builder** - Create LAM panels without writing code
- **Real-time Preview** - See your Lua code with syntax highlighting and line numbers
- **Automatic State Persistence** - Your work is automatically saved to browser storage
- **One-Click Export** - Copy to clipboard or download as `.lua` file
- **Sample Templates** - Start with pre-built examples

### 🧩 Supported LAM Components
- **Panel Data** - Configure addon metadata and registration
- **Headers** - Section dividers and organization
- **Descriptions** - Informational text blocks
- **Checkboxes** - Boolean toggle controls
- **Sliders** - Numeric range inputs with min/max/step
- **Dropdowns** - Selection lists with custom options
- **Buttons** - Action triggers with custom functions
- **Submenus** - Nested control groups
- **Color Pickers** - RGBA color selection

### 🎨 User Experience
- **Intuitive Interface** - Clean, modern design
- **Reorderable Objects** - Move settings up/down with arrow buttons
- **Confirmation Dialogs** - Prevent accidental deletions
- **Responsive Layout** - Works on different screen sizes
- **Keyboard Shortcuts** - Copy (Ctrl+C) support

## 🚀 Quick Start

1. **Open the Builder**
   ```
   Open index.html in your web browser
   ```

2. **Create Panel Data**
   - Click "Add Panel" to create your addon's metadata
   - Fill in name, display name, author, version, etc.

3. **Add Settings Objects**
   - Use the sidebar buttons to add headers, checkboxes, sliders, etc.
   - Configure each object's properties in the middle panel
   - Reorder objects using the up/down arrow buttons

4. **Export Your Code**
   - Click "Copy Lua" to copy the generated code
   - Or click "Download Lua" to save as a file
   - Paste into your ESO addon's settings file

## 📁 Project Structure

```
LAMBuilder/
├── index.html              # Main application entry point
├── README.md               # Project documentation
└── src/                    # Source code directory
    ├── css/                # Stylesheets
    │   ├── styles.css      # Main application styles
    │   └── prism.css       # Syntax highlighting theme
    └── js/                 # JavaScript modules
        ├── main.js         # Application initialization
        ├── state.js        # State management & localStorage
        ├── templates.js    # Sample data templates
        ├── objects.js      # Object creation & manipulation
        ├── exporter.js     # Lua code generation
        ├── ui.js           # UI rendering & DOM manipulation
        ├── events.js       # Event handlers & bindings
        └── prism.js        # Syntax highlighting library
```

## 🏗️ Architecture

### Modular Design
The application follows a clean, modular architecture with separated concerns:

- **State Management** (`state.js`) - Centralized application state with automatic persistence
- **Object Management** (`objects.js`) - CRUD operations for LAM objects
- **UI Rendering** (`ui.js`) - DOM manipulation and view updates
- **Event Handling** (`events.js`) - User interaction and event bindings
- **Export System** (`exporter.js`) - Lua code generation with proper escaping
- **Templates** (`templates.js`) - Sample data and default configurations

### Data Flow
1. User interactions trigger events (`events.js`)
2. Events modify application state (`state.js`)
3. State changes automatically save to localStorage
4. UI re-renders to reflect changes (`ui.js`)
5. Preview updates with new Lua code (`exporter.js`)

## 🎨 Styling & Theming

### CSS Architecture
- **Component-based styling** - Each UI component has dedicated styles
- **Responsive design** - Grid layout adapts to screen sizes
- **Dark/Light themes** - Sidebar uses dark theme, editor uses light
- **Consistent spacing** - Unified padding and margin system

### Syntax Highlighting
- **Prism.js integration** - Professional code highlighting
- **Tomorrow theme** - Dark background with colorful syntax
- **Line numbers** - Easy code reference
- **Copy functionality** - Built-in clipboard support

## 💾 Data Persistence

### Local Storage
- **Automatic saving** - Every change is immediately persisted
- **State restoration** - Application state restored on page load
- **Error handling** - Graceful fallbacks for storage failures
- **JSON serialization** - Efficient data storage format

### Data Structure
```javascript
{
  objects: [],           // Array of LAM objects
  panelData: {},        // Panel configuration
  editPanelData: false, // Panel editing state
  timestamp: 1234567890 // Last save time
}
```

## 🔧 Development

### Prerequisites
- Modern web browser with ES6+ support
- Local web server (optional, for development)

### File Organization
- **Separation of concerns** - Each file has a single responsibility
- **Dependency management** - Clear load order in HTML
- **Modular functions** - Reusable, testable code blocks
- **Consistent naming** - Clear, descriptive function names

### Adding New Features
1. **New LAM Object Types** - Add to `objects.js` and `templates.js`
2. **UI Enhancements** - Modify `ui.js` and `css/styles.css`
3. **Export Features** - Extend `exporter.js` functionality
4. **Event Handling** - Add new interactions in `events.js`

## 📋 LAM Object Reference

### Panel Data
```lua
local panelData = {
    type = "panel",
    name = "MyAddon",
    displayName = "My Addon Settings",
    author = "AuthorName",
    version = "1.0",
    slashCommand = "/myaddon",
    registerForRefresh = true,
    registerForDefaults = true,
}
```

### Common Object Properties
- **type** - Object type (header, checkbox, slider, etc.)
- **name** - Display name for the control
- **tooltip** - Hover text description
- **width** - Layout width ("full" or "half")
- **getFunc** - Function to retrieve current value
- **setFunc** - Function to save new value

## 🤝 Contributing

### Code Style
- Use consistent indentation (2 spaces)
- Add JSDoc comments for functions
- Follow existing naming conventions
- Test changes across different browsers

### Pull Requests
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **LibAddonMenu 2** - The ESO addon framework this builder supports
- **Prism.js** - Syntax highlighting library
- **Elder Scrolls Online** - The game that inspired this tool
- **Kiro AI** - Development assistance and code generation

## 📞 Support

- **Issues** - Report bugs via GitHub Issues
- **Documentation** - Check the ESO addon development guides
- **Community** - Join ESO addon development Discord servers

---

**Made with ❤️ and 👻 [Kiro](https://kiro.dev)**
Web app for builden a LibAddonMenu2 for ESO.
