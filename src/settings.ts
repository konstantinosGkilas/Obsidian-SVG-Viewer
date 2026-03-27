import { App, PluginSettingTab, Setting } from "obsidian";
import type SvgPreviewPlugin from "../main";

export interface SvgPreviewSettings {
	blockExternalResources: boolean;
	showBadge: boolean;
}

export const DEFAULT_SETTINGS: SvgPreviewSettings = {
	blockExternalResources: true,
	showBadge: true,
};

export class SvgPreviewSettingTab extends PluginSettingTab {
	plugin: SvgPreviewPlugin;

	constructor(app: App, plugin: SvgPreviewPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Block external resources")
			.setHeading()
			.setDesc(
				"Remove external URL references (HTTP/HTTPS) from SVG attributes for security. Recommended to keep enabled."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.blockExternalResources)
					.onChange(async (value) => {
						this.plugin.settings.blockExternalResources = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Show SVG badge")
			.setDesc("Display a small 'SVG' label below rendered blocks.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.showBadge)
					.onChange(async (value) => {
						this.plugin.settings.showBadge = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
