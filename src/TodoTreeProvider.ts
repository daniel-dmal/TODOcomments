import * as vscode from "vscode";

class TodoTreeProvider implements vscode.TreeDataProvider<TodoItem | FileItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    TodoItem | FileItem | undefined | void
  > = new vscode.EventEmitter();
  readonly onDidChangeTreeData: vscode.Event<
    TodoItem | FileItem | undefined | void
  > = this._onDidChangeTreeData.event;

  private todos: TodoItem[] = [];

  constructor(private context: vscode.ExtensionContext) {
    this.loadTodos();
  }

  refresh(): void {
    this.loadTodos();
    this._onDidChangeTreeData.fire();
  }

  async loadTodos() {
    this.todos = this.context.workspaceState.get("todos") || [];
  }

  getTreeItem(element: TodoItem | FileItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: FileItem): Thenable<(TodoItem | FileItem)[]> {
    if (!element) {
      // **Group TODOs by file**
      const grouped = this.groupTodosByFile();
      return Promise.resolve(grouped);
    } else {
      // **Return TODOs for the selected file**
      const todosForFile = this.todos
        .filter((todo) => todo.file === element.file)
        .map((todo) => new TodoItem(todo.file, todo.line, todo.text)); // Convert into TodoItem instances

      return Promise.resolve(todosForFile);
    }
  }

  private groupTodosByFile(): FileItem[] {
    const files = new Map<string, TodoItem[]>();

    this.todos.forEach((todo) => {
      if (!files.has(todo.file)) {
        files.set(todo.file, []);
      }
      files.get(todo.file)?.push(todo);
    });

    return Array.from(files.entries()).map(
      ([file, todos]) => new FileItem(file, todos)
    );
  }
}

class FileItem extends vscode.TreeItem {
  constructor(public file: string, public todos: TodoItem[]) {
    // Convert absolute path to relative
    const relativePath = vscode.workspace.asRelativePath(file);
    super(relativePath, vscode.TreeItemCollapsibleState.Collapsed);

    this.tooltip = `File: ${file}`;
    this.iconPath = new vscode.ThemeIcon("file-code"); // 📄 File icon
    this.iconPath = new vscode.ThemeIcon(
      "file-code",
      new vscode.ThemeColor("editor.primaryForegroundColor")
    );

    // Assign different colors (Fake example using descriptions)
    this.description = `📄 ${relativePath}`;
  }
}

class TodoItem extends vscode.TreeItem {
  constructor(public file: string, public line: number, public text: string) {
    super(text, vscode.TreeItemCollapsibleState.None);

    this.tooltip = `TODO: ${text} (Line ${line})`;
    this.description = `✅ Line ${line}`;

    this.command = {
      command: "extension.openTodo",
      title: "Open TODO",
      arguments: [this.file, this.line],
    };

    // Assign different icons based on priority (example)
    if (text.includes("FIXME")) {
      this.iconPath = new vscode.ThemeIcon("alert"); // 🚨 Alert for urgent issues
    } else {
      this.iconPath = new vscode.ThemeIcon("checklist"); // ✅ Normal TODOs
    }
  }
}

export default TodoTreeProvider;
export { TodoItem };
