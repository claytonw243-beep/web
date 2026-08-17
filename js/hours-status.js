(function () {
  var DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  var DAY_NAMES = {
    sun: "Sunday",
    mon: "Monday",
    tue: "Tuesday",
    wed: "Wednesday",
    thu: "Thursday",
    fri: "Friday",
    sat: "Saturday",
  };

  function toMinutes(t) {
    var parts = t.split(":");
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }

  function formatTime(t) {
    var parts = t.split(":");
    var h = parseInt(parts[0], 10);
    var m = parts[1];
    var suffix = h >= 12 ? "PM" : "AM";
    var h12 = h % 12;
    if (h12 === 0) h12 = 12;
    return h12 + ":" + m + " " + suffix;
  }

  function getStatus(now, hours) {
    var day = now.getDay();
    var minutesNow = now.getHours() * 60 + now.getMinutes();
    var todayKey = DAY_KEYS[day];
    var todayHours = hours[todayKey];

    if (todayHours) {
      var openM = toMinutes(todayHours.open);
      var closeM = toMinutes(todayHours.close);
      if (minutesNow >= openM && minutesNow < closeM) {
        return { open: true, closesAt: todayHours.close };
      }
    }

    for (var i = 0; i <= 7; i++) {
      var idx = (day + i) % 7;
      var key = DAY_KEYS[idx];
      var h = hours[key];
      if (!h) continue;
      if (i === 0) {
        var oM = toMinutes(h.open);
        if (minutesNow < oM) {
          return { open: false, nextOpen: h.open, when: "today" };
        }
        continue;
      }
      if (i === 1) {
        return { open: false, nextOpen: h.open, when: "tomorrow" };
      }
      return { open: false, nextOpen: h.open, when: DAY_NAMES[key] };
    }
    return { open: false, nextOpen: null, when: null };
  }

  function apply() {
    var hours = window.__BB_HOURS__;
    var phone = window.__BB_PHONE__;
    if (!hours || !phone) return;

    var status = getStatus(new Date(), hours);
    var openText = document.querySelectorAll("[data-hours-status-text]");
    var openEls = document.querySelectorAll("[data-when-open]");
    var closedEls = document.querySelectorAll("[data-when-closed]");

    var message;
    if (status.open) {
      message = "We're open now — call " + phone.display;
      for (var i = 0; i < openEls.length; i++) openEls[i].hidden = false;
      for (var j = 0; j < closedEls.length; j++) closedEls[j].hidden = true;
    } else if (status.nextOpen) {
      var when =
        status.when === "today" || status.when === "tomorrow"
          ? status.when
          : "on " + status.when;
      message =
        "We're closed right now — we open " +
        when +
        " at " +
        formatTime(status.nextOpen) +
        ". Leave your info and we'll call you first thing.";
      for (var k = 0; k < openEls.length; k++) openEls[k].hidden = true;
      for (var l = 0; l < closedEls.length; l++) closedEls[l].hidden = false;
    } else {
      return;
    }

    for (var m = 0; m < openText.length; m++) {
      openText[m].textContent = message;
    }

    document.documentElement.setAttribute(
      "data-bb-status",
      status.open ? "open" : "closed"
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }
})();
