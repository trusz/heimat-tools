// Reexport your entry components here
import App from "./app.svelte"

function init (): void {
    // exception: to bootstrap svelte
    // eslint-disable-next-line no-new
    new App({
        target: document.getElementById("view-root")!,
        props:  {},
    })
}

export default init
