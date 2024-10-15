import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  
  // Main "Blame" command
  let blameDisposable = vscode.commands.registerCommand('extension.blame', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const lineNumber = editor.selection.active.line + 1;
      const filePath = editor.document.fileName;
      vscode.window.showInformationMessage(`Blame for line ${lineNumber} in file ${filePath}`);
    }
  });

  // Subcommand: "Contributor"
  let viewDetailsDisposable = vscode.commands.registerCommand('extension.viewBlameDetails', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const lineNumber = editor.selection.active.line + 1;
      vscode.window.showInformationMessage(`Viewing blame details for line ${lineNumber}`);
    }
  });


  // Register the disposables
  context.subscriptions.push(blameDisposable);
  context.subscriptions.push(viewDetailsDisposable);
}

export function deactivate() {}
