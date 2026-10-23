import { BuiltInPowerupCodes, type PluginRem } from "@remnote/plugin-sdk";

// RemNote rejects plugin powerup codes shorter than 5 characters
export const HTML_POWERUP = "html_code";
export const CODE_POWERUP = "cd";
export const HTML_NAME = "html";

// Turn a Rem into an HTML code block rendered by the plugin
export async function enableHtml(rem: PluginRem) {
  await rem.addPowerup(CODE_POWERUP);
  await rem.addPowerup(HTML_POWERUP);
  // Set the code block language to HTML
  await rem.setPowerupProperty(BuiltInPowerupCodes.Code, "Language", [
    "html",
  ]);
  // Don't limit the code block height
  await rem.setPowerupProperty(BuiltInPowerupCodes.Code, "DontBoundHeight", [
    "true",
  ]);
}

// Turn an HTML code block back into a plain Rem
export async function disableHtml(rem: PluginRem) {
  await rem.removePowerup(HTML_POWERUP);
  await rem.removePowerup(CODE_POWERUP);
}
