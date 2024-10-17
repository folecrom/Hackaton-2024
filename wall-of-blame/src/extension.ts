import * as vscode from 'vscode';
import { getContributorsCommand, getGitContributors } from './getContributors';

// Fonction pour récupérer les scores des contributeurs depuis l'état global
function getContributorScores(context: vscode.ExtensionContext): Map<string, number> {
  const storedScores = context.globalState.get<{ [key: string]: number }>('contributorScores');
  return storedScores ? new Map(Object.entries(storedScores)) : new Map();
}

// Fonction pour mettre à jour les scores des contributeurs dans l'état global
function updateContributorScores(context: vscode.ExtensionContext, scores: Map<string, number>) {
  const objectifiedScores = Object.fromEntries(scores); // Convertir la Map en objet simple
  context.globalState.update('contributorScores', objectifiedScores);
}

export async function activate(context: vscode.ExtensionContext) { // Ajout du mot clé async
  const contributorCommand = getContributorsCommand(context);

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders) {
    const rootPath = workspaceFolders[0].uri.fsPath;
    console.log(1);
    
    try {
      // Utilisation d'await pour attendre la récupération des contributeurs
      let contributors = await getGitContributors(rootPath); // Récupérer les contributeurs du projet
      console.log("Contributors:", contributors);
      
      if (!contributors || contributors.length === 0) {
        console.error("Aucun contributeur trouvé !");
        vscode.window.showErrorMessage("Aucun contributeur trouvé.");
        return;
      }

      let scores = getContributorScores(context); // Récupérer les scores enregistrés
      console.log(2);

      let blameDisposable = vscode.commands.registerCommand('extension.blame', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
          const lineNumber = editor.selection.active.line + 1;
          const filePath = editor.document.fileName;
          vscode.window.showInformationMessage(`Blame for line ${lineNumber} in file ${filePath}`);
          console.log(3.1);
          
          // Sélectionner un contributeur
          const selectedContributor = await vscode.window.showQuickPick(contributors, {
            placeHolder: 'Sélectionnez un contributeur à blâmer',
          });
          console.log(3);

          if (selectedContributor) {
            // Incrémenter le score du contributeur sélectionné
            const currentScore = scores.get(selectedContributor) || 0;
            scores.set(selectedContributor, currentScore + 1);
            console.log(4);
            
            // Stocker les scores mis à jour
            updateContributorScores(context, scores);
            console.log(5);
            
            // Afficher une notification pour confirmer l'ajout de point
            console.log(6);
            vscode.window.showInformationMessage(
              `${selectedContributor} a maintenant ${scores.get(selectedContributor)} point(s) de faute.`
            );
          }
        }
      });

      context.subscriptions.push(blameDisposable);
      context.subscriptions.push(contributorCommand);

    } catch (error) {
      console.error("Erreur lors de la récupération des contributeurs:", error);
      vscode.window.showErrorMessage('Erreur lors de la récupération des contributeurs.');
    }

  } else {
    vscode.window.showErrorMessage('Aucun dossier de projet ouvert.');
  }
}

export function deactivate() {}
