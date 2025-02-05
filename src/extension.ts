import * as vscode from "vscode";
import TodoTreeProvider, { TodoItem } from "./TodoTreeProvider";
import {
  scanAndUpdateTodos,
  updateTodoList,
  scanSingleFile,
  todoHighlights,
  openTodo,
} from "./commands";

export function activate(context: vscode.ExtensionContext) {
  const todoTreeProvider = new TodoTreeProvider(context);
  vscode.window.registerTreeDataProvider("todoTree", todoTreeProvider);

  scanAndUpdateTodos(context, todoTreeProvider); // Initial scan

  if (vscode.window.activeTextEditor) {
    // Highlight todos in the active editor
    vscode.commands.executeCommand("todocomments.hightlightTodos");
  }

  const saveListener = vscode.workspace.onDidSaveTextDocument(
    // Scan file on save
    async (document) => {
      const newTodos = await scanSingleFile(document);
      await updateTodoList(context, newTodos);
      todoTreeProvider.refresh();
    }
  );

  const onEditorChange = vscode.window.onDidChangeActiveTextEditor((editor) => {
    // Highlight todos in the active editor
    if (editor) {
      vscode.commands.executeCommand("todocomments.hightlightTodos");
    }
  });

  const disposable = vscode.commands.registerCommand(
    // Scan all files
    "todocomments.scanFiles",
    async () => {
      await scanAndUpdateTodos(context, todoTreeProvider);
    }
  );

  vscode.commands.registerCommand("extension.openTodo", openTodo); // Open todo in the active editor

  vscode.commands.registerCommand(
    // Highlight todos in the active editor
    "todocomments.hightlightTodos",
    todoHighlights
  );

  context.subscriptions.push(disposable, saveListener, onEditorChange);
}

export function deactivate() {}
