import { Plugin } from "obsidian";
import { renderSvg } from "./src/renderer";
import {
	DEFAULT_SETTINGS,
	SvgPreviewSettingTab,
	type SvgPreviewSettings,
} from "./src/settings";

export default class SvgPreviewPlugin extends Plugin {
	settings: SvgPreviewSettings = DEFAULT_SETTINGS;

	async onload(): Promise<void> {
		await this.loadSettings();

		this.registerMarkdownCodeBlockProcessor(
			"svg",
			(source, el, _ctx) => {
				renderSvg(source, el, this.settings, this);
			}
		);

		this.addSettingTab(new SvgPreviewSettingTab(this.app, this));
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
