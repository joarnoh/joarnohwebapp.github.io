<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Familie – Thuisinventaris</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caladea:wght@700&family=Carlito:wght@400;700&display=swap">
  <link rel="stylesheet" href="style.css">
  <link rel="stylesheet" href="familie.css">
</head>
<body data-page="familie">
<div class="app-shell">
  <header class="topbar" id="topbar"></header>

  <main>
    <section>
      <div class="page-heading"><div><h2>Familie</h2><div class="muted">Deel je inventaris met mensen die je vertrouwt.</div></div></div>
      <div class="panel">
        <h2>Familie uitnodigen</h2>
        <p class="muted">Nodig iemand uit om mee te kijken of de inventaris bij te houden.</p>
        <form onsubmit="inviteFamily(event)">
          <div class="field"><label for="invite-email">E-MAILADRES</label><input id="invite-email" type="email" placeholder="naam@voorbeeld.nl" required></div>
          <button class="primary" type="submit">Uitnodiging versturen</button>
        </form>
        <div id="invite-message"></div>
        <p class="small muted" style="margin-top:18px">De uitnodiging bevat een link naar de app. Samen dezelfde lijst bijhouden kan later, daarvoor is een online database nodig.</p>
      </div>
    </section>
  </main>

  <nav class="bottom-nav" id="nav" aria-label="Hoofdnavigatie"></nav>
</div>
<script src="app.js"></script>
<script>
  /* E-mail versturen via EmailJS (gratis, werkt zonder eigen server).
     1. Maak een account op emailjs.com, koppel je e-mail (Email Services) en maak een sjabloon (Email Templates).
     2. Gebruik in het sjabloon: {{to_email}}, {{from_email}}, {{subject}} en {{message}}.
     3. Vul hieronder je Service ID, Template ID en Public Key in.
     Staat dit nog leeg, dan opent de knop je eigen mailprogramma met de uitnodiging al ingevuld. */
  const EMAILJS = { serviceId: "", templateId: "", publicKey: "" };

  async function inviteFamily(event) {
    event.preventDefault();
    const form = event.target;
    const to = document.getElementById("invite-email").value.trim();
    const from = localStorage.getItem("thuisinventaris-user") || "";
    const link = new URL("login.html", location.href).href;
    const subject = "Uitnodiging voor Thuisinventaris";
    const message = `Hoi!\n\n${from} nodigt je uit voor Thuisinventaris, een app om bij te houden wat je in huis hebt en waar het ligt.\n\nMaak een account via deze link:\n${link}\n\nGroetjes`;
    const box = document.getElementById("invite-message");
    const button = form.querySelector("button[type=submit]");
    const say = html => { box.innerHTML = `<div class="notice">${html}</div>`; };

    if (EMAILJS.serviceId && EMAILJS.templateId && EMAILJS.publicKey) {
      button.disabled = true; button.textContent = "Versturen…";
      try {
        const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service_id: EMAILJS.serviceId, template_id: EMAILJS.templateId, user_id: EMAILJS.publicKey,
            template_params: { to_email: to, from_email: from, subject, message, link }
          })
        });
        if (!response.ok) throw new Error(await response.text());
        say(`Uitnodiging verstuurd naar <strong>${escapeHtml(to)}</strong>.`);
        form.reset();
      } catch (error) {
        say("De e-mail kon niet worden verstuurd. Controleer je EmailJS-gegevens en probeer het opnieuw.");
      } finally {
        button.disabled = false; button.textContent = "Uitnodiging versturen";
      }
    } else {
      say(`Je mailprogramma opent met de uitnodiging voor <strong>${escapeHtml(to)}</strong>. Klik daar op Verzenden.`);
      location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    }
  }
</script>
</body>
</html>
