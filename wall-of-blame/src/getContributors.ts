import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export function getContributorsCommand(context: vscode.ExtensionContext): any {
  return vscode.commands.registerCommand('extension.showGitContributors', async () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (workspaceFolders) {
      const rootPath = workspaceFolders[0].uri.fsPath;

      // Commande Git pour obtenir uniquement les noms des contributeurs
      const gitCommand = "git log --format='%aN'";

      try {
        // Exécution de la commande Git en utilisant des promesses
        const { stdout, stderr } = await execPromise(gitCommand, { cwd: rootPath });

        // Vérification des erreurs standard
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
      } catch (error) {
        // Affichage détaillé de l'erreur
        vscode.window.showErrorMessage(`Erreur lors de l'exécution de la commande Git: ${error.message}`);
        console.error(`Erreur lors de l'exécution de la commande Git : ${error.message}`);
      }
    } else {
      vscode.window.showErrorMessage('Aucun dossier de projet ouvert.');
    }
  });
}

export async function getGitContributors(rootPath: string) {
  const gitCommand = "git log --format='%aN'";

  try {
    const { stdout, stderr } = await execPromise(gitCommand, { cwd: rootPath });
    // Traiter la sortie
    const contributors = stdout.trim().split('\n');
    // Supprimer les doublons
    return Array.from(new Set(contributors));
  } catch (error) {
    // Affichage détaillé de l'erreur
    vscode.window.showErrorMessage(`Erreur lors de l'exécution de la commande Git: ${error.message}`);
    console.error(`Erreur lors de l'exécution de la commande Git : ${error.message}`);
  }

}

export function deactivate() {}
