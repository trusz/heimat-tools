import './app.css'
import App from './App.svelte'

function init (): void {
    // exception: to bootstrap svelte
    // eslint-disable-next-line no-new
    new App({
        target: document.getElementById('app')!,
        props:  {},
    })
}

export default init
