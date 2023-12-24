const editor = document.getElementById("editor");
const saveButton = document.getElementById("save-button");
const downloadButton = document.getElementById("download-button");
const loadFileButton = document.getElementById("load-file-button");
const fileInput = document.getElementById("file-input");

const savedTextName = "SimpleTextEditor_savedText";
const savedText = localStorage.getItem(savedTextName);
let previousScrollTop = 0;

updateEditorRows();
window.addEventListener('resize', updateEditorRows);

// set focus on the textarea
editor.focus();

// set focus back to textarea when it loses focus
editor.addEventListener("blur", function () {
  editor.focus();
});

// load saved text from localStorage
if (savedText) {
  editor.value = savedText;
}

saveButton.addEventListener("click", function () {
  updateLocalStorage();
});

downloadButton.addEventListener("click", function () {
  saveTextAsFile();
});

loadFileButton.addEventListener("click", function () {
  fileInput.click();
});

fileInput.addEventListener("change", function (event) {
  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function (event) {
    editor.value = event.target.result;
  };

  reader.readAsText(file);
});

editor.addEventListener("scroll", function () {
  clearTimeout(editor.scrollTimeout);
  editor.scrollTimeout = setTimeout(alignText, 50);
});

document.addEventListener("keydown", function (event) {
  if ((event.ctrlKey || event.metaKey) && event.key === "s") {
    event.preventDefault(); // disable the default browser save action
    updateLocalStorage();
  }
});

function updateEditorRows() {
  const windowHeight = window.innerHeight;
  const lineHeight = parseInt(window.getComputedStyle(editor).lineHeight);
  editor.rows = Math.floor(windowHeight / lineHeight) - 2;
}

function updateLocalStorage() {
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

// align the text to prevent partial lines
function alignText() {
  const lineHeight = parseInt(
    window.getComputedStyle(editor).getPropertyValue("line-height")
  );
  const scrollTop = editor.scrollTop;

  let nextLineTop;
  if (scrollTop > previousScrollTop) {
    // Scrolling down
    nextLineTop = Math.ceil(scrollTop / lineHeight) * lineHeight;
  } else {
    // Scrolling up
    nextLineTop = Math.floor(scrollTop / lineHeight) * lineHeight;
  }
  autoScroll(nextLineTop, 128);
}

// smooth scroll
function autoScroll(to, duration) {
  const start = editor.scrollTop;
  const change = to - start;
  const framesPerSecond = 60;
  const totalFrames = (duration / 1000) * framesPerSecond;
  const increment = change / totalFrames;
  let frameCount = 0;

  const animateScroll = function () {
    frameCount++;
    const val = start + increment * frameCount;
    editor.scrollTop = val;
    if (frameCount < totalFrames) {
      requestAnimationFrame(animateScroll);
    } else {
      editor.scrollTop = to; // Set the final scroll position explicitly
    }
    previousScrollTop = editor.scrollTop;
  };

  animateScroll();
}
