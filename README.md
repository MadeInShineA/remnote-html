# Remnote HTML

Render HTML inside RemNote: turn any Rem into an HTML code block and see the
rendered result below it, updating as you type.

## Usage

1. On a Rem, open the command palette (`Ctrl/Cmd + K`) and run **Toggle HTML on this Rem**.
2. Type your HTML into the code block; the result renders below it.
3. Run the command again to remove it.

The code block collapses to one line when unfocused so the output stays visible,
click it to expand. The HTML is rendered in a sandboxed iframe, so its `<style>`
and `<script>` tags work without affecting RemNote.

## Development

A Nix flake provides the toolchain (`nodejs` plus language servers/formatting).
Load it with `nix develop`. Without Nix, just
install **Node.js (>=18) and npm**.

```sh
npm install
npm run dev         # webpack dev server on http://localhost:8080
npm run build       # build PluginZip.zip
npm run check-types # tsc
```

To test in RemNote: `npm run dev`, then **Settings → Plugins → Build a plugin**
and point it at `http://localhost:8080`.
