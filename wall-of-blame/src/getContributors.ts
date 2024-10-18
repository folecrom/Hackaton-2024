import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as util from 'util';

const execPromise = util.promisify(exec); // Promisify exec pour faciliter l'utilisation avec async/await

// Commande pour récupérer les contributeurs Git et les afficher dans une liste déroulante
export function getContributorsCommand(context: vscode.ExtensionContext) {
    return vscode.commands.registerCommand('extension.showGitContributors', async () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
    
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('Aucun dossier de projet ouvert.');
            return;
        }

        const rootPath = workspaceFolders[0].uri.fsPath;

        try {
            const uniqueContributors = await getGitContributors(rootPath);
            
            if (uniqueContributors.length === 0) {
                vscode.window.showInformationMessage('Aucun contributeur trouvé.');
            } else {
                // Affiche les contributeurs dans une liste déroulante
                const selectedContributor = await vscode.window.showQuickPick(uniqueContributors, {
                    placeHolder: 'Sélectionnez un contributeur',
                });

                if (selectedContributor) {
                    vscode.window.showInformationMessage(`Vous avez sélectionné : ${selectedContributor}`);
                }
            }
        } catch (error : any) {
            vscode.window.showErrorMessage(`Erreur lors de la récupération des contributeurs Git: ${error.message}`);
        }
    });
}

// Fonction pour récupérer les contributeurs Git
export async function getGitContributors(rootPath: string): Promise<string[]> {
    const gitCommand = "git log --format='%aN'"; // Commande Git pour récupérer les noms des auteurs

    try {
        const { stdout } = await execPromise(gitCommand, { cwd: rootPath });
        
        // Supprimer les doublons en utilisant Set et trier les contributeurs
        const contributors = stdout.trim().split('\n').filter(Boolean);
        const uniqueContributors = Array.from(new Set(contributors));
        
        return uniqueContributors;
    } catch (error : any) {
        throw new Error(`Erreur lors de l'exécution de la commande Git: ${error.message}`);
    }
}

export function deactivate() {}
