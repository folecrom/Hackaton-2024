import * as vscode from 'vscode';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('extension.showGitContributors', () => {
    // Récupérer le dossier racine du projet ouvert
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders) {
      const rootPath = workspaceFolders[0].uri.fsPath;
      
      // Commande Git pour obtenir les contributeurs
      const gitCommand = 'git shortlog -s -n';
      
      // Exécuter la commande Git dans le répertoire du projet
      exec(gitCommand, { cwd: rootPath }, (error, stdout, stderr) => {
        if (error) {
          vscode.window.showErrorMessage(`Erreur lors de l'exécution de la commande Git: ${error.message}`);
          return;
        }
        
        if (stderr) {
          vscode.window.showErrorMessage(`Erreur: ${stderr}`);
          return;
        }
        
        // Afficher les contributeurs dans VS Code
        vscode.window.showInformationMessage(`Contributeurs du projet :\n${stdout}`);
      });
    } else {
      vscode.window.showErrorMessage('Aucun projet ouvert.');
    }
  });

  context.subscriptions.push(disposable);
  console.log(disposable);
}

export function deactivate() {}
