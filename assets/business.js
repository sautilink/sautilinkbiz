(() => {
  "use strict";

  function setupNavigation() {
    const navigation = document.querySelector(".local-nav");
    const toggle = document.querySelector(".nav-toggle");
    const links = document.getElementById("business-navigation");
    if (!navigation || !toggle || !links) return;

    function setOpen(open, restoreFocus = false) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close Business navigation" : "Open Business navigation");
      links.classList.toggle("is-open", open);
      if (restoreFocus) toggle.focus();
    }

    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    links.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        event.preventDefault();
        setOpen(false, true);
      }
    });
    document.addEventListener("click", (event) => {
      if (!navigation.contains(event.target)) setOpen(false);
    });
    document.addEventListener("focusin", (event) => {
      if (!navigation.contains(event.target)) setOpen(false);
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 700) setOpen(false);
    });
  }

  function setupFormats() {
    const tablist = document.querySelector("[role='tablist']");
    const tabs = Array.from(document.querySelectorAll("[data-format-tab]"));
    if (!tablist || !tabs.length) return;

    function activateFormat(format, moveFocus = false) {
      const active = tabs.find((tab) => tab.dataset.formatTab === format);
      if (!active) return;
      tabs.forEach((tab) => {
        const selected = tab === active;
        const panel = document.getElementById(tab.getAttribute("aria-controls"));
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
        if (panel) panel.hidden = !selected;
      });
      if (moveFocus) active.focus();
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activateFormat(tab.dataset.formatTab));
      tab.addEventListener("keydown", (event) => {
        let next;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = tabs.length - 1;
        if (next === undefined) return;
        event.preventDefault();
        activateFormat(tabs[next].dataset.formatTab, true);
      });
    });

    document.querySelectorAll("[data-open-format]").forEach((link) => {
      link.addEventListener("click", () => activateFormat(link.dataset.openFormat));
    });

    activateFormat(tabs[0].dataset.formatTab);
    tablist.hidden = false;
  }

  function setupCarousel() {
    const carousel = document.querySelector(".sample-carousel");
    if (!carousel) return;
    const slides = Array.from(carousel.querySelectorAll("[data-carousel-slide]"));
    const controls = carousel.querySelector(".carousel-controls");
    const status = document.getElementById("carousel-status");
    if (!slides.length || !controls || !status) return;
    let current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => { slide.hidden = slideIndex !== current; });
      status.textContent = `${current + 1} of ${slides.length}`;
    }

    controls.querySelectorAll("[data-carousel-direction]").forEach((button) => {
      button.addEventListener("click", () => {
        showSlide(current + (button.dataset.carouselDirection === "next" ? 1 : -1));
      });
    });
    carousel.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      showSlide(current + (event.key === "ArrowRight" ? 1 : -1));
    });

    showSlide(0);
    controls.hidden = false;
  }

  function setupInquiry() {
    const form = document.getElementById("business-form");
    const formatField = document.getElementById("advertising-format");
    const planField = document.getElementById("selected-plan");
    const budgetField = document.getElementById("budget");
    const planSummary = document.getElementById("selected-plan-summary");
    const planLabel = document.getElementById("selected-plan-label");
    const removePlan = document.getElementById("clear-plan");
    const status = document.getElementById("inquiry-selection-status");
    if (!form || !formatField || !planField || !budgetField || !planSummary || !planLabel || !removePlan || !status) return;
    let suggestedBudget = null;

    document.querySelectorAll("[data-inquiry-format]").forEach((link) => {
      link.addEventListener("click", () => {
        const value = link.dataset.inquiryFormat;
        if (!Array.from(formatField.options).some((option) => option.value === value)) return;
        formatField.value = value;
        status.textContent = `${value} selected in the advertising inquiry. Your other details are unchanged.`;
      });
    });

    document.querySelectorAll("[data-inquiry-plan]").forEach((link) => {
      link.addEventListener("click", () => {
        const plan = link.dataset.inquiryPlan;
        const amount = link.dataset.planBudget || "";
        planField.value = plan;
        planLabel.textContent = amount ? `${plan} · $${amount} USD / month` : `${plan} · Custom pricing`;
        planSummary.hidden = false;
        if (!budgetField.value.trim() || budgetField.value === suggestedBudget) {
          budgetField.value = amount;
          suggestedBudget = amount || null;
        }
        status.textContent = `${plan} selected in the advertising inquiry. You can change the budget or remove this selection.`;
      });
    });

    budgetField.addEventListener("input", () => { suggestedBudget = null; });
    removePlan.addEventListener("click", () => {
      planField.value = "";
      planLabel.textContent = "";
      planSummary.hidden = true;
      if (suggestedBudget !== null && budgetField.value === suggestedBudget) budgetField.value = "";
      suggestedBudget = null;
      status.textContent = "Plan selection removed. Your other inquiry details are unchanged.";
      budgetField.focus();
    });
    form.addEventListener("reset", () => {
      planField.value = "";
      planLabel.textContent = "";
      planSummary.hidden = true;
      suggestedBudget = null;
      status.textContent = "";
    });
  }

  document.documentElement.classList.add("js");
  setupNavigation();
  setupFormats();
  setupCarousel();
  setupInquiry();
  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });
})();
