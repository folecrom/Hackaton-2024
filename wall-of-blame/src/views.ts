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
		if (element) {
			const blameJsonPath = path.join(this.workspaceRoot, 'blame.json');
			if (this.pathExists(blameJsonPath)) {
				return Promise.resolve(this.getContributorsLinesPoints(blameJsonPath, element));
			} else {
				vscode.window.showInformationMessage('Workspace has no blame.json');
				return Promise.resolve([]);
			}
		} else {
			const blameJsonPath = path.join(this.workspaceRoot, 'blame.json');
			if (this.pathExists(blameJsonPath)) {
				return Promise.resolve(this.getContributorsLinesPoints(blameJsonPath));
			} else {
				vscode.window.showInformationMessage('Workspace has no blame.json');
				return Promise.resolve([]);
			}
		}

	}

	/**
	 * Given the path to package.json, read all its dependencies and devDependencies.
	 */
	private getContributorsLinesPoints(packageJsonPath: string, element?: Contributor): Contributor[] {
		const workspaceRoot = this.workspaceRoot;
		if (this.pathExists(packageJsonPath) && workspaceRoot) {
			// Parse the JSON file and cast it to the correct type
			let packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8')) as PackageJson;
			let contributorTree: Contributor[] = [];
	
			// Iterate over the contributors in the packageJson object
			for (let [contributorName, contributorInfo] of Object.entries(packageJson)) {
				const points = contributorInfo.points;
				const lines = contributorInfo.lines;
	
				// Create an array to hold the line nodes (children of the contributor)
				const lineNodes: Contributor[] = [];
				// Create the main contributor node (collapsible)

				if (!element) {
					const contributorNode = new Contributor(contributorName, points, vscode.TreeItemCollapsibleState.Collapsed);
					contributorTree.push(contributorNode);
				}
	
				if (element && element.name == contributorName) {
					for (let line of lines) {
						// Create a node for each line with filename and line number
						const contributorNode = new Contributor(`${line.filename} (line ${line.lineNumber})`, null, vscode.TreeItemCollapsibleState.None);  // Add the line to the list of children
						contributorTree.push(contributorNode);
					}
		
					// Add the contributor node (with its children) to the main tree
				}
			}
	
			// Sort the contributorTree by points in descending order
			if (!element) {
				contributorTree.sort((a, b) => (b.points || 0) - (a.points || 0));
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
		public readonly points: number | null,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public children: Contributor[] = []
	) {
		super(name, collapsibleState);

		if (points != null) {
			this.tooltip = `${this.name}-${this.points}`;
			this.description = this.points?.toString();
		}
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
