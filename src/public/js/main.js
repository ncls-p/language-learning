let db;
let vocabulary = [];

const dbName = "LinguaLearnDB";
const storeName = "audioCache";

const request = indexedDB.open(dbName, 1);

request.onerror = (event) => {
  console.error("IndexedDB error:", event.target.error);
};

request.onsuccess = (event) => {
  db = event.target.result;
};

request.onupgradeneeded = (event) => {
  db = event.target.result;
  db.createObjectStore(storeName, { keyPath: "id" });
};

document.addEventListener("DOMContentLoaded", () => {
  loadVocabulary();
  const interfaceLanguageSelect = document.getElementById(
    "interface-language-select"
  );
  const languageSelect = document.getElementById("language-select");
  const generateSentenceBtn = document.getElementById("generate-sentence");
  const listenSentenceBtn = document.getElementById("listen-sentence");
  const translateSentenceBtn = document.getElementById("translate-sentence");
  const generateExerciseBtn = document.getElementById("generate-exercise");
  const exerciseTypeSelect = document.getElementById("exercise-type");
  const exerciseContainer = document.getElementById("exercise-container");
  const correctExerciseBtn = document.getElementById("correct-exercise");
  const addVocabularyBtn = document.getElementById("add-vocabulary");
  const dyslexicModeToggle = document.getElementById("dyslexic-mode-toggle");

  let currentSentence = "";
  let currentLanguage = languageSelect.value;
  let currentInterfaceLanguage = interfaceLanguageSelect.value;
  let isDyslexicMode = false;

  function getCachedAudio(id) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onerror = (event) => reject(event.target.error);
      request.onsuccess = (event) => resolve(event.target.result);
    });
  }

  function cacheAudio(id, audioData) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put({ id, audioData });

      request.onerror = (event) => reject(event.target.error);
      request.onsuccess = (event) => resolve(event.target.result);
    });
  }

  languageSelect.addEventListener("change", () => {
    currentLanguage = languageSelect.value;
    updateUILanguage();
  });

  dyslexicModeToggle.addEventListener("click", () => {
    isDyslexicMode = !isDyslexicMode;
    document.body.classList.toggle("dyslexic-mode", isDyslexicMode);
    dyslexicModeToggle.innerHTML = isDyslexicMode
      ? '<i class="fas fa-eye-slash"></i>'
      : '<i class="fas fa-eye"></i>';

    // Regenerate content with dyslexic-friendly formatting
    if (currentSentence) {
      document.getElementById("sentence").innerHTML =
        formatTextForDyslexia(currentSentence);
    }
    if (exerciseContainer.innerHTML) {
      exerciseContainer.innerHTML = formatTextForDyslexia(
        exerciseContainer.innerHTML
      );
    }
  });

  function formatTextForDyslexia(text) {
    if (!isDyslexicMode) return text;

    // Add line breaks after punctuation
    text = text.replace(/([.!?])\s+/g, "$1<br><br>");

    // Highlight important words or phrases
    text = text.replace(
      /\b(important|key|main|crucial)\b/gi,
      "<strong>$1</strong>"
    );

    return text;
  }

  function removeTextFormatting(text) {
    // Remove line breaks
    text = text.replace(/<br>/g, " ");

    // Remove highlighting
    text = text.replace(/<\/?strong>/g, "");

    return text.trim();
  }

  async function fetchFromAPI(endpoint, data) {
    try {
      const response = await fetch(`/api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, language: currentLanguage }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    } catch (error) {
      console.error("Error:", error);
      showNotification("An error occurred. Please try again.", "error");
      return null;
    }
  }

  function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  generateSentenceBtn.addEventListener("click", async () => {
    showLoading(generateSentenceBtn);
    const data = await fetchFromAPI("generate-sentence", {});
    hideLoading(generateSentenceBtn);
    if (data && data.sentence) {
      currentSentence = data.sentence;
      document.getElementById("sentence").innerHTML =
        formatTextForDyslexia(currentSentence);
      document.getElementById("translation").innerText = "";
    } else {
      showNotification(
        "Failed to generate sentence. Please try again.",
        "error"
      );
    }
  });

  listenSentenceBtn.addEventListener("click", async () => {
    if (!currentSentence) {
      showNotification("Please generate a sentence first.", "info");
      return;
    }
    showLoading(listenSentenceBtn);
    const textToSpeak = removeTextFormatting(currentSentence);
    const cacheId = `${currentLanguage}:${languageSelect.value}:${textToSpeak}`;

    try {
      const cachedAudio = await getCachedAudio(cacheId);
      if (cachedAudio) {
        const audio = new Audio(cachedAudio.audioData);
        audio.play();
        hideLoading(listenSentenceBtn);
        return;
      }
    } catch (error) {
      console.error("Error retrieving cached audio:", error);
    }

    const data = await fetchFromAPI("text-to-speech", { text: textToSpeak });
    hideLoading(listenSentenceBtn);
    if (data && data.audioUrl) {
      const audio = new Audio(data.audioUrl);
      audio.play();

      // Cache the audio data
      fetch(data.audioUrl)
        .then((response) => response.blob())
        .then((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            cacheAudio(cacheId, reader.result).catch((error) =>
              console.error("Error caching audio:", error)
            );
          };
          reader.readAsDataURL(blob);
        })
        .catch((error) => console.error("Error fetching audio data:", error));
    } else {
      showNotification("Failed to generate audio. Please try again.", "error");
    }
  });

  translateSentenceBtn.addEventListener("click", async () => {
    if (!currentSentence) {
      showNotification("Please generate a sentence first.", "info");
      return;
    }
    showLoading(translateSentenceBtn);
    const targetLang = currentLanguage === "English" ? "Spanish" : "English"; // Translate to English if current language is not English, otherwise translate to Spanish
    const data = await fetchFromAPI("translate", {
      text: currentSentence,
      sourceLang: currentLanguage,
      targetLang,
    });
    hideLoading(translateSentenceBtn);
    if (data && data.translation) {
      document.getElementById("translation").innerHTML = formatTextForDyslexia(
        data.translation
      );
    } else {
      showNotification("Failed to translate. Please try again.", "error");
    }
  });

  generateExerciseBtn.addEventListener("click", async () => {
    const exerciseType = exerciseTypeSelect.value;
    showLoading(generateExerciseBtn);
    const data = await fetchFromAPI("generate-exercise", {
      type: exerciseType,
    });
    hideLoading(generateExerciseBtn);
    if (data && data.exercise) {
      exerciseContainer.innerHTML = formatTextForDyslexia(data.exercise);
      document.getElementById("exercise-input").value = "";
      document.getElementById("correction-result").innerHTML = "";
    } else {
      showNotification(
        "Failed to generate exercise. Please try again.",
        "error"
      );
    }
  });

  correctExerciseBtn.addEventListener("click", async () => {
    const exercise = document.getElementById("exercise-input").value;
    if (!exercise) {
      showNotification("Please enter your answer first.", "info");
      return;
    }
    showLoading(correctExerciseBtn);
    const data = await fetchFromAPI("correct-exercise", { exercise });
    hideLoading(correctExerciseBtn);
    if (data && data.correction) {
      document.getElementById("correction-result").innerHTML =
        formatTextForDyslexia(data.correction);
    } else {
      showNotification(
        "Failed to correct exercise. Please try again.",
        "error"
      );
    }
  });

  addVocabularyBtn.addEventListener("click", () => {
    const word = prompt("Enter a new word:");
    if (word) {
      addWordToVocabulary(word);
    }
  });

  let vocabulary = [];
  let showTranslation = true;

  function addWordToVocabulary(word) {
    if (!vocabulary.some((item) => item.word === word)) {
      showLoading(document.getElementById("add-vocabulary"));
      fetchFromAPI("translate-word", {
        word: word,
        sourceLang: currentLanguage,
        targetLang: getTargetLanguage(),
      }).then((data) => {
        hideLoading(document.getElementById("add-vocabulary"));
        if (data && data.translation) {
          vocabulary.push({ word, translation: data.translation });
          vocabulary.sort((a, b) => a.word.localeCompare(b.word));
          saveVocabulary();
          displayVocabulary();
        } else {
          showNotification("Failed to translate. Please try again.", "error");
        }
      });
    } else {
      showNotification("This word is already in your vocabulary.", "info");
    }
  }

  function getTargetLanguage() {
    return currentLanguage === "English" ? languageSelect.value : "English";
  }

  function removeWordFromVocabulary(word) {
    vocabulary = vocabulary.filter((item) => item.word !== word);
    saveVocabulary();
    displayVocabulary();
  }

  function displayVocabulary() {
    const vocabularyTable = document.querySelector("#vocabulary-table tbody");
    vocabularyTable.innerHTML = "";
    vocabulary.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
      <td>${item.word}</td>
      <td class="translation-cell" ${
        showTranslation ? "" : 'style="display: none;"'
      }>${item.translation}</td>
      <td>
        <button class="icon-button edit-translation" title="Edit"><i class="fas fa-edit"></i></button>
        <button class="icon-button listen-word" title="Listen"><i class="fas fa-volume-up"></i></button>
        <button class="icon-button delete-word" title="Delete"><i class="fas fa-trash"></i></button>
      </td>
    `;
      vocabularyTable.appendChild(row);

      row.querySelector(".edit-translation").addEventListener("click", () => {
        const newTranslation = prompt("Edit translation:", item.translation);
        if (newTranslation !== null) {
          item.translation = newTranslation;
          saveVocabulary();
          displayVocabulary();
        }
      });

      row.querySelector(".listen-word").addEventListener("click", () => {
        playAudio(item.word);
      });

      row.querySelector(".delete-word").addEventListener("click", () => {
        removeWordFromVocabulary(item.word);
      });
    });
  }

  function loadVocabulary() {
    fetch("/js/vocabulary.json")
      .then((response) => response.json())
      .then((data) => {
        vocabulary = Array.isArray(data) ? data : [];
        displayVocabulary();
      })
      .catch((error) => {
        console.error("Error loading vocabulary:", error);
        vocabulary = [];
      });
  }

  function saveVocabulary() {
    fetch("/api/save-vocabulary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(vocabulary),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          console.log("Vocabulary saved successfully");
        } else {
          console.error("Failed to save vocabulary:", data.message);
        }
      })
      .catch((error) => {
        console.error("Error saving vocabulary:", error);
        showNotification(
          "Failed to save vocabulary. Please try again.",
          "error"
        );
      });
  }

  async function playAudio(word) {
    const listenButton = document.querySelector(
      `#vocabulary-table tr:contains('${word}') .listen-word`
    );
    showLoading(listenButton);
    const cacheId = `${currentLanguage}:${languageSelect.value}:${word}`;

    try {
      const cachedAudio = await getCachedAudio(cacheId);
      if (cachedAudio) {
        const audio = new Audio(cachedAudio.audioData);
        audio.play();
        hideLoading(listenButton);
        return;
      }
    } catch (error) {
      console.error("Error retrieving cached audio:", error);
    }

    const data = await fetchFromAPI("text-to-speech", {
      text: word,
      language: currentLanguage,
    });
    hideLoading(listenButton);
    if (data && data.audioUrl) {
      const audio = new Audio(data.audioUrl);
      audio.play();

      // Cache the audio data
      fetch(data.audioUrl)
        .then((response) => response.blob())
        .then((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            cacheAudio(cacheId, reader.result).catch((error) =>
              console.error("Error caching audio:", error)
            );
          };
          reader.readAsDataURL(blob);
        })
        .catch((error) => console.error("Error fetching audio data:", error));
    } else {
      showNotification("Failed to generate audio. Please try again.", "error");
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    // ... (keep existing code)

    const toggleTranslationBtn = document.getElementById("toggle-translation");
    toggleTranslationBtn.addEventListener("click", () => {
      showTranslation = !showTranslation;
      document.querySelectorAll(".translation-cell").forEach((cell) => {
        cell.style.display = showTranslation ? "" : "none";
      });
      toggleTranslationBtn.innerHTML = showTranslation
        ? '<i class="fas fa-eye-slash"></i>'
        : '<i class="fas fa-eye"></i>';
    });

    // ... (keep existing code)
  });

  const chatContainer = document.getElementById("chat-container");
  const chatInput = document.getElementById("chat-input");
  const sendMessageBtn = document.getElementById("send-message");

  function addMessageToChat(message, isUser = false) {
    const messageElement = document.createElement("div");
    messageElement.className = isUser ? "user-message" : "bot-message";
    messageElement.innerHTML = formatTextForDyslexia(message);

    const timestampElement = document.createElement("span");
    timestampElement.className = "message-timestamp";
    timestampElement.textContent = new Date().toLocaleTimeString();

    const messageContainer = document.createElement("div");
    messageContainer.className = "message-container";
    messageContainer.appendChild(messageElement);
    messageContainer.appendChild(timestampElement);

    chatContainer.appendChild(messageContainer);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  sendMessageBtn.addEventListener("click", async () => {
    const message = chatInput.value.trim();
    if (!message) return;

    addMessageToChat(message, true);
    chatInput.value = "";

    showLoading(sendMessageBtn);
    const data = await fetchFromAPI("chatbot", { message });
    hideLoading(sendMessageBtn);
    if (data && data.response) {
      addMessageToChat(data.response);

      // Add listen button for bot response
      const listenButton = document.createElement("button");
      listenButton.className = "icon-button listen-message";
      listenButton.innerHTML = '<i class="fas fa-volume-up"></i>';
      listenButton.title = "Listen";
      listenButton.addEventListener("click", async () => {
        const textToSpeak = removeTextFormatting(data.response);
        const cacheId = `${currentLanguage}:${textToSpeak}`;

        try {
          const cachedAudio = await getCachedAudio(cacheId);
          if (cachedAudio) {
            const audio = new Audio(cachedAudio.audioData);
            audio.play();
            return;
          }
        } catch (error) {
          console.error("Error retrieving cached audio:", error);
        }

        const audioData = await fetchFromAPI("text-to-speech", {
          text: textToSpeak,
          language: currentLanguage,
        });

        if (audioData && audioData.audioUrl) {
          const audio = new Audio(audioData.audioUrl);
          audio.play();

          // Cache the audio data
          fetch(audioData.audioUrl)
            .then((response) => response.blob())
            .then((blob) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                cacheAudio(cacheId, reader.result).catch((error) =>
                  console.error("Error caching audio:", error)
                );
              };
              reader.readAsDataURL(blob);
            })
            .catch((error) =>
              console.error("Error fetching audio data:", error)
            );
        } else {
          showNotification(
            "Failed to generate audio. Please try again.",
            "error"
          );
        }
      });

      chatContainer.lastElementChild.appendChild(listenButton);
    } else {
      showNotification("Failed to get response. Please try again.", "error");
    }
  });

  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessageBtn.click();
    }
  });

  function showLoading(element) {
    element.disabled = true;
    element.dataset.originalContent = element.innerHTML;
    element.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  }

  function hideLoading(element) {
    element.disabled = false;
    element.innerHTML = element.dataset.originalContent;
  }

  function updateUILanguage() {
    // Update UI elements based on the selected interface language
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.getAttribute("data-i18n");
      element.textContent = i18n[currentInterfaceLanguage][key] || key;
    });

    // Update placeholders
    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      const key = element.getAttribute("data-i18n-placeholder");
      element.placeholder = i18n[currentInterfaceLanguage][key] || key;
    });

    // Update select options
    document.querySelectorAll("select").forEach((select) => {
      Array.from(select.options).forEach((option) => {
        const key = option.getAttribute("data-i18n");
        if (key) {
          option.textContent =
            i18n[currentInterfaceLanguage][key] || option.textContent;
        }
      });
    });

    // Update sentence container text
    const sentenceElement = document.getElementById("sentence");
    if (sentenceElement && !currentSentence) {
      const key = sentenceElement.getAttribute("data-i18n");
      sentenceElement.textContent = i18n[currentInterfaceLanguage][key] || key;
    }
  }

  interfaceLanguageSelect.addEventListener("change", () => {
    currentInterfaceLanguage = interfaceLanguageSelect.value;
    updateUILanguage();
  });

  // Initialize the UI
  updateUILanguage();

  // Implement drag and drop functionality
  const draggables = document.querySelectorAll(".draggable");

  // Control Panel functionality
  const controlPanel = document.getElementById("control-panel");
  const visibilityControls = document.getElementById("visibility-controls");
  const fullscreenControls = document.getElementById("fullscreen-controls");

  // Add toggle button for control panel
  const toggleControlPanelBtn = document.createElement("button");
  toggleControlPanelBtn.innerHTML = '<i class="fas fa-cog"></i>';
  toggleControlPanelBtn.className = "icon-button";
  toggleControlPanelBtn.style.position = "fixed";
  toggleControlPanelBtn.style.right = "10px";
  toggleControlPanelBtn.style.top = "10px";
  toggleControlPanelBtn.style.zIndex = "10000";
  document.body.appendChild(toggleControlPanelBtn);

  toggleControlPanelBtn.addEventListener("click", () => {
    controlPanel.classList.toggle("open");
  });

  // Create visibility and fullscreen controls
  const sections = [
    { id: "sentence-section", name: "Practice Sentence" },
    { id: "exercise-section", name: "Language Exercises" },
    { id: "vocabulary-section", name: "Vocabulary Builder" },
    { id: "chatbot-section", name: "Conversation Practice" },
  ];

  sections.forEach((section) => {
    const visibilityBtn = document.createElement("button");
    visibilityBtn.textContent = `Toggle ${section.name}`;
    visibilityBtn.addEventListener("click", () => {
      const sectionElement = document.getElementById(section.id);
      sectionElement.style.display =
        sectionElement.style.display === "none" ? "block" : "none";
    });
    visibilityControls.appendChild(visibilityBtn);

    const fullscreenBtn = document.createElement("button");
    fullscreenBtn.textContent = `${section.name} Fullscreen`;
    fullscreenBtn.addEventListener("click", () => {
      const sectionElement = document.getElementById(section.id);
      if (!document.fullscreenElement) {
        if (sectionElement.requestFullscreen) {
          sectionElement.requestFullscreen();
        } else if (sectionElement.mozRequestFullScreen) {
          // Firefox
          sectionElement.mozRequestFullScreen();
        } else if (sectionElement.webkitRequestFullscreen) {
          // Chrome, Safari and Opera
          sectionElement.webkitRequestFullscreen();
        } else if (sectionElement.msRequestFullscreen) {
          // IE/Edge
          sectionElement.msRequestFullscreen();
        }

        // Add exit fullscreen button if it doesn't exist
        if (!sectionElement.querySelector(".exit-fullscreen-btn")) {
          const exitFullscreenBtn = document.createElement("button");
          exitFullscreenBtn.textContent = "Exit Fullscreen";
          exitFullscreenBtn.className = "exit-fullscreen-btn";
          exitFullscreenBtn.addEventListener("click", () => {
            if (document.exitFullscreen) {
              document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
              // Firefox
              document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
              // Chrome, Safari and Opera
              document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
              // IE/Edge
              document.msExitFullscreen();
            }
          });
          sectionElement.appendChild(exitFullscreenBtn);
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          // Firefox
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          // Chrome, Safari and Opera
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          // IE/Edge
          document.msExitFullscreen();
        }

        // Remove exit fullscreen button
        const exitFullscreenBtn = sectionElement.querySelector(
          ".exit-fullscreen-btn"
        );
        if (exitFullscreenBtn) {
          exitFullscreenBtn.remove();
        }
      }
    });
    fullscreenControls.appendChild(fullscreenBtn);
  });
  let isDragging = false;
  let isResizing = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  let xOffset = 0;
  let yOffset = 0;

  draggables.forEach((draggable) => {
    const dragHandle = document.createElement("div");
    dragHandle.className = "drag-handle";
    draggable.appendChild(dragHandle);

    dragHandle.addEventListener("mousedown", dragStart);
    document.addEventListener("mouseup", dragEnd);
    document.addEventListener("mousemove", drag);

    const resizeHandle = document.createElement("div");
    resizeHandle.className = "resize-handle";
    draggable.appendChild(resizeHandle);

    resizeHandle.addEventListener("mousedown", resizeStart);
    document.addEventListener("mouseup", resizeEnd);
    document.addEventListener("mousemove", resize);
  });

  function dragStart(e) {
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;

    if (e.target.classList.contains("drag-handle")) {
      isDragging = true;
    }
  }

  function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;

    isDragging = false;
  }

  function drag(e) {
    if (isDragging) {
      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;

      xOffset = currentX;
      yOffset = currentY;

      setTranslate(currentX, currentY, e.target.closest(".draggable"));
    }
  }

  function setTranslate(xPos, yPos, el) {
    el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
  }

  function resizeStart(e) {
    e.preventDefault();
    isResizing = true;
    initialX = e.clientX;
    initialY = e.clientY;
  }

  function resizeEnd(e) {
    isResizing = false;
  }

  function resize(e) {
    if (isResizing) {
      e.preventDefault();
      const resizeTarget = e.target.closest(".draggable");
      const newWidth = e.clientX - resizeTarget.getBoundingClientRect().left;
      const newHeight = e.clientY - resizeTarget.getBoundingClientRect().top;

      resizeTarget.style.width = `${Math.max(newWidth, 200)}px`;
      resizeTarget.style.height = `${Math.max(newHeight, 200)}px`;
    }
  }
});

// Internationalization object (you can expand this with more languages and translations)
const i18n = {
  English: {
    nativeLanguage: "Native Language:",
    languageToLearn: "Language to Learn:",
    generateSentence: "Generate",
    listen: "Listen",
    translate: "Translate",
    generateExercise: "Generate Exercise",
    checkAnswer: "Check Answer",
    addWord: "Add Word",
    sendMessage: "Send",
    practiceTitle: "Practice Sentence",
    exerciseTitle: "Language Exercises",
    vocabularyTitle: "Vocabulary Builder",
    conversationTitle: "Conversation Practice",
    multipleChoice: "Multiple Choice",
    fillInTheBlank: "Fill in the Blank",
    translation: "Translation",
    writeAnswer: "Write your answer here...",
    typeMessage: "Type your message...",
    clickToGenerate: "Click to Generate a Sentence",
  },
  French: {
    nativeLanguage: "Langue maternelle :",
    languageToLearn: "Langue à apprendre :",
    generateSentence: "Générer",
    listen: "Écouter",
    translate: "Traduire",
    generateExercise: "Générer un exercice",
    checkAnswer: "Vérifier la réponse",
    addWord: "Ajouter un mot",
    sendMessage: "Envoyer",
    practiceTitle: "Phrase d'entraînement",
    exerciseTitle: "Exercices de langue",
    vocabularyTitle: "Vocabulaire",
    conversationTitle: "Conversation",
    multipleChoice: "Choix multiple",
    fillInTheBlank: "Texte à trous",
    translation: "Traduction",
    writeAnswer: "Écrivez votre réponse ici...",
    typeMessage: "Tapez votre message...",
    clickToGenerate: "Cliquez sur le bouton pour générer un texte",
  },
  Spanish: {
    nativeLanguage: "Idioma nativo:",
    languageToLearn: "Idioma a aprender:",
    generateSentence: "Generar",
    listen: "Escuchar",
    translate: "Traducir",
    generateExercise: "Generar ejercicio",
    checkAnswer: "Verificar respuesta",
    addWord: "Añadir palabra",
    sendMessage: "Enviar",
    practiceTitle: "Frase de práctica",
    exerciseTitle: "Ejercicios de idioma",
    vocabularyTitle: "Constructor de vocabulario",
    conversationTitle: "Práctica de conversación",
    multipleChoice: "Opción múltiple",
    fillInTheBlank: "Completar espacios en blanco",
    translation: "Traducción",
    writeAnswer: "Escriba su respuesta aquí...",
    typeMessage: "Escriba su mensaje...",
    clickToGenerate: "Clic en el botón para generar texto",
  },
};
