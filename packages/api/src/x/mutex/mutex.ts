export class Mutex {
    private locked = false
    private lockPromise: Promise<void> = Promise.resolve()
    private resolve:     () => void = () => {}

    async lock (): Promise<void> {
        if (this.locked) {
            await this.lockPromise
        }
        this.lockPromise = new Promise((resolve) => { this.resolve = resolve })
        this.locked = true
    }

    unlock (): void {
        this.locked = false
        this.resolve()
    }
}
