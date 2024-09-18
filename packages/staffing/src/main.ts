import App from './App.svelte'

// const app = new App({
//   target: document.getElementById('app')!,
// })
// export default app


function init (): void {
    // exception: to bootstrap svelte
    // eslint-disable-next-line no-new
    new App({
        target: document.getElementById('heimat-tool')!,
        props:  {},
    })
}

export default init
