// @name        wikEd diff tool
// @version     1.0.0
// @date        September 25, 2014
// @description online tool for improved word-based diff library with block move detection
// @homepage    https://cacycle.altervista.org/wikEd-diff-tool.html
// @requires    https://en.wikipedia.org/w/index.php?title=User:Cacycle/diff.js&action=raw&ctype=text/javascript
// @author      Cacycle (https://en.wikipedia.org/wiki/User:Cacycle)
// @license     released into the public domain

// JSHint options: W004: is already defined, W100: character may get silently deleted
/* jshint -W004, -W100, newcap: true, browser: true, jquery: true, sub: true, bitwise: true, curly: true, evil: true, forin: true, freeze: true, globalstrict: true, immed: true, latedef: true, loopfunc: true, quotmark: single, strict: true, undef: true */
/* global console */

// turn on ECMAScript 5 strict mode
'use strict';

// define global objects
var WikEdDiffTool = {};
var WikEdDiff;
var wikEdDiffConfig;
var WED;


//
// WikEdDiffTool.init(): initialize
//

WikEdDiffTool.init = function() {

	// set debug shortcut
	if ( (WED === undefined) && (window.console !== undefined ) ) {
		WED = window.console.log;
	}

	// define config variable
	if (wikEdDiffConfig === undefined) {
		wikEdDiffConfig = {};
	}

	// define all wikEdDiff options
	WikEdDiffTool.options = [
		'fullDiff',
		'showBlockMoves',
		'charDiff',
		'repeatedDiff',
		'recursiveDiff',
		'recursionMax',
		'unlinkBlocks',
		'blockMinLength',
		'unlinkMax',
		'coloredBlocks',
		'debug',
		'timer',
		'unitTesting',
		'noUnicodeSymbols',
		'stripTrailingNewline'
	];

	// continue after content has loaded
	if (window.addEventListener !== undefined) {
		window.addEventListener('DOMContentLoaded', WikEdDiffTool.load);
	}
	else {
		window.onload = WikEdDiffTool.load;
	}
	return;
};


//
// WikEdDiffTool.load(): run diff
//

WikEdDiffTool.load = function() {

  // attach event handlers
	document.getElementById('old').addEventListener( 'dragover', WikEdDiffTool.dragHandler, false );
	document.getElementById('old').addEventListener( 'drop', WikEdDiffTool.dropHandler, false );

	document.getElementById('new').addEventListener( 'dragover', WikEdDiffTool.dragHandler, false );
	document.getElementById('new').addEventListener( 'drop', WikEdDiffTool.dropHandler, false );

	document.body.addEventListener( 'dragover', WikEdDiffTool.preventDropHandler, false );

	// enlarge textareas under non-flex float-based layout
	if (document.body.style.flex === undefined) {
		var textareas = document.getElementsByTagName('textarea');
		for (var i = 0; i < textareas.length; i ++) {
			if (textareas[i].className.indexOf('version') > -1) {
				textareas[i].className += ' version_no_flex';
			}
		}
	}

	// call diff
	if (window.addEventListener !== undefined) {
		window.addEventListener('load', WikEdDiffTool.diff);
	}
	else {
		window.onload = WikEdDiffTool.diff;
	}
	return;
};


//
// WikEdDiffTool.diff(): click handler for compare button, get options and text versions, call wikEdDiff.diff()
//

WikEdDiffTool.diff = function() {

	// get form options
	for (var option = 0; option < WikEdDiffTool.options.length; option ++) {
		wikEdDiffConfig[ WikEdDiffTool.options[option] ] = (document.getElementById(WikEdDiffTool.options[option]).checked === true);
	}
	wikEdDiffConfig.blockMinLength = parseInt(document.getElementById('blockMinLength').value);
	wikEdDiffConfig.unlinkMax = parseInt(document.getElementById('unlinkMax').value);
	wikEdDiffConfig.recursionMax = parseInt(document.getElementById('recursionMax').value);

	// calculate the diff
	var oldString = document.getElementById('old').value;
	var newString = document.getElementById('new').value;

	// Replace straight apostrophes and spaces
	oldString = oldString.replace(/'/g, "’");
	oldString = oldString.replace(/ /g, " ");
	oldString = oldString.replace(/\.{3}/g, "…");
	oldString = oldString.replace(/\[([^\]]+)]\([^)]*\)/g, "$1");
	oldString = oldString.replace(/[\[\]]/g, "");
	oldString = oldString.replace(/\*/g, "");

	newString = newString.replace(/'/g, "’");
	newString = newString.replace(/ /g, " ");
	newString = newString.replace(/\.{3}/g, "…");
	newString = newString.replace(/\[([^\]]+)]\([^)]*\)/g, "$1");
	newString = newString.replace(/[\[\]]/g, "");
	newString = newString.replace(/\*/g, "");

	var wikEdDiff = new WikEdDiff();
	var diffHtml = wikEdDiff.diff(oldString, newString);
	document.getElementById('diff').innerHTML = diffHtml;
	return;
};


//
// WikEdDiffTool.example(): click handler for example button, load example text, call WikEdDiffTool.diff()
//

WikEdDiffTool.example = function() {

	document.getElementById('old').value = 'Chocolate is a typically sweet, usually brown, food preparation of seeds, roasted in the form of a liquid, paste or in a block and ground, often flavored, as with vanilla. It is made or used as a flavoring ingredient. Cacao has been cultivated by many cul tures for at lesst three millennia in Mexico and Central America. The earliest evidence of use traces to the Mokaya, with back to 1900 evidence of chocolate beverages dating BC. See also: \n- Candy making\n- Chocolate almonds';

	document.getElementById('new').value = 'Chocolate is a food preparation of Theobroma cacao seeds, roasted and ground, often flavored, as with vanilla. It is made in the form of a liquid, paste or in a block or used as a flavoring ingredient. Cacao has been cultivated by many cultures for at least three millennia in Mexico and Central America. The earliest evidence of use traces to the Mokaya, with evidence of chocolate beverages dating back to 1900 BC. See also:\n- Candy making\n- Chocolate chip\n- Chocolate almonds';

	WikEdDiffTool.diff();
	return;
};


//
// WikEdDiffTool.clear(): click handler for clear button, clear example text and results
//

WikEdDiffTool.clear = function() {

	document.getElementById('old').value = '';
	document.getElementById('new').value = '';
	WikEdDiffTool.diff();
	return;
};


//
// WikEdDiffTool.dropHandler(): event handler for dropping files on old or new fields
//

WikEdDiffTool.dropHandler = function( event ) {

	event.stopPropagation();
	event.preventDefault();

	// get FileList object.
	var fileListObj = event.dataTransfer.files;
	event.target.value = '';

	// get text from dropped files
	WikEdDiffTool.getFileText( fileListObj, event.target, 0 )
	return;
};


//
// WikEdDiffTool.getFileText(): get text file content, cycles through all files in file list object
//

WikEdDiffTool.getFileText = function( fileListObj, target, fileNumber ) {

	if ( fileNumber >= fileListObj.length ) {
		return;
	}
	var fileObj = fileListObj[ fileNumber ];
	if ( target.value !== '' ) {
		target.value += '\n\n'
	}

	// get size and format
	var size = fileObj.size;
	var sizeFormatted = size + '';
	sizeFormatted = sizeFormatted.replace( /(\d\d\d)?(\d\d\d)?(\d\d\d)?(\d\d\d)$/, ',$1,$2,$3,$4' );
	sizeFormatted = sizeFormatted.replace( /^,+/, '' );
	sizeFormatted = sizeFormatted.replace( /,,+/, ',' );
	target.value += encodeURI( fileObj.name ) + ' (' + sizeFormatted + ' bytes):\n';

	// check file length
	var contentMB = parseInt( size / 1024 / 1024 * 10 ) / 10;
	if ( contentMB > 10 ) {
		target.value += 'Error: file larger than 10 MB (' + contentMB + ' MB)\n';
		WikEdDiffTool.getFileText( fileListObj, target, fileNumber + 1 );
		return;
	}

	// read file content asynchronously
	var readerObj = new FileReader();
	readerObj.onload = function() {
		target.value += readerObj.result;
		WikEdDiffTool.getFileText( fileListObj, target, fileNumber + 1 );
		return;
	}
	readerObj.readAsText( fileObj );
	return;
}


//
// WikEdDiffTool.dragHandler(): event handler for dropping files on old or new fields
//

WikEdDiffTool.dragHandler = function( event ) {

	event.stopPropagation();
	event.preventDefault();
	event.dataTransfer.dropEffect = 'copy';
	return;
};


//
// WikEdDiffTool.preventDropHandler(): disable drag and drop over certain elements
//

WikEdDiffTool.preventDropHandler = function( event ) {

	event.stopPropagation();
	event.preventDefault();
	event.dataTransfer.dropEffect = 'none';
	return;
};


// initialize WikEdDiffTool
WikEdDiffTool.init();