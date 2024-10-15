import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';
import * as util from 'util';

const execPromise = util.promisify(exec);

// Fonction pour vérifier si un dossier contient un dépôt Git
async function findGitRepo(startPath: string): Promise<string | null> {
    let currentPath = startPath;

    while (currentPath) {
        const gitFolderPath = path.join(currentPath, '.git');
        if (fs.existsSync(gitFolderPath)) {
            return currentPath; // Retourner le chemin du dépôt Git trouvé
        }

        const parentPath = path.dirname(currentPath);
        if (parentPath === currentPath) {
            break; // Sortir de la boucle si nous atteignons le niveau racine
        }

        currentPath = parentPath; // Mettre à jour le chemin pour le dossier parent
    }

    return null; // Aucun dépôt Git trouvé
}

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('wall-of-blame.helloWorld', async () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;

        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage('No workspace is opened. Please open a folder to use this extension.');
            return;
        }

        const rootPath = workspaceFolders[0].uri.fsPath; // Prendre le chemin du dossier racine du projet
        const gitRepoPath = await findGitRepo(rootPath); // Chercher le dossier Git dans le projet

        if (!gitRepoPath) {
            vscode.window.showInformationMessage('.git folder not found in the project root or parent directories.');
            return; // Sortir si aucun dépôt Git trouvé
        }

        vscode.window.showInformationMessage(`.git folder found at: ${gitRepoPath}`);

        // Récupérer les contributeurs si le dépôt est trouvé
        try {
			console.log(`1`);
            const result = await execPromise('git version', { cwd: gitRepoPath,});
			console.log(`Git version result:\n${result.stdout}`);
 			// Exécuter la commande dans le dossier du dépôt
			console.log(`2`);
            // Vérifier si le résultat a du contenu
            if (result.stdout.trim()) {
				console.log(`3`);
                // Afficher les contributeurs dans une notification
                vscode.window.showInformationMessage(`Contributors:\n${result.stdout}`);
            } else {
                vscode.window.showInformationMessage('No contributors found in this Git repository.');
            }
        } catch (error) {
            vscode.window.showErrorMessage('Failed to get Git contributors');
            console.error(error);
        }
    });

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
