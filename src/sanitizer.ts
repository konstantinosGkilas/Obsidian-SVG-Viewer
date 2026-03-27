/**
 * SVG sanitization — removes dangerous elements and attributes before DOM insertion.
 */

export class SvgSanitizationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "SvgSanitizationError";
	}
}

/** Event handler attribute pattern: on* */
const EVENT_ATTR_REGEX = /^on/i;

/** javascript: protocol in attribute values */
const JS_PROTOCOL_REGEX = /^\s*javascript\s*:/i;

/** data: protocol (can embed scripts) */
const DATA_SCRIPT_REGEX = /^\s*data\s*:\s*text\/(html|javascript)/i;

/** Elements that must be completely removed */
const DANGEROUS_ELEMENTS = new Set([
	"script",
	"foreignobject",
]);

/** Attributes that can carry URLs — check these for javascript: */
const URL_ATTRIBUTES = new Set([
	"href",
	"xlink:href",
	"src",
	"from",
	"to",
	"values",
]);

/** External URL pattern */
const EXTERNAL_URL_REGEX = /^\s*https?:\/\//i;

/**
 * Parse and sanitize SVG, returning the sanitized SVG Element.
 * Works directly with the parsed DOM tree for safe insertion.
 */
export function sanitizeSvgToElement(raw: string, blockExternalResources = true): SVGSVGElement {
	if (!raw || !raw.trim()) {
		throw new SvgSanitizationError("Empty SVG input");
	}

	const parser = new DOMParser();
	const doc = parser.parseFromString(raw, "image/svg+xml");

	const parseError = doc.querySelector("parsererror");
	if (parseError) {
		throw new SvgSanitizationError(
			`SVG parse error: ${parseError.textContent?.slice(0, 200) ?? "unknown"}`
		);
	}

	const svgEl = doc.documentElement;
	if (svgEl.tagName.toLowerCase() !== "svg") {
		throw new SvgSanitizationError("Root element is not <svg>");
	}

	sanitizeElement(svgEl, blockExternalResources);

	return svgEl as unknown as SVGSVGElement;
}

/**
 * Parse and sanitize SVG, returning the sanitized SVG as a string.
 * Used by tests and for serialization needs.
 */
export function sanitizeSvg(raw: string, blockExternalResources = true): string {
	const svgEl = sanitizeSvgToElement(raw, blockExternalResources);
	const serializer = new XMLSerializer();
	return serializer.serializeToString(svgEl);
}

function sanitizeElement(el: Element, blockExternalResources: boolean): void {
	const children = Array.from(el.children);
	for (const child of children) {
		if (DANGEROUS_ELEMENTS.has(child.tagName.toLowerCase())) {
			child.remove();
			continue;
		}
		sanitizeElement(child, blockExternalResources);
	}

	const attrsToRemove: string[] = [];
	for (let i = 0; i < el.attributes.length; i++) {
		const attr = el.attributes[i];
		const name = attr.name.toLowerCase();
		const value = attr.value;

		if (EVENT_ATTR_REGEX.test(name)) {
			attrsToRemove.push(attr.name);
			continue;
		}

		if (URL_ATTRIBUTES.has(name)) {
			if (JS_PROTOCOL_REGEX.test(value) || DATA_SCRIPT_REGEX.test(value)) {
				attrsToRemove.push(attr.name);
				continue;
			}

			if (blockExternalResources && EXTERNAL_URL_REGEX.test(value)) {
				attrsToRemove.push(attr.name);
				continue;
			}
		}
	}

	for (const name of attrsToRemove) {
		el.removeAttribute(name);
	}
}
