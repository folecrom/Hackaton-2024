import * as vscode from "vscode";
import { getContributorsCommand, getGitContributors } from "./getContributors";
import fs from "fs";
import path from "path";

interface Contributor {
  points: number;
  lines: number[];
}

interface BlameData {
  [key: string]: Contributor; // Utilisation d'un indexeur pour permettre l'accès avec des chaînes
}

// Fonction pour récupérer les scores des contributeurs depuis l'état global
function getContributorScores(
    context: vscode.ExtensionContext
): Map<string, number> {
    const storedScores = context.globalState.get<{ [key: string]: number }>(
        "contributorScores"
    );
    return storedScores ? new Map(Object.entries(storedScores)) : new Map();
}

// Fonction pour mettre à jour les scores des contributeurs dans l'état global
function updateContributorScores(
    context: vscode.ExtensionContext,
    scores: Map<string, number>
) {
    const objectifiedScores = Object.fromEntries(scores); // Convertir la Map en objet simple
    context.globalState.update("contributorScores", objectifiedScores);
}

export async function activate(context: vscode.ExtensionContext) {
    // Ajout du mot clé async
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

            let blameDisposable = vscode.commands.registerCommand(
                "extension.blame",
                async () => {
                    const editor = vscode.window.activeTextEditor;
                    if (editor) {
                        const lineNumber = editor.selection.active.line + 1;
                        const filePath = editor.document.fileName;
                        vscode.window.showInformationMessage(
                            `Blame for line ${lineNumber} in file ${filePath}`
                        );
                        console.log(3.1);

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
                                blameData[selectedContributor].lines.push(lineNumber);
                            } else {
                                blameData[selectedContributor] = {
                                    points: 1,
                                    lines: [lineNumber],
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
                        }
                    }
                }
            );

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

export function deactivate() {}
