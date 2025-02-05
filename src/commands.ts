import * as vscode from "vscode";
import TodoTreeProvider, { TodoItem } from "./TodoTreeProvider";

const todoDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: "rgba(255, 255, 0, 0.2)",
  color: "#FFA500",
  fontWeight: "bold",
  border: "1px solid orange",
});

const todoHighlights = () => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const text = editor.document.getText();
  const todoMatches: vscode.DecorationOptions[] = [];

  const regexTodo = /TODO: (.*)/g;

  let match;
  while ((match = regexTodo.exec(text))) {
    const startPos = editor.document.positionAt(match.index);
    const endPos = editor.document.positionAt(match.index + match[0].length);
    todoMatches.push({ range: new vscode.Range(startPos, endPos) });
  }

  editor.setDecorations(todoDecoration, todoMatches);
};

const openTodo = async (file: string, line: number) => {
  const doc = await vscode.workspace.openTextDocument(file);
  const editor = await vscode.window.showTextDocument(doc);

  const position = new vscode.Position(line - 1, 0);
  editor.selection = new vscode.Selection(position, position);
  editor.revealRange(new vscode.Range(position, position));
};

async function scanFiles() {
  const files = await vscode.workspace.findFiles(
    "**/*.{js,ts,py,html,jsx,tsx,astro}",
    "**/node_modules/**"
  );
  let todos: { file: string; line: number; text: string }[] = [];

  for (const file of files) {
    const doc = await vscode.workspace.openTextDocument(file);
    const lines = doc.getText().split("\n");

    lines.forEach((line, index) => {
      const match = line.match(/(\/\/|#|<!--)\s*TODO:(.*)/i);
      if (match) {
        todos.push({
          file: file.fsPath,
          line: index + 1,
          text: match[2].trim(),
        });
      }
    });
  }
  return todos;
}

const scanAndUpdateTodos = async (
  context: vscode.ExtensionContext,
  todoProvider: TodoTreeProvider
) => {
  const todos = await scanFiles();
  await context.workspaceState.update("todos", todos);
  todoProvider.refresh();
};

const updateTodoList = async (
  context: vscode.ExtensionContext,
  newTodos: TodoItem[]
) => {
  let todos: TodoItem[] = context.workspaceState.get("todos") || [];

  todos = todos.filter(
    (todo) => !newTodos.some((newTodo) => newTodo.file === todo.file)
  );

  todos = [...todos, ...newTodos];

  await context.workspaceState.update("todos", todos);
};

const scanSingleFile = async (
  document: vscode.TextDocument
): Promise<TodoItem[]> => {
  const todos: TodoItem[] = [];
  const text = document.getText();
  const filePath = document.uri.fsPath;

  const lines = text.split("\n");
  lines.forEach((line, index) => {
    const match = line.match(/(\/\/|#|<!--)\s*TODO:(.*)/i);
    if (match) {
      todos.push(new TodoItem(filePath, index + 1, match[2].trim()));
    }
  });

  return todos;
};

export {
  scanFiles,
  scanAndUpdateTodos,
  updateTodoList,
  scanSingleFile,
  todoHighlights,
  openTodo,
};
