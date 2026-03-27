# SVG Viewer

An [Obsidian](https://obsidian.md) plugin that renders inline SVG code fences as live graphics in both **Reading View** and **Live Preview** mode.

Paste raw SVG markup into a fenced code block and instantly see the rendered graphic — no file attachments needed.

## Features

- Renders `svg` code fences as live inline graphics
- Works in both Reading View and Live Preview
- **Security-first**: all SVG is sanitized before rendering (scripts, event handlers, and dangerous URIs are stripped)
- Click a rendered block to view the raw SVG source; click outside to return to the graphic
- Copy SVG source to clipboard with one click
- Optional "SVG" badge label on rendered blocks
- Configurable external resource blocking
- Supports dark and light themes
- Zero runtime dependencies

## Installation

### Manual

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/konstantinosGkilas/Obsidian-SVG-Viewer/releases)
2. Create a folder called `svg-viewer` inside your vault's `.obsidian/plugins/` directory
3. Copy the three files into that folder
4. Open Obsidian Settings → Community Plugins → Enable "SVG Viewer"

### From Source

```bash
git clone https://github.com/konstantinosGkilas/Obsidian-SVG-Viewer.git
cd Obsidian-SVG-Viewer
npm install
npm run build
```

Then copy `main.js`, `manifest.json`, and `styles.css` into your vault's `.obsidian/plugins/svg-viewer/` directory.

## Usage

Wrap SVG markup in a fenced code block with the `svg` language identifier:

````markdown
```svg
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" fill="steelblue"/>
</svg>
```
````

The SVG renders as a live graphic. Interact with it:

- **Click the block** — switches to the raw SVG source view
- **Click outside** — switches back to the rendered graphic
- **Hover** — reveals a copy button in the top-right corner

## Settings

| Setting | Default | Description |
|---|---|---|
| Block external resources | On | Strips external URLs (`http://`, `https://`) from SVG attributes |
| Show SVG badge | On | Displays a small "SVG" label below rendered blocks |

## Security

All SVG content is sanitized before it touches the DOM. The following are removed:

- `<script>` elements
- `<foreignObject>` elements (can embed arbitrary HTML)
- All `on*` event handler attributes (`onclick`, `onload`, `onerror`, etc.)
- `javascript:` URI schemes in `href` and `src` attributes
- `data:text/html` and `data:text/javascript` URIs
- External resource URLs when "Block external resources" is enabled (default)

The plugin never uses `eval()` or the `Function()` constructor.

## Development

```bash
npm install          # install dependencies
npm run dev          # start esbuild in watch mode
npm run build        # production build
npm test             # run unit tests
```

### Project Structure

```
├── main.ts              # Plugin entry point
├── src/
│   ├── sanitizer.ts     # SVG sanitization (XSS prevention)
│   ├── validator.ts     # SVG structural validation
│   ├── renderer.ts      # Rendering pipeline and UI controls
│   └── settings.ts      # Plugin settings tab
├── styles.css           # Plugin styles
├── tests/
│   ├── sanitizer.test.ts
│   └── validator.test.ts
├── manifest.json
├── package.json
├── tsconfig.json
└── esbuild.config.mjs
```

## Contributing

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes and add tests
4. Run `npm test` to verify all tests pass
5. Run `npm run build` to verify the build succeeds
6. Submit a pull request

## License

[MIT](LICENSE)
