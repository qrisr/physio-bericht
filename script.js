// script.js - UX-Funktionen & Webhook-Anbindung
document.addEventListener("DOMContentLoaded", function () {
    let zielSelect = document.getElementById("ziel");
    let begruendungDiv = document.getElementById("begruendungDiv");
    let complianceSelect = document.getElementById("compliance");
    let datumFeld = document.getElementById("datum");
    let form = document.getElementById("physioForm");

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

        fetch("https://contextery.app.n8n.cloud/webhook/15fd0ca7-39c2-4a71-a9c8-652668fe5cae", { // <-- Hier die Webhook-URL eingefügt
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            alert("Formular erfolgreich gesendet!");
            form.reset();
            updateZielStatus();
            window.location.href = "result.html"; // Weiterleitung zur HTML-Seite mit Antwort
        })
        .catch(error => {
            alert("Fehler beim Senden des Formulars!");
            console.error("Fehler:", error);
        });
    });

    // Status direkt beim Laden setzen
    updateZielStatus();
});