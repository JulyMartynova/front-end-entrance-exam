const STORAGE_KEY = "resumeHtmlData";
const DEBOUNCE_DELAY = 1000;
let saveTimeout = null;

function saveResumeToStorage() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    const html = document.getElementById("app")?.innerHTML;
    if (html) {
      localStorage.setItem(STORAGE_KEY, html);
      console.log("HTML сохранен");
    }
  }, DEBOUNCE_DELAY);
}

function loadResumeFromStorage() {
  const savedHtml = localStorage.getItem(STORAGE_KEY);
  if (!savedHtml) return false;

  const app = document.getElementById("app");
  if (app) {
    app.innerHTML = savedHtml;
    console.log("HTML загружен");
    return true;
  }
  return false;
}
function makeElementEditable(element) {
  if (!element?.classList?.add) {
    console.error("Invalid element passed to makeElementEditable");
    return null;
  }

  const originalClasses = element.className;
  const originalContentEditable = element.contentEditable;

  element.classList.add("editable-element");

  element.contentEditable = "true";

  const handleFocus = () => {
    element.classList.add("editable-focused");
  };

  const handleBlur = () => {
    element.classList.remove("editable-focused");
    saveResumeToStorage();
  };

  const handleInput = () => {
    saveResumeToStorage();
  };

  element.addEventListener("focus", handleFocus);
  element.addEventListener("blur", handleBlur);
  element.addEventListener("input", handleInput);
  return function cleanup() {
    element.classList.remove("editable-element", "editable-focused");
    element.contentEditable = originalContentEditable;

    element.className = originalClasses;

    element.removeEventListener("focus", handleFocus);
    element.removeEventListener("blur", handleBlur);
    element.removeEventListener("input", handleInput);
  };
}

function initializeEditableElements() {
  const selectors = [
    ".subtitle",
    "h1",
    "h2",
    "h3",
    "h4",
    ".presentation span",
    ".year",
    ".duties span",
    ".edu_name span",
    "address",
    "ul li",
    ".tools_title",
  ].join(", ");

  document.querySelectorAll(selectors).forEach((el) => {
    if (el) makeElementEditable(el);
  });
}

function formatHashtagInput() {
  if (!this.textContent.startsWith("#")) {
    this.textContent = "#" + this.textContent.replace(/^#/, "");
    moveCursorToEnd(this);
  }
}

function setupHashtagElements() {
  document.querySelectorAll(".hashtags span").forEach((hashtag) => {
    if (hashtag) {
      hashtag.addEventListener("input", formatHashtagInput);
      makeElementEditable(hashtag);
    }
  });
}

function handleListItemKeydown(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    addNewListItem(this);
    return;
  }

  if (this.textContent.length === 0) {
    event.preventDefault();
    removeListItem(this);
    return;
  }

  if (event.key === " " && this.textContent.trim() === "Новый пункт") {
    event.preventDefault();
    this.textContent = "";
  }
}

function addNewListItem(currentItem) {
  if (!currentItem) return;

  const newItem = document.createElement("li");
  newItem.textContent = "Новый пункт";
  newItem.contentEditable = "true";
  newItem.addEventListener("keydown", handleListItemKeydown);
  makeElementEditable(newItem);

  const list = currentItem.closest("ul");
  if (list) {
    list.insertBefore(newItem, currentItem.nextSibling);

    setTimeout(() => {
      newItem.focus();
      placeCaretAtStart(newItem);
    }, 0);
  }
}

function removeListItem(item) {
  if (!item) return;

  const list = item.closest("ul");
  if (!list) return;

  const items = Array.from(list.children);
  if (items.length > 1) {
    const index = items.indexOf(item);
    const prevItem = items[index - 1];
    const nextItem = items[index + 1];

    item.remove();

    const focusItem = prevItem || nextItem;
    if (focusItem) {
      setTimeout(() => {
        focusItem.focus();
        placeCaretAtEnd(focusItem);
      }, 0);
    }
  } else {
    item.textContent = "";
    placeCaretAtStart(item);
  }
}

function setupListItems() {
  document.querySelectorAll("li").forEach((item) => {
    if (item) {
      item.removeEventListener("keydown", handleListItemKeydown);
      item.addEventListener("keydown", handleListItemKeydown);
    }
  });
}

function configureInterestItem(item) {
  if (!item) return;

  makeElementEditable(item);

  item.addEventListener("input", function () {
    if (!this.textContent.trim() && this.style.display !== "none") {
      this.style.display = "none";
    }
  });

  item.addEventListener("blur", function () {
    updateInterestItemVisibility(this);
  });

  item.addEventListener("focus", function () {
    if (this.style.display === "none") {
      this.style.display = "inline-block";
      this.textContent = "";
    }
  });
}

function updateInterestItemVisibility(item) {
  if (!item) return;
  item.style.display = item.textContent.trim() === "" ? "none" : "inline-block";
}

function setupPDFButton() {
  const button = document.getElementById("generatePDF");
  if (button && typeof Waves !== "undefined") {
    button.addEventListener("click", generatePDF);
    Waves.attach(button, ["waves-dark"]);
  }
}

function generatePDF() {
  if (typeof html2pdf === "undefined") {
    console.error("html2pdf is not available");
    return;
  }

  const element = document.getElementById("app");
  if (!element) return;

  const clone = element.cloneNode(true);
  clone.classList.add("pdf-export");

  const opt = {
    margin: [0, 0, 0, 0],
    filename: "resume.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true, // Важно!
      scrollX: 0,
      scrollY: 0,
    },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };

  html2pdf().set(opt).from(clone).save();
}

function moveCursorToEnd(element) {
  if (!element) return;

  const range = document.createRange();
  const selection = window.getSelection();
  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

function initializeApplication() {
  try {
    if (typeof Waves !== "undefined") {
      Waves.init({ duration: 50 });
    }

    if (!loadResumeFromStorage()) {
      console.log("Новых данных нет, используем исходную верстку");
    }

    initializeEditableElements();
    setupHashtagElements();
    setupListItems();

    document.querySelectorAll(".interest_item").forEach(configureInterestItem);

    setupPDFButton();

    window.addEventListener("beforeunload", saveResumeToStorage);
  } catch (error) {
    console.error("Initialization error:", error);
  }
}

document.addEventListener("DOMContentLoaded", initializeApplication);
