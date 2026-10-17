import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const interfaceSource = readFileSync(new URL("../assets/business.js", import.meta.url), "utf8");
const formSource = readFileSync(new URL("../assets/business-form.js", import.meta.url), "utf8");

class Element {
  constructor(document, attributes = {}, dataset = {}) {
    this.ownerDocument = document;
    this.attributes = new Map(Object.entries(attributes));
    this.dataset = dataset;
    this.listeners = new Map();
    this.queries = new Map();
    this.children = [];
    this.hidden = false;
    this.disabled = false;
    this.tabIndex = 0;
    this.textContent = "";
    this.className = "";
    this.value = "";
    this.classes = new Set();
    this.classList = {
      add: (...names) => names.forEach((name) => this.classes.add(name)),
      toggle: (name, force) => {
        const add = force === undefined ? !this.classes.has(name) : force;
        if (add) this.classes.add(name); else this.classes.delete(name);
        return add;
      },
      contains: (name) => this.classes.has(name),
    };
  }
  addEventListener(type, listener) {
    this.listeners.set(type, [...(this.listeners.get(type) || []), listener]);
  }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  querySelector(selector) { return (this.queries.get(selector) || [])[0] ?? null; }
  querySelectorAll(selector) { return this.queries.get(selector) || []; }
  contains(target) { return target === this || this.children.some((child) => child.contains(target)); }
  focus() { this.ownerDocument.activeElement = this; }
  dispatch(type, properties = {}) {
    const event = { type, target: this, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, ...properties };
    const results = (this.listeners.get(type) || []).map((listener) => listener(event));
    return { event, completed: Promise.all(results) };
  }
}

function setup({ fetchImpl = async () => ({ ok: true, json: async () => ({ ok: true }) }), enhanceForm = false, networkAvailable = true } = {}) {
  const document = new Element(null);
  document.ownerDocument = document;
  document.documentElement = new Element(document);
  document.activeElement = null;
  const ids = new Map();
  const create = (id, attributes = {}, dataset = {}) => {
    const node = new Element(document, id ? { id, ...attributes } : attributes, dataset);
    if (id) ids.set(id, node);
    return node;
  };
  document.getElementById = (id) => ids.get(id) || null;
  const window = new Element(document);
  window.innerWidth = 390;
  const navigation = create(null);
  const toggle = create(null, { "aria-expanded": "false" });
  const links = create("business-navigation");
  const navLink = create(null);
  links.queries.set("a", [navLink]);
  links.children.push(navLink);
  navigation.children.push(toggle, links);
  document.queries.set(".local-nav", [navigation]);
  document.queries.set(".nav-toggle", [toggle]);
  const tablist = create(null);
  const formats = ["posts", "images", "video", "spotlight", "events"];
  const panels = formats.map((format) => create(`panel-${format}`));
  const tabs = formats.map((format) => create(`tab-${format}`, { "aria-controls": `panel-${format}` }, { formatTab: format }));
  document.queries.set("[role='tablist']", [tablist]);
  document.queries.set("[data-format-tab]", tabs);
  const objectiveLink = create(null, {}, { openFormat: "events" });
  document.queries.set("[data-open-format]", [objectiveLink]);
  const carousel = create(null);
  const slides = [create(null), create(null)];
  const controls = create(null);
  const previous = create(null, {}, { carouselDirection: "previous" });
  const next = create(null, {}, { carouselDirection: "next" });
  const carouselStatus = create("carousel-status");
  carousel.queries.set("[data-carousel-slide]", slides);
  carousel.queries.set(".carousel-controls", [controls]);
  controls.queries.set("[data-carousel-direction]", [previous, next]);
  document.queries.set(".sample-carousel", [carousel]);

  const form = create("business-form");
  form.action = "https://formspree.io/f/mqegqrya";
  form.valid = true;
  form.reportValidity = () => form.valid;
  const formatField = create("advertising-format");
  formatField.options = ["", "Promoted Posts", "Image & Carousel Ads", "Video Advertising", "Business Spotlight", "Event & Campaign Promotion"].map((value) => ({ value }));
  const plan = create("selected-plan");
  const budget = create("budget");
  const message = create("message");
  const planSummary = create("selected-plan-summary");
  planSummary.hidden = true;
  const planLabel = create("selected-plan-label");
  const clearPlan = create("clear-plan");
  const selectionStatus = create("inquiry-selection-status");
  const formatLink = create(null, {}, { inquiryFormat: "Image & Carousel Ads" });
  const starter = create(null, {}, { inquiryPlan: "Starter", planBudget: "199" });
  const growth = create(null, {}, { inquiryPlan: "Growth", planBudget: "599" });
  const enterprise = create(null, {}, { inquiryPlan: "Enterprise" });
  document.queries.set("[data-inquiry-format]", [formatLink]);
  document.queries.set("[data-inquiry-plan]", [starter, growth, enterprise]);
  document.queries.set("[data-current-year]", []);
  const submitButton = create("submit-btn");
  submitButton.textContent = "Submit Advertising Inquiry";
  const formStatus = create("form-status");
  const company = create("company"); company.value = "A real business";
  const name = create("name"); name.value = "Test person";
  const email = create("email"); email.value = "test@example.test";
  const phone = create("phone");
  form.fields = { company, name, email, phone, budget, message, advertising_format: formatField, selected_plan: plan };
  form.resetCount = 0;
  form.reset = () => {
    form.resetCount += 1;
    form.dispatch("reset");
    Object.values(form.fields).forEach((field) => { field.value = ""; });
  };
  class FormData {
    constructor(sourceForm) {
      this.sourceForm = sourceForm;
      this.values = new Map(Object.entries(sourceForm.fields).map(([key, field]) => [key, field.value]));
    }
    get(name) { return this.values.get(name) ?? null; }
  }
  const requests = [];
  const fetch = (...args) => { requests.push(args); return fetchImpl(...args); };
  if (networkAvailable) {
    window.fetch = fetch;
    window.FormData = FormData;
  }
  const context = vm.createContext({ document, window, fetch, FormData, Date });
  vm.runInContext(interfaceSource, context);
  if (enhanceForm) vm.runInContext(formSource, context);
  return { document, window, navigation, toggle, links, navLink, tablist, tabs, panels, objectiveLink, carousel, slides, previous, next, carouselStatus, form, formatField, plan, budget, message, planSummary, planLabel, clearPlan, selectionStatus, formatLink, starter, growth, enterprise, submitButton, formStatus, requests };
}

test("format tabs expose one panel and support wraparound, Home and End keyboard navigation", () => {
  const { tabs, panels, tablist, document } = setup();
  assert.equal(tablist.hidden, false);
  assert.deepEqual(panels.map((panel) => panel.hidden), [false, true, true, true, true]);
  const next = tabs[0].dispatch("keydown", { key: "ArrowRight" }).event;
  assert.equal(next.defaultPrevented, true);
  assert.equal(document.activeElement, tabs[1]);
  assert.equal(tabs[1].getAttribute("aria-selected"), "true");
  assert.equal(tabs[0].tabIndex, -1);
  assert.deepEqual(panels.map((panel) => panel.hidden), [true, false, true, true, true]);
  tabs[1].dispatch("keydown", { key: "End" });
  assert.equal(document.activeElement, tabs[4]);
  tabs[4].dispatch("keydown", { key: "ArrowRight" });
  assert.equal(document.activeElement, tabs[0]);
  tabs[0].dispatch("keydown", { key: "ArrowLeft" });
  assert.equal(document.activeElement, tabs[4]);
  tabs[4].dispatch("keydown", { key: "Home" });
  assert.equal(document.activeElement, tabs[0]);
  assert.equal(tabs[0].dispatch("keydown", { key: "Tab" }).event.defaultPrevented, false);
});

test("objective and inquiry links select their intended format without changing an existing draft", () => {
  const ui = setup();
  ui.message.value = "My original campaign requirements.";
  ui.budget.value = "350–700";
  ui.objectiveLink.dispatch("click");
  assert.equal(ui.panels[4].hidden, false);
  assert.equal(ui.tabs[4].getAttribute("aria-selected"), "true");
  ui.formatLink.dispatch("click");
  assert.equal(ui.formatField.value, "Image & Carousel Ads");
  assert.equal(ui.message.value, "My original campaign requirements.");
  assert.equal(ui.budget.value, "350–700");
  assert.match(ui.selectionStatus.textContent, /Image & Carousel Ads selected/);
});

test("example carousel changes frames, announces the position and wraps in either direction", () => {
  const ui = setup();
  assert.deepEqual(ui.slides.map((slide) => slide.hidden), [false, true]);
  ui.next.dispatch("click");
  assert.deepEqual(ui.slides.map((slide) => slide.hidden), [true, false]);
  assert.equal(ui.carouselStatus.textContent, "2 of 2");
  ui.next.dispatch("click");
  assert.equal(ui.carouselStatus.textContent, "1 of 2");
  ui.previous.dispatch("click");
  assert.equal(ui.carouselStatus.textContent, "2 of 2");
  const keyboard = ui.carousel.dispatch("keydown", { key: "ArrowRight" }).event;
  assert.equal(keyboard.defaultPrevented, true);
  assert.equal(ui.carouselStatus.textContent, "1 of 2");
});

test("mobile navigation dismisses with Escape, outside interaction, link selection and desktop resize", () => {
  const ui = setup();
  ui.toggle.dispatch("click");
  assert.equal(ui.toggle.getAttribute("aria-expanded"), "true");
  assert.equal(ui.links.classList.contains("is-open"), true);
  ui.document.dispatch("keydown", { key: "Escape" });
  assert.equal(ui.toggle.getAttribute("aria-expanded"), "false");
  assert.equal(ui.document.activeElement, ui.toggle);
  ui.toggle.dispatch("click");
  ui.document.dispatch("click", { target: new Element(ui.document) });
  assert.equal(ui.links.classList.contains("is-open"), false);
  ui.toggle.dispatch("click");
  ui.document.dispatch("focusin", { target: new Element(ui.document) });
  assert.equal(ui.links.classList.contains("is-open"), false);
  ui.toggle.dispatch("click");
  ui.navLink.dispatch("click");
  assert.equal(ui.links.classList.contains("is-open"), false);
  ui.toggle.dispatch("click");
  ui.window.innerWidth = 1000;
  ui.window.dispatch("resize");
  assert.equal(ui.toggle.getAttribute("aria-expanded"), "false");
});

test("plan selection updates its suggestion while preserving a budget or message the user edits", () => {
  const ui = setup();
  ui.message.value = "Keep this draft exactly as written.";
  ui.starter.dispatch("click");
  assert.equal(ui.plan.value, "Starter");
  assert.equal(ui.budget.value, "199");
  assert.equal(ui.planSummary.hidden, false);
  ui.growth.dispatch("click");
  assert.equal(ui.budget.value, "599");
  ui.budget.value = "425";
  ui.budget.dispatch("input");
  ui.starter.dispatch("click");
  assert.equal(ui.budget.value, "425");
  ui.enterprise.dispatch("click");
  assert.equal(ui.budget.value, "425");
  assert.equal(ui.planLabel.textContent, "Enterprise · Custom pricing");
  ui.clearPlan.dispatch("click");
  assert.equal(ui.plan.value, "");
  assert.equal(ui.planSummary.hidden, true);
  assert.equal(ui.budget.value, "425");
  assert.equal(ui.message.value, "Keep this draft exactly as written.");
  assert.equal(ui.document.activeElement, ui.budget);
});

test("removing a plan clears only an automatic budget, and Enterprise has no invented price", () => {
  const ui = setup();
  ui.growth.dispatch("click");
  ui.enterprise.dispatch("click");
  assert.equal(ui.budget.value, "");
  ui.starter.dispatch("click");
  ui.clearPlan.dispatch("click");
  assert.equal(ui.budget.value, "");
  assert.equal(ui.plan.value, "");
});

test("successful inquiry uses the existing endpoint and FormData, then clears the submitted selection", async () => {
  const ui = setup({ enhanceForm: true });
  ui.message.value = "Please discuss my launch campaign.";
  ui.formatLink.dispatch("click");
  ui.growth.dispatch("click");
  const submitted = ui.form.dispatch("submit");
  assert.equal(submitted.event.defaultPrevented, true);
  assert.equal(ui.submitButton.disabled, true);
  await submitted.completed;
  assert.equal(ui.requests.length, 1);
  const [endpoint, request] = ui.requests[0];
  assert.equal(endpoint, "https://formspree.io/f/mqegqrya");
  assert.equal(request.method, "POST");
  assert.equal(request.headers.Accept, "application/json");
  assert.equal(request.body.sourceForm, ui.form);
  assert.equal(request.body.get("message"), "Please discuss my launch campaign.");
  assert.equal(request.body.get("advertising_format"), "Image & Carousel Ads");
  assert.equal(request.body.get("selected_plan"), "Growth");
  assert.equal(request.body.get("budget"), "599");
  assert.equal(ui.form.resetCount, 1);
  assert.equal(ui.planSummary.hidden, true);
  assert.equal(ui.plan.value, "");
  assert.equal(ui.formatField.value, "");
  assert.equal(ui.formStatus.className, "form-status success");
  assert.match(ui.formStatus.textContent, /submitted successfully/);
  assert.equal(ui.submitButton.disabled, false);
  assert.equal(ui.submitButton.textContent, "Submit Advertising Inquiry");
});

test("server errors retain the inquiry and selection while restoring a usable submit button", async () => {
  const ui = setup({ enhanceForm: true, fetchImpl: async () => ({ ok: false, json: async () => ({ errors: [{ message: "Please use a valid business email." }] }) }) });
  ui.message.value = "Do not discard this message.";
  ui.starter.dispatch("click");
  await ui.form.dispatch("submit").completed;
  assert.equal(ui.form.resetCount, 0);
  assert.equal(ui.message.value, "Do not discard this message.");
  assert.equal(ui.plan.value, "Starter");
  assert.equal(ui.planSummary.hidden, false);
  assert.equal(ui.formStatus.className, "form-status error");
  assert.equal(ui.formStatus.textContent, "Please use a valid business email.");
  assert.equal(ui.submitButton.disabled, false);
});

test("network failures preserve the draft and allow a retry", async () => {
  const ui = setup({ enhanceForm: true, fetchImpl: async () => { throw new Error("Connection unavailable."); } });
  ui.message.value = "A message worth keeping.";
  await ui.form.dispatch("submit").completed;
  assert.equal(ui.message.value, "A message worth keeping.");
  assert.equal(ui.formStatus.textContent, "Connection unavailable.");
  assert.equal(ui.formStatus.className, "form-status error");
  assert.equal(ui.submitButton.disabled, false);
});

test("a pending request blocks duplicate submission and invalid fields block any request", async () => {
  let release;
  const waiting = new Promise((resolve) => { release = resolve; });
  const ui = setup({ enhanceForm: true, fetchImpl: () => waiting });
  const first = ui.form.dispatch("submit");
  await ui.form.dispatch("submit").completed;
  assert.equal(ui.requests.length, 1);
  release({ ok: true, json: async () => ({ ok: true }) });
  await first.completed;
  ui.form.valid = false;
  await ui.form.dispatch("submit").completed;
  assert.equal(ui.requests.length, 1);
});

test("without fetch support the existing native form submission remains available", () => {
  const ui = setup({ enhanceForm: true, networkAvailable: false });
  assert.equal(ui.form.action, "https://formspree.io/f/mqegqrya");
  const submitted = ui.form.dispatch("submit");
  assert.equal(submitted.event.defaultPrevented, false);
  assert.equal(ui.requests.length, 0);
});
