import {
	renderWidget,
	usePlugin,
	WidgetLocation,
	type PluginRem,
	type RNPlugin,
} from '@remnote/plugin-sdk';

import { useState } from 'react';

import { enableHtml } from '../html_rem';

import '../style.css';

// Get the Rem the file should be imported into: the focused Rem when
// it's empty, otherwise a new Rem right after it
async function getTargetRem(
	plugin: RNPlugin,
	remId: string
): Promise<PluginRem | undefined> {
	const focused = await plugin.rem.findOne(remId);
	if (!focused) return;

	const text = await plugin.richText.toString(focused.text ?? []);
	if (!text.trim()) return focused;

	const rem = await plugin.rem.createRem();
	if (!rem) return;
	const position = await focused.positionAmongstSiblings();
	await rem.setParent(focused.parent, (position ?? 0) + 1);
	return rem;
}

export const HtmlImportWidget = () => {
	const plugin = usePlugin();
	// The error to show when the import fails
	const [err, setErr] = useState('');

	// Import the picked file as an HTML code block
	const onFile = async (file: File | undefined) => {
		if (!file) return;
		try {
			const context =
				await plugin.widget.getWidgetContext<WidgetLocation.Popup>();
			const remId = context?.contextData?.remId ?? context?.focusedRemId;
			if (!remId) {
				setErr('Focus a Rem before importing an HTML file.');
				return;
			}

			const rem = await getTargetRem(plugin, remId);
			if (!rem) {
				setErr('Could not find a Rem to import into.');
				return;
			}

			await rem.setText([await file.text()]);
			await enableHtml(rem);
			// Don't restore focus so the code block stays collapsed
			await plugin.widget.closePopup(false);
		} catch (e: any) {
			setErr(String(e?.message ?? e));
		}
	};

	return (
		<div className="p-4 flex flex-col gap-3">
			<div className="font-semibold">Import HTML file</div>
			<input
				type="file"
				accept=".html,.htm,text/html"
				onChange={(e) => onFile(e.target.files?.[0])}
			/>
			{err && <div className="text-red-500 text-sm">{err}</div>}
		</div>
	);
};

renderWidget(HtmlImportWidget);
