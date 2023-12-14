export class Allocation {
    public readonly year: 		         number               = -1
	public readonly calendar_week:       number               = -1
	public readonly name: 		         string               = ""
	public readonly size: 		         number               = 0
    public readonly project_allocations: Project_Allocation[] = []


    constructor (allocation?: Partial<Allocation>) {
        const new_this: Allocation = {
            ...this,
            ...allocation
        }
        Object.setPrototypeOf(new_this, Allocation.prototype)
        return new_this
    }
}


export type Project_Allocation = {
    value: string,
    project_or_task_name: string,
}