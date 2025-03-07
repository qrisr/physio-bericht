document.addEventListener("DOMContentLoaded", function () {
    let zielSelect = document.getElementById("ziel");
    let begruendungDiv = document.getElementById("begruendungDiv");
    let complianceSelect = document.getElementById("compliance");
    let datumFeld = document.getElementById("datum");
    let form = document.getElementById("physioForm");
    let submitButton = document.getElementById("submitButton");
    let statusMessage = document.getElementById("statusMessage");
    let chatResponseContainer = document.getElementById("chatResponseContainer");
    let chatResponse = document.getElementById("chatResponse");

    // 📌 Datum & Zeit vorausfüllen
    let jetzt = new Date();
    datumFeld.value = jetzt.toISOString().slice(0, 16);

    // 📌 Ziel-Status aktualisieren & Feld "Begründung" ein-/ausblenden
    function updateZielStatus() {
        if (zielSelect.value === "Ziel nicht erreicht") {
            begruendungDiv.classList.remove("hidden");
        } else {
            begruendungDiv.classList.add("hidden");
        }
    }
    zielSelect.addEventListener("change", updateZielStatus);

    // 📌 Webhook URL für n8n
    const WEBHOOK_URL = "https://contextery.app.n8n.cloud/webhook/15fd0ca7-39c2-4a71-a9c8-652668fe5cae";

    // 📌 Funktion für Fetch mit Timeout (60s)
    async function fetchWithTimeout(resource, options = {}, timeout = 60000) { 
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        try {
            const response = await fetch(resource, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    // 📌 Webhook-Daten an n8n senden
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        let formData = {
            datum: datumFeld.value,
            ziel: zielSelect.value,
            compliance: complianceSelect.value,
            ziel_text: document.getElementById("ziel_text").value,
            hypothese: document.getElementById("hypothese").value,
            begruendung: document.getElementById("begruendung").value || null
        };

        // Button & Status aktualisieren
        submitButton.style.backgroundColor = "#007bff";
        statusMessage.textContent = "⏳ Anfrage wurde gesendet. Bitte warten...";
        statusMessage.style.color = "#333";
        chatResponseContainer.classList.remove("hidden");
        chatResponse.innerHTML = "⏳ Antwort wird generiert...";

        // 📌 Anfrage an den Webhook senden
        fetchWithTimeout(WEBHOOK_URL, { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        }, 60000)
        .then(response => response.text()) // Rohtext abrufen
        .then(text => {
            console.log("🔹 Rohantwort von N8N:", text); // Debugging Log
        
            try {
                if (!text.trim()) {
                    throw new Error("❌ Fehler: Leere Antwort von N8N erhalten!");
                }
        
                // Versuchen, das JSON sicher zu parsen
                const safeText = text.replace(/(\r\n|\n|\r)/gm, ""); // Zeilenumbrüche entfernen
                const jsonData = JSON.parse(safeText);
        
                console.log("✅ JSON-Parsing erfolgreich:", jsonData);
        
                let report = jsonData.content?.Abschlussanalyse || jsonData.content;
        
                if (report) {
                    let analysisHTML = `
                        <h3>📊 Abschlussanalyse</h3>
                        <p><strong>Ziel:</strong> ${report.Ziel || "N/A"}</p>
                        <p><strong>Zielbeschreibung:</strong> ${report.Zielbeschreibung || "N/A"}</p>
                        <p><strong>Ergebnis:</strong> ${report.Ergebnis || "N/A"}</p>
                        <h3>🔎 Analyse</h3>
                        <p><strong>Hypothese:</strong> ${report.Analyse?.Hypothese || "N/A"}</p>
                        <p><strong>Compliance:</strong> ${report.Analyse?.Compliance || "N/A"}</p>
                        <p><strong>Bewertung:</strong> ${report.Analyse?.Bewertung || "N/A"}</p>
                        <p><strong>Status:</strong> ${report.Analyse?.Status || "N/A"}</p>
                        <h3>📝 Schlussfolgerung</h3>
                        <p>${report.Schlussempfehlung?.Verbesserungsvorschläge || "Keine Empfehlungen"}</p>
                    `;
        
                    chatResponse.innerHTML = analysisHTML;
                    statusMessage.textContent = "✅ Antwort erhalten!";
                } else {
                    throw new Error("❌ Fehler: Leere oder ungültige JSON-Antwort.");
                }
            } catch (error) {
                console.error("🚨 Fehler beim JSON-Parsing:", error);
                chatResponse.innerHTML = `<p style="color:red;">⚠️ Fehler beim Verarbeiten der Antwort!</p>`;
                console.log("🔍 Rohantwort als Fallback:", text); // Logge die Antwort für Debugging
            }
        })
        .catch(error => {
            console.error("🚨 Fehler-Details:", error);
            submitButton.style.backgroundColor = "#dc3545"; // Rot bei Fehler
            statusMessage.textContent = "❌ Fehler beim Senden der Anfrage!";
            chatResponse.innerHTML = "⚠️ Fehler beim Laden der Antwort.";
        });
    });

    updateZielStatus();
});