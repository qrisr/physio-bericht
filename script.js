// script.js - UX-Funktionen & Webhook-Anbindung
document.addEventListener("DOMContentLoaded", function () {
    let zielSelect = document.getElementById("ziel");
    let begruendungDiv = document.getElementById("begruendungDiv");
    let complianceSelect = document.getElementById("compliance");
    let datumFeld = document.getElementById("datum");
    let form = document.getElementById("physioForm");
    let submitButton = document.getElementById("submitButton"); // Button referenzieren
    let statusMessage = document.getElementById("statusMessage"); // Statusnachricht unter dem Formular

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

        // Button-Text auf "Senden..." ändern
        submitButton.textContent = "⏳ Webhook wird gesendet...";
        submitButton.disabled = true;

        fetch("https://contextery.app.n8n.cloud/webhook-test/15fd0ca7-39c2-4a71-a9c8-652668fe5cae", { // <-- Test-Webhook-URL
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            submitButton.textContent = "✅ Webhook abgesendet"; // Button-Bestätigung
            submitButton.style.backgroundColor = "#28a745"; // Button grün färben

            // Statusmeldung unter dem Formular anzeigen
            statusMessage.textContent = "✅ Webhook wurde erfolgreich an N8N gesendet!";
            statusMessage.style.color = "green";

            // Optional: Formular zurücksetzen
            form.reset();
            updateZielStatus();
        })
        .catch(error => {
            submitButton.textContent = "⚠️ Fehler beim Senden";
            submitButton.style.backgroundColor = "#dc3545"; // Button rot färben
            submitButton.disabled = false;

            // Fehlermeldung anzeigen
            statusMessage.textContent = "❌ Fehler beim Senden des Webhooks!";
            statusMessage.style.color = "red";
            console.error("Fehler:", error);
        });
    });

    // Status direkt beim Laden setzen
    updateZielStatus();
});