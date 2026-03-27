import { validateSvg } from "../src/validator";

describe("validateSvg", () => {
	it("should accept valid SVG", () => {
		const input = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" fill="blue"/>
</svg>`;
		const result = validateSvg(input);
		expect(result.valid).toBe(true);
		expect(result.error).toBeUndefined();
	});

	it("should accept minimal SVG", () => {
		const result = validateSvg(
			'<svg xmlns="http://www.w3.org/2000/svg"></svg>'
		);
		expect(result.valid).toBe(true);
	});

	it("should reject empty input", () => {
		expect(validateSvg("").valid).toBe(false);
		expect(validateSvg("   ").valid).toBe(false);
	});

	it("should reject string with no <svg> tag", () => {
		const result = validateSvg("this is not svg at all");
		expect(result.valid).toBe(false);
		expect(result.error).toContain("No <svg> element found");
	});

	it("should reject plain HTML", () => {
		const result = validateSvg("<div>hello</div>");
		expect(result.valid).toBe(false);
		expect(result.error).toContain("No <svg> element found");
	});

	it("should reject malformed XML", () => {
		const input = `<svg xmlns="http://www.w3.org/2000/svg"><unclosed`;
		const result = validateSvg(input);
		expect(result.valid).toBe(false);
		expect(result.error).toBeDefined();
	});

	it("should reject SVG with missing closing tag", () => {
		const input = `<svg xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40">`;
		const result = validateSvg(input);
		expect(result.valid).toBe(false);
	});

	it("should accept SVG with self-closing elements", () => {
		const input = `<svg xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40"/>
  <rect x="10" y="10" width="80" height="80"/>
</svg>`;
		const result = validateSvg(input);
		expect(result.valid).toBe(true);
	});

	it("should accept complex SVG with paths", () => {
		const input = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <path d="M10 80 C 40 10, 65 10, 95 80 S 150 150, 180 80" stroke="black" fill="transparent"/>
  <g transform="translate(10,10)">
    <rect width="50" height="50" fill="red"/>
    <text x="25" y="30" text-anchor="middle">Hi</text>
  </g>
</svg>`;
		const result = validateSvg(input);
		expect(result.valid).toBe(true);
	});
});
