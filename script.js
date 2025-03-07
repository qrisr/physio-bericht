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

        // 🚀 **Neue Production Webhook-URL in N8N**
        fetch("https://contextery.app.n8n.cloud/webhook/15fd0ca7-39c2-4a71-a9c8-652668fe5cae", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            console.log("Antwort von N8N:", data);

            if (data.content) {
                let report = data.content.abschlussanalyse;
                let analysisHTML = `
                    <h3>Abschlussanalyse</h3>
                    <p><strong>Ziel:</strong> ${report.ziel}</p>
                    <p><strong>Compliance:</strong> ${report.compliance}</p>
                    <p><strong>Zielbeschreibung:</strong> ${report.zielbeschreibung}</p>
                    <p><strong>Hypothese:</strong> ${report.hypothese}</p>
                    <p><strong>Begründung:</strong> ${report.begründung}</p>
                    <h3>Analyse</h3>
                    <p><strong>Umsetzung:</strong> ${report.analyse.umsetzung}</p>
                    <p><strong>Schlussfolgerung:</strong> ${report.analyse.schlussfolgerung}</p>
                `;
                
                chatResponse.innerHTML = analysisHTML; // Antwort ins HTML einfügen
                statusMessage.textContent = "✅ Antwort erhalten!";
            } else {
                chatResponse.innerHTML = "⚠️ Fehler: Keine Antwort erhalten.";
                statusMessage.textContent = "❌ Fehler: Antwort konnte nicht geladen werden.";
                statusMessage.style.color = "red";
            }
        })
        .catch(error => {
            submitButton.style.backgroundColor = "#dc3545"; // Rot bei Fehler
            statusMessage.textContent = "❌ Fehler beim Senden der Anfrage!";
            statusMessage.style.color = "red";
            chatResponse.innerHTML = "⚠️ Fehler beim Laden der Antwort.";
            console.error("Fehler:", error);
        });
    });

    // Status direkt beim Laden setzen
    updateZielStatus();
});