import {
	BuiltInPowerupCodes,
	renderWidget,
	usePlugin,
	useTrackerPlugin,
} from '@remnote/plugin-sdk';

import { useEffect, useRef, useState } from 'react';

import '../html_render.css';

// Message type used by the frame to report its height
const RESIZE_MESSAGE = 'html-render-resize';

// Reset the default margin and report the content height
// to the parent so the frame can grow with its content.
// The doctype must come first or the frame renders in quirks mode,
// where the body stretches to the frame and the frame grows forever
const FRAME_PREAMBLE = `<!doctype html>
<style>html, body { margin: 0; }</style>
<script>
(function () {
	function report() {
		parent.postMessage(
			{ type: '${RESIZE_MESSAGE}', height: Math.ceil(document.documentElement.getBoundingClientRect().height) },
			'*'
		);
	}
	window.addEventListener('load', report);
	new ResizeObserver(report).observe(document.documentElement);
})();
</script>
`;

// Language key of RemNote's HTML code blocks
const HTML_LANGUAGE = 'html';

// Remove the HTML's own doctype since the preamble provides one
const stripDoctype = (html: string) =>
	html.replace(/^\s*<!doctype[^>]*>/i, '');

export const HtmlRenderWidget = () => {
	const plugin = usePlugin();
	// The frame the HTML is rendered in
	const frameRef = useRef<HTMLIFrameElement>(null);
	// The height reported by the frame
	const [height, setHeight] = useState(0);
	// The HTML currently rendered in the frame
	const [html, setHtml] = useState('');

	// Read the HTML code from the rem's own text
	const source = useTrackerPlugin(async (rp) => {
		const context = await rp.widget.getWidgetContext();

		if (!context || !('remId' in context)) return '';

		const rem = await rp.rem.findOne(context.remId);
		if (!rem) return '';
		const text = await rem.text;
		if (!text) return '';
		return rp.richText.toString(text);
	});

	// Make sure the code block is highlighted as HTML
	useEffect(() => {
		(async () => {
			const context = await plugin.widget.getWidgetContext();
			if (!context || !('remId' in context)) return;

			const rem = await plugin.rem.findOne(context.remId);
			if (!rem) return;

			const code = BuiltInPowerupCodes.Code;
			const slot = 'Language';
			if ((await rem.getPowerupProperty(code, slot)) !== HTML_LANGUAGE) {
				await rem.setPowerupProperty(code, slot, [HTML_LANGUAGE]);
			}
		})();
	}, []);

	// Re-render 300ms after the code stops changing
	useEffect(() => {
		const t = setTimeout(() => setHtml(source ?? ''), 300);
		return () => clearTimeout(t);
	}, [source]);

	// Resize the frame when its content reports a new height
	useEffect(() => {
		const onMessage = (e: MessageEvent) => {
			if (
				e.source === frameRef.current?.contentWindow &&
				e.data?.type === RESIZE_MESSAGE
			) {
				setHeight(e.data.height);
			}
		};
		window.addEventListener('message', onMessage);
		return () =>
			window.removeEventListener('message', onMessage);
	}, []);

	// Empty code block
	// Prompt the user to type
	if (!source?.trim()) {
		return (
			<div className="html-hint">
				Type HTML code in this code block.
			</div>
		);
	}
	// Render the HTML in an isolated frame so its styles
	// and scripts don't leak into the widget
	return (
		<iframe
			ref={frameRef}
			className="html-output"
			sandbox="allow-scripts allow-popups"
			srcDoc={FRAME_PREAMBLE + stripDoctype(html)}
			style={{ height }}
		/>
	);
};

renderWidget(HtmlRenderWidget);
