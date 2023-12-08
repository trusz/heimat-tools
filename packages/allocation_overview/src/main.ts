import App from './app.svelte'
import * as pkg from "../package.json";

export default class NewPlugin extends HTMLElement {

	private app: App
	
	connectedCallback() {
		this.attachShadow({ mode: "open" });
		this.app = new App({
			target: this.shadowRoot,
			props: {
				doc: this._doc
			}
		});

		const style = document.createElement("style");
        style.innerHTML = globalThis.pluginStyle[pkg.name];
        this.shadowRoot.appendChild(style);
	}

	private _doc: XMLDocument
	public set doc(newDoc: XMLDocument){
		this._doc = newDoc
		if(!this.app) { return }

		this.app.$set({doc: newDoc})
	}

}
