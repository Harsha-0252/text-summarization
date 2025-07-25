function handleFileUpload() {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];
    
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(event) {
        const fileContent = event.target.result;
        document.getElementById("userInput").value = fileContent; // Display the file content in the input section
    };

    if (file.type === "application/pdf") {
        // Handle PDF file reading
        const pdfjsLib = window['pdfjs-dist/build/pdf'];
        const fileReader = new FileReader();
        
        fileReader.onload = function(e) {
            const loadingTask = pdfjsLib.getDocument({data: new Uint8Array(e.target.result)});
            loadingTask.promise.then(pdf => {
                let textContent = '';
                const numPages = pdf.numPages;
                for (let i = 1; i <= numPages; i++) {
                    pdf.getPage(i).then(page => {
                        page.getTextContent().then(text => {
                            text.items.forEach(item => {
                                textContent += item.str + ' ';
                            });
                        });
                    });
                }
                // Wait for all pages to load and then set the input text
                setTimeout(() => document.getElementById("userInput").value = textContent, 1000);
            });
        };
        
        fileReader.readAsArrayBuffer(file);
    } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        // Handle Word Document (.docx) reading
        const reader = new FileReader();
        reader.onload = function(event) {
            const docx = window.mammoth.convertToHtml({arrayBuffer: event.target.result});
            docx.then(function(result) {
                document.getElementById("userInput").value = result.value; // Set extracted text in textarea
            });
        };
        reader.readAsArrayBuffer(file);
    } else if (file.type === "text/plain") {
        // Handle text files
        reader.readAsText(file);
    }
}

let selectedScript = '';  // Store selected script ('summarizer.py' or 'summarizer1.py')

document.getElementById("dialogOption").addEventListener("click", function() {
    selectedScript = 'summarizer.py';
    updateSelection('Dialogs', selectedScript);
});

document.getElementById("abstractOption").addEventListener("click", function() {
    selectedScript = 'summarizer1.py';
    updateSelection('Abstract', selectedScript);
});

function updateSelection(option, script) {
    // Change colors for selected and unselected options
    document.getElementById("dialogOption").style.backgroundColor = (option === 'Dialogs') ? '#4CAF50' : '';
    document.getElementById("abstractOption").style.backgroundColor = (option === 'Abstract') ? '#4CAF50' : '';

    // Update the message displayed to the user
    document.getElementById("selectedOptionMessage").textContent = `You selected: ${option}. The script "${script}" will run.`;
}

function summarizeText() {
    const userInput = document.getElementById("userInput").value;

    if (!userInput.trim()) {
        alert("Please enter some text to summarize.");
        return;
    }

    if (!selectedScript) {
        alert("Please select a summarization type (Dialogs or Abstract).");
        return;
    }

    // Send the text and selected script to the backend for summarization
    fetch("http://127.0.0.1:3000/summarize", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: userInput, script: selectedScript })
    })
    .then(response => response.json())
    .then(data => {
        // Display the summarized text
        const summaryOutput = document.getElementById("summaryOutput");
        summaryOutput.textContent = data.summary || "Error: Could not generate summary.";
    })
    .catch(error => {
        console.error("Error:", error);
        alert("An error occurred while generating the summary.");
    });
}
