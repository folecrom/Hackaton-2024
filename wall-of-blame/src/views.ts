import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { getGitContributors } from './getContributors';

export class ContribNodeProvider implements vscode.TreeDataProvider<Contributor> {

	private _onDidChangeTreeData: vscode.EventEmitter<Contributor | undefined | void> = new vscode.EventEmitter<Contributor | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<Contributor | undefined | void> = this._onDidChangeTreeData.event;

	constructor(private workspaceRoot: string | undefined) {
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: Contributor): vscode.TreeItem {
		return element;
	}

	getChildren(element?: Contributor): Thenable<Contributor[]> {
		if (!this.workspaceRoot) {
			vscode.window.showInformationMessage('No Contributor in empty workspace');
			return Promise.resolve([]);
		}
		
		const blameJsonPath = path.join(this.workspaceRoot, 'blame.json');
		if (this.pathExists(blameJsonPath)) {
			return Promise.resolve(this.getContributorsLinesPoints(blameJsonPath));
		} else {
			vscode.window.showInformationMessage('Workspace has no blame.json');
			return Promise.resolve([]);
		}

	}

	/**
	 * Given the path to package.json, read all its dependencies and devDependencies.
	 */
	private getContributorsLinesPoints(packageJsonPath: string): Contributor[] {
		const workspaceRoot = this.workspaceRoot;
		if (this.pathExists(packageJsonPath) && workspaceRoot) {
			// Parse the JSON file and cast it to the correct type
			let packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8')) as PackageJson;
			let contributorTree: Contributor[] = [];
	
			// Iterate over the contributors in the packageJson object
			for (let [contributorName, contributorInfo] of Object.entries(packageJson)) {
				const points = contributorInfo.points;
				const lines = contributorInfo.lines;
	
				// Add the main contributor node with points
				contributorTree.push(new Contributor(contributorName, points, vscode.TreeItemCollapsibleState.Collapsed));
	
				// Check if 'lines' is an array and iterate over it
				if (Array.isArray(lines)) {
					for (let line of lines) {
						// Add each line with filename and line number
						contributorTree.push(new Contributor(`${line.filename} (line ${line.lineNumber})`, null, vscode.TreeItemCollapsibleState.None));
					}
				} else {
					console.warn(`'lines' for ${contributorName} is not an array or is null.`);
				}
			}
	
			return contributorTree;
		} else {
			return [];
		}
	}
	

	private pathExists(p: string): boolean {
		try {
			fs.accessSync(p);
		} catch (err) {
			return false;
		}

		return true;
	}
}

export class Contributor extends vscode.TreeItem {

	constructor(
		public readonly name: string,
		private readonly points: number | null,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
	) {
		super(name, collapsibleState);

		this.tooltip = `${this.name}-${this.points}`;
		this.description = this.name;
	}

	iconPath = {
		light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
		dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
	};

	contextValue = 'dependency';
}

// Représente une ligne dans un fichier
interface Line {
    filename: string;
    lineNumber: number;
}

// Représente un contributeur avec ses points et ses lignes modifiées
interface ContributorInfo {
    points: number;
    lines: Line[];
}

// Représente la structure globale avec des contributeurs comme clés
interface PackageJson {
    [contributorName: string]: ContributorInfo;
}
