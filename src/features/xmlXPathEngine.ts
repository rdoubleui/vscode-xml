'use strict';

import { window, TextEditor, TextEditorEdit, OutputChannel, ViewColumn, workspace } from 'vscode';

let xpath = require('xpath');
let dom = require('xmldom').DOMParser;
let resultChannel: OutputChannel = null;

export var lastXPath: string;

export function evaluateXPath(editor: TextEditor, edit: TextEditorEdit): void {
    let isPersistant = workspace.getConfiguration().has('xmlTools.persistXPathQuery') && workspace.getConfiguration('xmlTools').get<boolean>('persistXPathQuery') === true	    
    
    window.showInputBox({
		placeHolder: 'XPath Query',
		prompt: 'Please enter an XPath query to evaluate.',
		value: isPersistant ? lastXPath : ''
		
	}).then((query) => {
		if (query === undefined) return;
		
		let xml = editor.document.getText();
		let doc = new dom().parseFromString(xml);
		
		try {
			var nodes = xpath.select(query, doc);
		}
		
		catch (ex) {
			window.showErrorMessage(ex);
			return;
		}
		
		lastXPath = query;
		
		if (nodes === null || nodes === undefined || nodes.length == 0) {
			window.showInformationMessage('Your XPath query returned no results.');
			return;
		}

		if (resultChannel === null) resultChannel = window.createOutputChannel('XPath Evaluation Results');
		resultChannel.clear();
				
		nodes.forEach((node) => {
			resultChannel.appendLine(`${node.localName}: ${node.firstChild.data}`);
		});
		
		resultChannel.show(ViewColumn.Three);
	});
}