const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector("#primary-nav");

if (menuToggle && primaryNav) {
  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    primaryNav.classList.toggle("is-open", !isExpanded);
  });

  primaryNav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      menuToggle.setAttribute("aria-expanded", "false");
      primaryNav.classList.remove("is-open");
    }
  });
}

const inquiryForm = document.querySelector("#inquiry-form");
const formStatus = document.querySelector("#form-status");

function getInquirySummary(form) {
  const formData = new FormData(form);
  return [
    `Contact: ${formData.get("name") || ""}`,
    `Company: ${formData.get("company") || ""}`,
    `Email: ${formData.get("email") || ""}`,
    `Phone / WhatsApp: ${formData.get("phone") || "Not provided"}`,
    `Product: ${formData.get("product") || ""}`,
    `Quantity: ${formData.get("quantity") || ""}`,
    `Customization: ${formData.get("customization") || ""}`,
    `Project notes: ${formData.get("notes") || "None"}`
  ].join("\n");
}

if (inquiryForm && formStatus) {
  const emailFallback = document.querySelector('[data-inquiry-channel="email"]');
  const whatsappFallback = document.querySelector('[data-inquiry-channel="whatsapp"]');

  inquiryForm.addEventListener("input", () => {
    formStatus.textContent = "";
    formStatus.removeAttribute("data-state");
  });

  inquiryForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    formStatus.textContent = "";
    formStatus.removeAttribute("data-state");

    if (!inquiryForm.reportValidity()) return;

    const summary = getInquirySummary(inquiryForm);
    const subject = "ZOXAZO corporate order inquiry";
    const mailto = `mailto:hello@zoxaxo.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary)}`;
    const whatsapp = `https://wa.me/?text=${encodeURIComponent(`Hello ZOXAZO, I'd like to ask about a corporate order.\n\n${summary}`)}`;
    if (emailFallback) emailFallback.href = mailto;
    if (whatsappFallback) whatsappFallback.href = whatsapp;

    const endpoint = inquiryForm.action;
    if (endpoint.includes("YOUR_FORMSPREE_ENDPOINT")) {
      formStatus.dataset.state = "error";
      formStatus.textContent = "The inquiry form is not connected yet. Please use the email or WhatsApp option below, or contact hello@zoxaxo.com.";
      return;
    }

    const submitButton = inquiryForm.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.setAttribute("aria-busy", "true");
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: new FormData(inquiryForm),
        headers: { Accept: "application/json" }
      });

      if (!response.ok) {
        throw new Error(`Form submission failed with status ${response.status}`);
      }

      inquiryForm.reset();
      formStatus.textContent = "Thank you for getting in touch. Your inquiry has been sent, and our corporate desk will be in touch soon.";
    } catch (error) {
      console.error("Unable to submit the ZOXAZO corporate inquiry.", error);
      formStatus.dataset.state = "error";
      formStatus.textContent = "We couldn't send your inquiry just now. Please try again or use the email or WhatsApp option below.";
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.removeAttribute("aria-busy");
      }
    }
  });
}
