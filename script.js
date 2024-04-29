const editor = document.getElementById("editor");
const saveButton = document.getElementById("save-button");
const downloadButton = document.getElementById("download-button");
const openButton = document.getElementById("open-button");
const fileInput = document.getElementById("file-input");

const savedTextName = "SimpleTextEditor_savedText";
const savedText = localStorage.getItem(savedTextName);

// load saved text from localStorage
if (savedText) {
  editor.value = savedText;
}

editor.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();

    const cursorPosition = editor.selectionStart;
    const lineStart = editor.value.lastIndexOf('\n', cursorPosition - 1) + 1;
    const currentLine = editor.value.substring(lineStart, cursorPosition);
    const leadingSpaces = currentLine.match(/^\s*/)[0];

    insertText('\n');
    insertText(leadingSpaces);

  } else if ((event.ctrlKey || event.metaKey) && event.key === "s") {
    event.preventDefault();
    save();
  }
});

saveButton.addEventListener("click", save);

downloadButton.addEventListener("click", saveTextAsFile);

openButton.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function (event) {
    editor.value = event.target.result;
  };

  reader.readAsText(file);
});

function save() {
  editor.value = trimTrailingWhitespace(editor.value);
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

function insertText(text) {
  editor.setRangeText(text, editor.selectionStart, editor.selectionStart, 'end');
}

function trimTrailingWhitespace(text) {
  return text.split('\n').map(line => line.replace(/\s+$/, '')).join('\n');
}
