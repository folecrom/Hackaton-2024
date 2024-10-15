import * as vscode from 'vscode';
import { exec } from 'child_process';
import { getContributors } from './getContributors';

export function activate(context: vscode.ExtensionContext) {
  let contributor = getContributors(context);

  context.subscriptions.push(contributor);
}

export function deactivate() {}
