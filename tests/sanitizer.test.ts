import { sanitizeSvg, SvgSanitizationError } from "../src/sanitizer";

describe("sanitizeSvg", () => {
	it("should pass through a valid SVG intact", () => {
		const input = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" fill="blue"/>
</svg>`;
		const result = sanitizeSvg(input);
		expect(result).toContain("<circle");
		expect(result).toContain('fill="blue"');
		expect(result).toContain("<svg");
	});

	it("should strip <script> elements", () => {
		const input = `<svg xmlns="http://www.w3.org/2000/svg">
  <script>alert('xss')</script>
  <circle cx="50" cy="50" r="40" fill="green"/>
</svg>`;
		const result = sanitizeSvg(input);
		expect(result).not.toContain("<script");
		expect(result).not.toContain("alert");
		expect(result).toContain("<circle");
	});

	it("should strip on* event handler attributes", () => {
		const input = `<svg xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" onclick="alert('xss')" onload="alert('xss2')" fill="red"/>
</svg>`;
		const result = sanitizeSvg(input);
		expect(result).not.toContain("onclick");
		expect(result).not.toContain("onload");
		expect(result).toContain("<circle");
		expect(result).toContain('fill="red"');
	});

	it("should strip javascript: href values", () => {
		const input = `<svg xmlns="http://www.w3.org/2000/svg">
  <a href="javascript:alert('xss')">
    <circle cx="50" cy="50" r="40" fill="blue"/>
  </a>
</svg>`;
		const result = sanitizeSvg(input);
		expect(result).not.toContain("javascript:");
		expect(result).toContain("<circle");
	});

	it("should strip <foreignObject> elements", () => {
		const input = `<svg xmlns="http://www.w3.org/2000/svg">
  <foreignObject width="200" height="200">
    <div xmlns="http://www.w3.org/1999/xhtml">
      <script>alert('xss')</script>
    </div>
  </foreignObject>
  <rect width="100" height="100" fill="green"/>
</svg>`;
		const result = sanitizeSvg(input);
		expect(result).not.toContain("foreignObject");
		expect(result).toContain("<rect");
	});

	it("should block external resource URLs by default", () => {
		const input = `<svg xmlns="http://www.w3.org/2000/svg">
  <image href="https://evil.com/image.png" width="100" height="100"/>
</svg>`;
		const result = sanitizeSvg(input, true);
		expect(result).not.toContain("https://evil.com");
	});

	it("should allow external resource URLs when setting is off", () => {
		const input = `<svg xmlns="http://www.w3.org/2000/svg">
  <image href="https://example.com/image.png" width="100" height="100"/>
</svg>`;
		const result = sanitizeSvg(input, false);
		expect(result).toContain("https://example.com/image.png");
	});

	it("should throw SvgSanitizationError for empty input", () => {
		expect(() => sanitizeSvg("")).toThrow(SvgSanitizationError);
		expect(() => sanitizeSvg("   ")).toThrow(SvgSanitizationError);
	});

	it("should throw SvgSanitizationError for malformed XML", () => {
		const input = `<svg xmlns="http://www.w3.org/2000/svg"><circle></svg>`;
		// This may or may not be malformed depending on parser tolerance
		// But truly broken XML should throw
		const broken = `<svg xmlns="http://www.w3.org/2000/svg"><unclosed`;
		expect(() => sanitizeSvg(broken)).toThrow(SvgSanitizationError);
	});

	it("should strip data: URIs containing scripts", () => {
		const input = `<svg xmlns="http://www.w3.org/2000/svg">
  <a href="data:text/html,%3Cscript%3Ealert(1)%3C/script%3E">
    <circle cx="50" cy="50" r="40" fill="blue"/>
  </a>
</svg>`;
		const result = sanitizeSvg(input);
		expect(result).not.toContain("data:text/html");
	});
});
