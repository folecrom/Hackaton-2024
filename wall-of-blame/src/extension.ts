import * as vscode from 'vscode';
import { getContributorsCommand, getGitContributors } from './getContributors';

export function activate(context: vscode.ExtensionContext) {
  const contributorCommand = getContributorsCommand(context);

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders) {
    const rootPath = workspaceFolders[0].uri.fsPath;
    let contributor = getGitContributors(rootPath);
  } else {
    vscode.window.showErrorMessage('Aucun dossier de projet ouvert.');
  }

  let blameDisposable = vscode.commands.registerCommand('extension.blame', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const lineNumber = editor.selection.active.line + 1;
      const filePath = editor.document.fileName;
      vscode.window.showInformationMessage(`Blame for line ${lineNumber} in file ${filePath}`);
    }
  });

  context.subscriptions.push(blameDisposable);
  context.subscriptions.push(contributorCommand);
}

export function deactivate() {}
