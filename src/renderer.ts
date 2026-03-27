/**
 * SVG rendering pipeline: validate → sanitize → insert into DOM.
 */

import { type Plugin, setIcon } from "obsidian";
import { sanitizeSvgToElement, SvgSanitizationError } from "./sanitizer";
import { validateSvg } from "./validator";
import type { SvgPreviewSettings } from "./settings";

export function renderSvg(
	source: string,
	container: HTMLElement,
	settings: SvgPreviewSettings,
	plugin: Plugin
): void {
	container.empty();
	container.addClass("svg-preview-container");

	const validation = validateSvg(source);
	if (!validation.valid) {
		renderError(container, validation.error ?? "Invalid SVG");
		return;
	}

	let svgEl: SVGSVGElement;
	try {
		svgEl = sanitizeSvgToElement(source, settings.blockExternalResources);
	} catch (e) {
		if (e instanceof SvgSanitizationError) {
			renderError(container, e.message);
		} else {
			renderError(container, "Unexpected error processing SVG");
		}
		return;
	}

	const wrapper = container.createDiv({ cls: "svg-preview-wrapper" });
	const importedSvg = document.importNode(svgEl, true);

	if (!importedSvg.hasAttribute("width") && !importedSvg.hasAttribute("height")) {
		importedSvg.setAttribute("width", "100%");
	}
	importedSvg.addClass("svg-preview-graphic");

	wrapper.appendChild(importedSvg);

	// Source code view (hidden by default via CSS class)
	const sourceEl = container.createEl("pre", { cls: "svg-preview-source svg-preview-hidden" });
	sourceEl.createEl("code", { text: source });

	if (settings.showBadge) {
		container.createDiv({
			cls: "svg-preview-badge",
			text: "SVG",
		});
	}

	// Copy button
	const controls = container.createDiv({ cls: "svg-preview-controls" });
	const copyBtn = controls.createEl("button", {
		cls: "svg-preview-control-btn",
		attr: { "aria-label": "Copy SVG source" },
	});
	setIcon(copyBtn, "copy");
	plugin.registerDomEvent(copyBtn, "click", () => {
		void navigator.clipboard.writeText(source).then(() => {
			setIcon(copyBtn, "check");
			window.setTimeout(() => setIcon(copyBtn, "copy"), 1500);
		});
	});

	// Click to toggle between image and source
	let showingSource = false;

	plugin.registerDomEvent(container, "click", (e: MouseEvent) => {
		if ((e.target as HTMLElement).closest(".svg-preview-controls")) return;
		if (showingSource) return;

		showingSource = true;
		wrapper.addClass("svg-preview-hidden");
		sourceEl.removeClass("svg-preview-hidden");
		container.addClass("svg-preview-editing");
	});

	plugin.registerDomEvent(document, "click", (e: MouseEvent) => {
		if (!showingSource) return;
		if (container.contains(e.target as Node)) return;

		showingSource = false;
		sourceEl.addClass("svg-preview-hidden");
		wrapper.removeClass("svg-preview-hidden");
		container.removeClass("svg-preview-editing");
	});
}

function renderError(container: HTMLElement, message: string): void {
	const errorDiv = container.createDiv({ cls: "svg-preview-error" });
	const iconSpan = errorDiv.createSpan({ cls: "svg-preview-error-icon" });
	setIcon(iconSpan, "alert-triangle");
	errorDiv.createSpan({
		cls: "svg-preview-error-message",
		text: `SVG error: ${message}`,
	});
}
