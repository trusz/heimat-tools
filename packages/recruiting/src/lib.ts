import './app.scss'
import App from './App.svelte'

function init (): void {
    // exception: to bootstrap svelte
    // eslint-disable-next-line no-new
    new App({
        target: document.getElementById("view-root")!,
        props:  {},
    })
}

export default init
