# TODO Highlighter & Viewer Extension

A simple VS Code extension that highlights `TODO:` and `FIXME:` comments in your code, making them more visible and easier to track.

## Features

- Highlights `TODO:` comments in **orange** with a light yellow background.
- Groups TODOs by file in the Tree View panel.
- Automatically applies highlighting on startup and when switching files.

## Usage

- Open any file with `TODO:` or `FIXME:` comments.
- The comments will be highlighted automatically.
- Open the **TODO Tree View** from the VS Code sidebar to see all TODOs grouped by file.

## Commands

| Command                     | Description                                     |
| --------------------------- | ----------------------------------------------- |
| `extension.highlightTodos`  | Highlights TODOs and FIXMEs in the active file. |
| `extension.refreshTodoTree` | Refreshes the TODO Tree View.                   |

## How It Works

- **Text Decorations:** The extension scans the open file for `TODO:` and `FIXME:` comments and applies text decorations.
- **Tree View:** It groups all TODOs by file and displays them in a collapsible tree view.
- **Automatic Updates:** Highlights are applied when a file is opened, switched, or modified.

## Roadmap

- [ ] Add support for custom comment tags (e.g., `NOTE:`)
- [ ] Allow users to configure colors in settings
- [ ] Display TODO counts in the status bar

## License

This extension is licensed under the MIT License.

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.
