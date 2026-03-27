/**
 * SVG validation — checks basic structural correctness before sanitization.
 */

export interface ValidationResult {
	valid: boolean;
	error?: string;
}

/**
 * Validates that the input is a well-formed SVG document.
 */
export function validateSvg(raw: string): ValidationResult {
	if (!raw || !raw.trim()) {
		return { valid: false, error: "Empty input" };
	}

	// Quick check: must contain an <svg tag somewhere
	if (!/<svg[\s>]/i.test(raw)) {
		return { valid: false, error: "No <svg> element found" };
	}

	const parser = new DOMParser();
	const doc = parser.parseFromString(raw, "image/svg+xml");

	// DOMParser signals errors via a <parsererror> element
	const parseError = doc.querySelector("parsererror");
	if (parseError) {
		const message = parseError.textContent?.slice(0, 200) ?? "Unknown parse error";
		return { valid: false, error: message };
	}

	// Verify root element is <svg>
	if (doc.documentElement.tagName.toLowerCase() !== "svg") {
		return { valid: false, error: "Root element is not <svg>" };
	}

	return { valid: true };
}
