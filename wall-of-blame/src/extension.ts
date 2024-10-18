import * as vscode from 'vscode';
import { getContributorsCommand, getGitContributors } from './getContributors';
import { ContribNodeProvider, Contributor } from './views';

export function activate(context: vscode.ExtensionContext) {
  const contributorCommand = getContributorsCommand(context);
  const rootPath = 
  vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
    ? vscode.workspace.workspaceFolders[0].uri.fsPath
    : undefined;  

  if (rootPath) {
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

	// Samples of `window.registerTreeDataProvider`
	const nodeContributorsProvider = new ContribNodeProvider(rootPath);
	vscode.window.registerTreeDataProvider('nodeContributors', nodeContributorsProvider);
	vscode.commands.registerCommand('nodeContributors.refreshEntry', () => nodeContributorsProvider.refresh());
	vscode.commands.registerCommand('nodeContributors.addEntry', () => vscode.window.showInformationMessage(`Successfully called add entry.`));
	vscode.commands.registerCommand('nodeContributors.editEntry', (node: Contributor) => vscode.window.showInformationMessage(`Successfully called edit entry on ${node.label}.`));
	vscode.commands.registerCommand('nodeContributors.deleteEntry', (node: Contributor) => vscode.window.showInformationMessage(`Successfully called delete entry on ${node.label}.`));


  context.subscriptions.push(blameDisposable);
  context.subscriptions.push(contributorCommand);
}

export function deactivate() {}
