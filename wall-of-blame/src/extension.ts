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

  context.subscriptions.push(contributorCommand);
}

export function deactivate() {}
