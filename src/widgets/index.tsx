import {
  BuiltInPowerupCodes,
  declareIndexPlugin,
  type ReactRNPlugin,
  WidgetLocation,
} from "@remnote/plugin-sdk";
import "../style.css";
import "../index.css";
// RemNote rejects plugin powerup codes shorter than 5 characters
const HTML_POWERUP = "html_code";
const CODE_POWERUP = "cd";
const HTML_NAME = "html";
// Tokens RemNote may put in data-rem-tags for this powerup: its name and
// its code, both stripped of non-alphanumeric characters
const HTML_TAGS = [HTML_NAME, HTML_POWERUP].map((t) =>
  t.toLowerCase().replace(/[^a-z0-9]/g, ""),
);
// Build a selector list with one entry per tag token
const forTags = (selector: (tag: string) => string) =>
  HTML_TAGS.map(selector).join(",\n");

const COLLAPSE_CSS = `
${forTags((t) => `[data-rem-tags~="${t}"] :is(.rn-code-node, #code-node):not(:focus-within)`)},
${forTags((t) => `[data-rem-container-tags~="${t}"] :is(.rn-code-node, #code-node):not(:focus-within)`)} {
	max-height: 1.5em !important;
	overflow: hidden !important;
}
`;

const HIDE_ANSWER_CSS = `
${forTags((t) => `.rn-queue__content--answer-hidden [data-queue-rem-container-tags~="${t}"]:not(.rn-question-rem) iframe`)},
${forTags((t) => `.rn-queue__content--answer-hidden [data-rem-container-tags~="${t}"]:not(.rn-question-rem) iframe`)},
.rn-queue__content--answer-hidden [data-queue-rem-container-tags]:not(.rn-question-rem) iframe.rn-plugin-root[src*="html_render"],
.rn-queue__content--answer-hidden [data-queue-rem-container-tags]:not(.rn-question-rem) iframe[src*="widgetName=html_render"],
.rn-queue__content--answer-hidden [data-queue-rem-container-tags]:not(.rn-question-rem) iframe[src*="html_render-sandbox"] {
	display: none !important;
}
`;

async function onActivate(plugin: ReactRNPlugin) {
  // Register the collapse CSS
  await plugin.app.registerCSS("html-collapse-code", COLLAPSE_CSS);

  // Register the hide-answer CSS
  await plugin.app.registerCSS("html-hide-answer", HIDE_ANSWER_CSS);

  // Register the html Power-up
  await plugin.app.registerPowerup({
    name: HTML_NAME,
    code: HTML_POWERUP,
    description: "Render HTML in this note",
    options: { slots: [] },
  });

  // Link the html Power-up and the Widget
  await plugin.app.registerWidget(
    "html_render",
    WidgetLocation.UnderRemEditor,
    {
      dimensions: { height: "auto", width: "100%" },
      powerupFilter: HTML_POWERUP,
    },
  );

  // Register the toggle html Command
  await plugin.app.registerCommand({
    id: "toggle-html",
    name: "Toggle HTML on this Rem",
    action: async () => {
      // Get the focused element
      const rem = await plugin.focus.getFocusedRem();
      if (!rem) return;

      // Add or remove the code and html Power-ups
      if (await rem.hasPowerup(HTML_POWERUP)) {
        await rem.removePowerup(HTML_POWERUP);
        await rem.removePowerup(CODE_POWERUP);
      } else {
        await rem.addPowerup(CODE_POWERUP);
        await rem.addPowerup(HTML_POWERUP);
        // Set the code block language to HTML
        await rem.setPowerupProperty(
          BuiltInPowerupCodes.Code,
          "Language",
          ["html"],
        );
        // Don't limit the code block height
        await rem.setPowerupProperty(
          BuiltInPowerupCodes.Code,
          "DontBoundHeight",
          ["true"],
        );
      }
    },
  });
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
