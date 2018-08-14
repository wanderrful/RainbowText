'use strict';
import * as vscode from 'vscode';

function componentToHex(c: number) {
    const hex: string = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

function rgbToHex(r: number, g: number, b: number) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function getRainbowColor(index: number, seed: number, frequency: number = 0.3): vscode.TextEditorDecorationType {
    const spread: number = 8.0;
    const i: number = seed + index/spread;

    const r: number = Math.round(128 + 127 * Math.sin(frequency*i + 0));
    const g: number = Math.round(128 + 127 * Math.sin(frequency*i + 2*Math.PI/3));
    const b: number = Math.round(128 + 127 * Math.sin(frequency*i + 4*Math.PI/3));
    
    return vscode.window.createTextEditorDecorationType({ 
        color:  `${rgbToHex(r, g, b)}`
    });
}

function getRange(i: number, j: number): vscode.Range[] {
    const t_start: vscode.Position = new vscode.Position(i, j);
    const t_end: vscode.Position = new vscode.Position(i, j + 1);

    const t_range: vscode.Range = new vscode.Range(t_start, t_end);

    return [t_range];
}


// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext) {    
    const seed: number = Math.round(256*Math.random());

	let activeEditor = vscode.window.activeTextEditor;
    
    if (activeEditor) {
		triggerUpdateDecorations();
	}

	vscode.window.onDidChangeActiveTextEditor(editor => {
		activeEditor = editor;
		if (editor) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);
    
	vscode.workspace.onDidChangeTextDocument(event => {
		if (activeEditor && event.document === activeEditor.document) {
			triggerUpdateDecorations();
        }
	}, null, context.subscriptions);

	var timeout: NodeJS.Timer | null = null;
	function triggerUpdateDecorations() {
		if (timeout) {
			clearTimeout(timeout);
        }
        timeout = setTimeout(updateDecorations, 500);
	}

	function updateDecorations(x: vscode.TextDocumentContentChangeEvent[]) {
		if (!activeEditor) {
			return;
        }

        let t_seed: number = seed;
        
        for (let i: number = 0; i < activeEditor.document.lineCount - 1; i++) {
            const line = activeEditor.document.lineAt(i);
            if (!line.isEmptyOrWhitespace) {
                t_seed = Math.floor( (t_seed + i) % 256 );
                
                for (let j: number = 0; j < line.text.length; j++) {
                    activeEditor.setDecorations(getRainbowColor(j, t_seed), getRange(i, j));
                }
            }
        }
	}
}