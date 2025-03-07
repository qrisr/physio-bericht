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

        // **🚀 Neue Test Webhook-URL**
        fetchWithTimeout("https://contextery.app.n8n.cloud/webhook-test/15fd0ca7-39c2-4a71-a9c8-652668fe5cae", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        }, 60000)
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(`Server Error ${response.status}: ${text}`) });
            }
            return response.text(); // Erst als Text abrufen
        })
        .then(text => {
            try {
                const data = JSON.parse(text); // JSON umwandeln
                console.log("Antwort von N8N:", data);
        
                // 🔹 Daten aus der Antwort extrahieren, falls sie verschachtelt sind
                let report = data.content || data.analyse || data.ergebnis; 
        
                if (report) {
                    let analysisHTML = `
                        <h3>Abschlussanalyse</h3>
                        <p><strong>Ziel:</strong> ${report.ziel_uebersicht?.ziel || "N/A"}</p>
                        <p><strong>Compliance:</strong> ${report.ziel_uebersicht?.compliance || "N/A"}</p>
                        <p><strong>Zielbeschreibung:</strong> ${report.ziel_uebersicht?.zielbeschreibung || "N/A"}</p>
                        <p><strong>Hypothese:</strong> ${report.ziel_uebersicht?.hypothese || "N/A"}</p>
                        <p><strong>Begründung:</strong> ${report.ziel_uebersicht?.begruendung || "N/A"}</p>
                        <h3>Analyse</h3>
                        <p><strong>Ergebnis:</strong> ${report.ergebnis?.status || "N/A"}</p>
                        <p><strong>Analyse:</strong> ${report.analyse?.analyse || "N/A"}</p>
                        <p><strong>Schlussfolgerung:</strong> ${report.analyse?.schlussfolgerung || "N/A"}</p>
                        <h3>Empfehlungen</h3>
                        <p><strong>Allgemein:</strong> ${report.empfehlungen?.allgemein || "N/A"}</p>
                        <p><strong>Spezifisch:</strong> ${report.empfehlungen?.spezifisch || "N/A"}</p>
                    `;
        
                    chatResponse.innerHTML = analysisHTML;
                    statusMessage.textContent = "✅ Antwort erhalten!";
                } else {
                    throw new Error("Leere oder ungültige Antwort erhalten.");
                }
            } catch (error) {
                throw new Error("Ungültige JSON-Antwort: " + text);
            }
        })
        .catch(error => {
            submitButton.style.backgroundColor = "#dc3545"; // Rot bei Fehler
            statusMessage.textContent = "❌ Fehler beim Senden der Anfrage!";
            statusMessage.style.color = "red";
            chatResponse.innerHTML = "⚠️ Fehler beim Laden der Antwort.";
            console.error("Fehler-Details:", error);
        });
    });

    // Status direkt beim Laden setzen
    updateZielStatus();
});