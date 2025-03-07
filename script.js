// script.js - UX-Funktionen & Webhook-Anbindung
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

    // Datum & Zeit vorausfüllen
    let jetzt = new Date();
    datumFeld.value = jetzt.toISOString().slice(0, 16);

    // Ziel-Status aktualisieren & Feld "Begründung" ein-/ausblenden
    function updateZielStatus() {
        if (zielSelect.value === "Ziel nicht erreicht") {
            begruendungDiv.classList.remove("hidden");
        } else {
            begruendungDiv.classList.add("hidden");
        }
    }

    // Event Listener für Dropdown-Änderungen
    zielSelect.addEventListener("change", updateZielStatus);

    // Funktion für Fetch mit Timeout (60 Sekunden)
    async function fetchWithTimeout(resource, options = {}, timeout = 60000) { // 60 Sekunden Timeout
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

    // **🚀 Webhook-URL**
    const WEBHOOK_URL = "https://contextery.app.n8n.cloud/webhook/15fd0ca7-39c2-4a71-a9c8-652668fe5cae";

    // Webhook-Daten an N8N senden
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

        // Button farblich ändern, aber Text bleibt gleich
        submitButton.style.backgroundColor = "#007bff";

        // Statusmeldung anzeigen
        statusMessage.textContent = "⏳ Anfrage wurde gesendet. Bitte warten...";
        statusMessage.style.color = "#333";

        // Antwortfeld sichtbar machen
        chatResponseContainer.classList.remove("hidden");
        chatResponse.innerHTML = "⏳ Antwort wird generiert...";

        // Anfrage an den Webhook senden
        fetchWithTimeout(WEBHOOK_URL, { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        }, 60000)
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { 
                    console.error(`❌ Server Error ${response.status}:`, text);
                    throw new Error(`Server Error ${response.status}: ${text}`);
                });
            }
            return response.text(); // Erst als Text abrufen
        })
        .then(text => {
            try {
                if (text.startsWith("<")) {
                    throw new Error("❌ Fehler: N8N hat HTML statt JSON zurückgegeben.");
                }
                const data = JSON.parse(text); // JSON umwandeln
                console.log("✅ Antwort von N8N:", data);

                // **💡 Falls "Abschlussanalyse" existiert, dort suchen**
                let report = data.content?.Abschlussanalyse || data.content;  

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
                throw new Error("❌ Fehlerhafte JSON-Antwort: " + text);
            }
        })
        .catch(error => {
            console.error("🚨 Fehler-Details:", error);
            submitButton.style.backgroundColor = "#dc3545"; // Rot bei Fehler
            statusMessage.textContent = "❌ Fehler beim Senden der Anfrage!";
            chatResponse.innerHTML = "⚠️ Fehler beim Laden der Antwort.";
        });
    });

    // Status direkt beim Laden setzen
    updateZielStatus();
});