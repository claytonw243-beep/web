(function () {
  function buildMailto(form) {
    var to = form.getAttribute("data-to") || "";
    var subject = form.getAttribute("data-subject") || "New lead";
    var lines = [];
    var fields = form.querySelectorAll("[name]");
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      var label = f.getAttribute("data-label") || f.name;
      lines.push(label + ": " + (f.value || "—"));
    }
    var body = lines.join("\n");
    return (
      "mailto:" +
      encodeURIComponent(to) +
      "?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body)
    );
  }

  function showMessage(form, text) {
    var msg = form.querySelector("[data-form-message]");
    if (msg) {
      msg.textContent = text;
      msg.hidden = false;
    }
  }

  function handleSubmit(e) {
    var form = e.target;
    if (!form.matches("[data-lead-form]")) return;
    e.preventDefault();

    var formId = form.getAttribute("data-formspree-id");
    var hasRealId = formId && formId !== "YOUR_FORM_ID";

    if (!hasRealId) {
      window.location.href = buildMailto(form);
      showMessage(
        form,
        "Your email app should open with your info filled in. If it doesn't, please call us directly."
      );
      form.reset();
      return;
    }

    var data = new FormData(form);
    fetch("https://formspree.io/f/" + formId, {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" },
    })
      .then(function (res) {
        if (res.ok) {
          showMessage(form, "Got it — we'll call you back shortly.");
          form.reset();
        } else {
          window.location.href = buildMailto(form);
          showMessage(
            form,
            "Your email app should open with your info filled in. If it doesn't, please call us directly."
          );
          form.reset();
        }
      })
      .catch(function () {
        window.location.href = buildMailto(form);
        showMessage(
          form,
          "Your email app should open with your info filled in. If it doesn't, please call us directly."
        );
        form.reset();
      });
  }

  document.addEventListener("submit", handleSubmit);
})();
