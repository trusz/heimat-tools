// Reexport your entry components here
import App from "./app.svelte"
import * as pkg from "../../package.json"


export default function init (): void {
    // exception: to bootstrap svelte
    // eslint-disable-next-line no-new
    new App({
        target: document.getElementById("view-root")!,
        props:  {},
    })

	const linkElement = createStyleLinkElement()

	// We could check if the link element
	// with the same id exsits and do not add a new element
	document.head.appendChild(linkElement)

	
}

function createStyleLinkElement(): HTMLElement{
	const id = `application_overview-v${pkg.version}`
	const stylePath = generateStylePath()
	const linkElement = document.createElement("link")
	linkElement.rel = "stylesheet"
	linkElement.type = "text/css"
	linkElement.href = stylePath
	linkElement.id = id

	return linkElement
}

function generateStylePath(): string {
	const srcUrl = new URL(import.meta.url)
	const origin = srcUrl.origin
	const path = srcUrl.pathname.split("/").slice(0,-1).filter(Boolean).join("/")

	const stylePath = `${origin}/${path}/style.css`
	return stylePath
}



