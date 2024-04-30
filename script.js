const editor = document.getElementById("editor");
const saveButton = document.getElementById("save-button");
const downloadButton = document.getElementById("download-button");
const openButton = document.getElementById("open-button");
const fileInput = document.getElementById("file-input");

const savedTextName = "SimpleTextEditor_savedText";
const savedText = localStorage.getItem(savedTextName);

let spellCheckEnabled = false;
let autoTrimTailingWhitespaceEnabled = true;
let autoIndentEnabled = true;
let autoInsertClosingPairEnabled = true;
let autoInsertIndentLevelEnabled = true;
let indentLevel = 4;

editor.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    onEnterKeyDown();
  } else if (
    (event.ctrlKey || event.metaKey) && event.shiftKey && event.key === "ArrowLeft"
  ) {
    event.preventDefault();
    selectToLineStart();
  } else if ((event.ctrlKey || event.metaKey) && event.key === "ArrowLeft") {
    event.preventDefault();
    moveCursorToLineStart();
  } else if ((event.ctrlKey || event.metaKey) && event.key === "s") {
    event.preventDefault();
    save();
  }
});

editor.addEventListener('input', (event) => {
  if (autoInsertClosingPairEnabled) {
    insertClosingPair(event.data);
  }
});

saveButton.addEventListener("click", save);
downloadButton.addEventListener("click", saveTextAsFile);
openButton.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", onFileInputChange);

// init

editor.setAttribute('spellcheck', spellCheckEnabled);

// load saved text from localStorage
if (savedText) {
  editor.value = savedText;
}

function onEnterKeyDown() {
  const pos = editor.selectionStart;
  const curChar = editor.value[pos - 1]
  const nextChar = editor.value[pos];
  const lineStart = editor.value.lastIndexOf('\n', pos - 1) + 1;
  const currentLine = editor.value.substring(lineStart, pos);

  insertText('\n');

  if (autoIndentEnabled) {
    const leadingSpaces = currentLine.match(/^\s*/)[0];
    insertText(leadingSpaces);
  }
  if (autoInsertIndentLevelEnabled) {
    const pairings = {
      "{": "}",
      "(": ")",
      "[": "]",
      "<": ">"
    };

    if (curChar in pairings && pairings[curChar] === nextChar) {
      moveCursorTo(pos);
      onEnterKeyDown();
    } else if (curChar in pairings || curChar === ':') {
      insertIndentLevel();
    }
  }
}

function save() {
  if (autoTrimTailingWhitespaceEnabled) {
    editor.value = trimTrailingWhitespace(editor.value);
  }
  saveToLocalStorage();
}

function saveToLocalStorage() {
  localStorage.setItem(savedTextName, editor.value);
}

function saveTextAsFile() {
  const textToSave = editor.value;
  const blob = new Blob([textToSave], { type: "text/plain" });
  const filename = "text-file.txt";

  const link = document.createElement("a");
  link.download = filename;
  link.href = URL.createObjectURL(blob);
  link.click();
}

function onFileInputChange() {
  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function (event) {
    editor.value = event.target.result;
  };
  reader.readAsText(file);
}

function insertClosingPair(openingPair) {
  const pairings = {
    "(": ")",
    "{": "}",
    "[": "]",
    '"': '"'
  };

  if (openingPair in pairings) {
    insertText(pairings[openingPair]);
    moveCursorTo(editor.selectionStart - 1);
  }
}

function insertIndentLevel() {
  insertText(" ".repeat(indentLevel));
}

function insertText(text) {
  editor.setRangeText(text, editor.selectionStart, editor.selectionStart, 'end');
}

function moveCursorToLineStart() {
  const pos = editor.selectionStart;
  const absoluteLineStart = editor.value.lastIndexOf('\n', pos - 1) + 1;
  const currentLine = editor.value.substring(absoluteLineStart, pos);
  const leadingSpaces = currentLine.match(/^\s*/)[0];
  const finalPos = absoluteLineStart + leadingSpaces.length;

  if (pos === finalPos) {
    moveCursorTo(absoluteLineStart);
  } else {
    moveCursorTo(finalPos);
  }
}

function selectToLineStart() {
  const pos = editor.selectionStart;
  const absoluteLineStart = editor.value.lastIndexOf('\n', pos - 1) + 1;
  const currentLine = editor.value.substring(absoluteLineStart, pos);
  const leadingSpaces = currentLine.match(/^\s*/)[0];
  const finalPos = absoluteLineStart + leadingSpaces.length;

  if (pos === finalPos) {
    editor.selectionStart = absoluteLineStart;
  } else {
    editor.selectionStart = finalPos;
  }
}

function moveCursorTo(pos) {
  editor.selectionStart = pos;
  editor.selectionEnd = pos;
}

function trimTrailingWhitespace(text) {
  return text.split('\n').map(line => line.replace(/\s+$/, '')).join('\n');
}
