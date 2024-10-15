import * as vscode from 'vscode';
import { exec } from 'child_process';

export function getContributorsCommand(context: vscode.ExtensionContext) {
    return vscode.commands.registerCommand('extension.showGitContributors', () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
    
        if (workspaceFolders) {
          const rootPath = workspaceFolders[0].uri.fsPath;
    
          // Commande Git pour obtenir uniquement les noms des contributeurs
          const gitCommand = "git log --format='%aN'";
    
          exec(gitCommand, { cwd: rootPath }, (error, stdout, stderr) => {
            if (error) {
              vscode.window.showErrorMessage(`Erreur lors de l'ex�cution de la commande Git: ${error.message}`);
              console.error(`Erreur lors de l'ex�cution de la commande Git : ${error.message}`);
              return;
            }
    
            if (stderr) {
              vscode.window.showErrorMessage(`Erreur: ${stderr}`);
              console.error(`Erreur stderr: ${stderr}`);
              return;
            }
    
            // Traiter la sortie
            const contributors = stdout.trim().split('\n');
            // Supprimer les doublons
            const uniqueContributors = getGitContributors(rootPath);
            
            if (uniqueContributors.length === 0) {
              vscode.window.showInformationMessage('Aucun contributeur trouv�.');
            } else {
              // Affiche les contributeurs dans une fen�tre d'information
              const contributorList = uniqueContributors.join('\n'); // S�pare les noms par des nouvelles lignes
              vscode.window.showInformationMessage(`Contributeurs du projet :\n${contributorList}`);
            }
          });
        } else {
          vscode.window.showErrorMessage('Aucun dossier de projet ouvert.');
        }
      });
}

export function getGitContributors(rootPath: string) : any[] {
  const gitCommand = "git log --format='%aN'";

  let contributors = null;

  exec(gitCommand, { cwd: rootPath }, (error, stdout, stderr) => {
    if (error) {
      showErrorMessage(`Erreur lors de l'ex�cution de la commande Git: ${error.message}`);
      return;
    }

    if (stderr) {
      showErrorMessage(`Erreur: ${stderr}`);
      return;
    }

    contributors = stdout.trim().split('\n');
  });

  return Array.from(new Set(contributors));
}

function showErrorMessage(message: string) {
  vscode.window.showErrorMessage(message);
}

export function deactivate() {}
