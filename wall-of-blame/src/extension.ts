import * as vscode from "vscode";
import { getContributorsCommand, getGitContributors } from "./getContributors";
import fs from "fs";
import path from "path";
import { ContribNodeProvider, ContributorNode } from './views';
interface Contributor {
  points: number;
  lines: [
    {
      filename: string;
      lineNumber: number;
    }
  ];
}

interface BlameData {
  [key: string]: Contributor;
}



export async function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (editor) {
      executeOnFileChange(editor);
    }
  });

  const hoverProvider = vscode.languages.registerHoverProvider("*", {
    provideHover(document, position) {
      const filePath = document.uri.fsPath;

      // Obtenir le chemin absolu du dossier racine du workspace
      const workspacePath = vscode.workspace.workspaceFolders![0].uri.fsPath;

      // Calculer le chemin relatif
      const relativePath = path.relative(workspacePath, filePath);
      const lineNumber = position.line + 1;

      return getHoverInformation(relativePath || "", lineNumber);
    },
  });

  context.subscriptions.push(disposable);
  context.subscriptions.push(hoverProvider);

  createUnblameCommand(context);
  // Ajout du mot clé async
  const contributorCommand = getContributorsCommand(context);

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders) {
    const rootPath = workspaceFolders[0].uri.fsPath;

    try {
      // Utilisation d'await pour attendre la récupération des contributeurs
      let contributors = await getGitContributors(rootPath); // Récupérer les contributeurs du projet
      console.log("Contributors:", contributors);

      if (!contributors || contributors.length === 0) {
        console.error("Aucun contributeur trouvé !");
        vscode.window.showErrorMessage("Aucun contributeur trouvé.");
        return;
      }

      let blameDisposable = vscode.commands.registerCommand(
        "extension.blame",
        async () => {
          const editor = vscode.window.activeTextEditor;
          const filePath = editor!.document.uri.fsPath;
          // Obtenir le chemin absolu du dossier racine du workspace
          const workspacePath = workspaceFolders[0].uri.fsPath;
          if (editor) {
            const lineNumber = editor.selection.active.line + 1;
            const current_file = path.relative(workspacePath, filePath);
;
            vscode.window.showInformationMessage(
              `Blame for line ${lineNumber} in file ${current_file}`
            );
            console.log(editor.document.uri.fsPath);

            // Sélectionner un contributeur
            const selectedContributor =
              await vscode.window.showQuickPick(contributors, {
                placeHolder:
                  "Sélectionnez un contributeur à blâmer",
              });
            console.log(3);

            if (selectedContributor) {
              const filePath = path.join(rootPath, "blame.json");

              let blameData: BlameData = {};

              // Vérifiez si le fichier existe déjà
              if (fs.existsSync(filePath)) {
                const fileContent = fs.readFileSync(
                  filePath,
                  "utf-8"
                );
                blameData = JSON.parse(fileContent);
              }
              if (blameData[selectedContributor]) {
                blameData[selectedContributor].points += 1;
                blameData[selectedContributor].lines.push({
                  filename: current_file,
                  lineNumber: lineNumber,
                });
              } else {
                blameData[selectedContributor] = {
                  points: 1,
                  lines: [
                    {
                      filename: current_file,
                      lineNumber: lineNumber,
                    },
                  ],
                };
              }

              fs.writeFileSync(
                filePath,
                JSON.stringify(blameData, null, 4),
                "utf-8"
              );
              vscode.window.showInformationMessage(
                `${selectedContributor} a maintenant ${blameData[selectedContributor].points} points`
              );
              executeOnFileChange(editor);
            }
          }
        }
        
      );
      const nodeContributorsProvider = new ContribNodeProvider(rootPath);
      vscode.window.registerTreeDataProvider('nodeContributors', nodeContributorsProvider);
      vscode.commands.registerCommand('nodeContributors.refreshEntry', () => nodeContributorsProvider.refresh());
      vscode.commands.registerCommand('nodeContributors.addEntry', () => vscode.window.showInformationMessage(`Successfully called add entry.`));
      vscode.commands.registerCommand('nodeContributors.editEntry', (node: ContributorNode) => vscode.window.showInformationMessage(`Successfully called edit entry on ${node.label}.`));
      vscode.commands.registerCommand('nodeContributors.deleteEntry', (node: ContributorNode) => vscode.window.showInformationMessage(`Successfully called delete entry on ${node.label}.`));
  
      context.subscriptions.push(blameDisposable);
      context.subscriptions.push(contributorCommand);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des contributeurs:",
        error
      );
      vscode.window.showErrorMessage(
        "Erreur lors de la récupération des contributeurs."
      );
    }
  } else {
    vscode.window.showErrorMessage("Aucun dossier de projet ouvert.");
  }
}

export function deactivate() { }

const executeOnFileChange = async (editor: vscode.TextEditor) => {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    vscode.window.showErrorMessage("Aucun dossier de projet ouvert.");
    return;
  }

  const rootPath = workspaceFolders[0].uri.fsPath;
  const filePath = editor!.document.uri.fsPath;
  // Obtenir le chemin absolu du dossier racine du workspace
  const workspacePath = workspaceFolders[0].uri.fsPath;
    const lineNumber = editor.selection.active.line + 1;
    const current_file = path.relative(workspacePath, filePath);

  const filePathJson = path.join(rootPath, "blame.json");

  // Initialiser les décorations
  let lineDecorations: any[] = [];

  if (fs.existsSync(filePathJson)) {
    const fileContent = fs.readFileSync(filePathJson, "utf-8");
    const blameData: BlameData = JSON.parse(fileContent);
    const linesToHighlight: number[] = []; // Tableau pour stocker les lignes à surligner

    // Extraire les lignes à partir des données de blame
    for (const contributor in blameData) {
      const contributorData = blameData[contributor];

      // Boucle à travers les lignes de chaque contributeur
      for (const line of contributorData.lines) {
        if (line.filename === current_file) {
          linesToHighlight.push(line.lineNumber); // Ajouter le numéro de ligne
        }
      }
    }
    // Effacer les anciennes décorations
    lineDecorations.forEach((decoration) => {
      editor.setDecorations(decoration.key, []);
    });
    lineDecorations = []; // Réinitialiser les décorations

    // Si des lignes à surligner ont été trouvées
    if (linesToHighlight.length > 0) {
      // Définir le type de décoration
      const decorationType = vscode.window.createTextEditorDecorationType(
        {
          backgroundColor: "rgba(255, 0, 0, 0.3)",
        }
      );

      // Créer des ranges pour chaque ligne à surligner
      const ranges = linesToHighlight.map(
        (line) => new vscode.Range(line - 1, 0, line - 0, 0)
      );

      // Appliquer les décorations aux lignes
      editor.setDecorations(decorationType, ranges);


      // Stocker la décoration pour un futur nettoyage
      lineDecorations.push({ key: decorationType });
    }
  }
};

const createUnblameCommand = (context: vscode.ExtensionContext) => {
  let disposable = vscode.commands.registerCommand('extension.unblame', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const lineNumber = editor.selection.active.line + 1; // Ligne actuelle
    const currentFile = editor.document.uri.fsPath.split(`${vscode.workspace.workspaceFolders![0].uri.fsPath}/`)[1]; // Chemin relatif

    const filePath = path.join(vscode.workspace.workspaceFolders![0].uri.fsPath, "blame.json");

    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const blameData: BlameData = JSON.parse(fileContent);

      for (const contributor in blameData) {
        const lines = blameData[contributor].lines;

        // Vérifiez que lines est un tableau avant de continuer
        if (Array.isArray(lines)) {
          // Vérifiez si la ligne à supprimer correspond à celle sélectionnée
          const lineIndex = lines.findIndex(line => line.filename === currentFile && line.lineNumber === lineNumber);

          if (lineIndex !== -1) {
            lines.splice(lineIndex, 1); // Supprimer la ligne

            // Si aucune ligne n'est laissée pour ce contributeur, supprimer le contributeur
            if (!lines.length) {
              delete blameData[contributor];
            }

            // Écrire à nouveau le fichier blame.json
            fs.writeFileSync(filePath, JSON.stringify(blameData, null, 4), "utf-8");
            vscode.window.showInformationMessage(`Unblame effectué pour la ligne ${lineNumber} dans ${currentFile}`);

            vscode.commands.executeCommand("workbench.action.reloadWindow"); // Recharger la fenêtre
            return;
          }
        }
      }
      vscode.window.showErrorMessage("Aucun blame trouvé pour cette ligne.");
    } else {
      vscode.window.showErrorMessage("Le fichier blame.json n'existe pas.");
    }
  });

  context.subscriptions.push(disposable);
};


function getHoverInformation(fileName: string, lineNumber: number): vscode.Hover | undefined {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    return undefined;
  }

  const rootPath = workspaceFolders[0].uri.fsPath;
  const filePath = path.join(rootPath, "blame.json");

  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const blameData: BlameData = JSON.parse(fileContent);

    for (const contributor in blameData) {
      const contributorData = blameData[contributor];

      for (const line of contributorData.lines) {
        if (line.filename === fileName && line.lineNumber === lineNumber) {
          // Créer le contenu du tooltip
          const tooltip = `${contributor} a été blame sur cette ligne.`;
          return new vscode.Hover(tooltip);
        }
      }
    }
  }
  return undefined; // Aucune information disponible
}
