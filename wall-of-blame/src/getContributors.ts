import * as vscode from 'vscode';
import { exec } from 'child_process';

export function getContributors(context: vscode.ExtensionContext) {
    return vscode.commands.registerCommand('extension.showGitContributors', () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
    
        if (workspaceFolders) {
          const rootPath = workspaceFolders[0].uri.fsPath;
    
          // Commande Git pour obtenir uniquement les noms des contributeurs
          const gitCommand = "git log --format='%aN'";
    
          exec(gitCommand, { cwd: rootPath }, (error, stdout, stderr) => {
            if (error) {
              vscode.window.showErrorMessage(`Erreur lors de l'exécution de la commande Git: ${error.message}`);
              console.error(`Erreur lors de l'exécution de la commande Git : ${error.message}`);
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
            const uniqueContributors = Array.from(new Set(contributors));
            
            if (uniqueContributors.length === 0) {
              vscode.window.showInformationMessage('Aucun contributeur trouvé.');
            } else {
              // Affiche les contributeurs dans une fenêtre d'information
              const contributorList = uniqueContributors.join('\n'); // Sépare les noms par des nouvelles lignes
              vscode.window.showInformationMessage(`Contributeurs du projet :\n${contributorList}`);
            }
          });
        } else {
          vscode.window.showErrorMessage('Aucun dossier de projet ouvert.');
        }
      });
}