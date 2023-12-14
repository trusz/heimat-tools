export class Employee {
    public readonly id:         number = -1
    public readonly first_name: string = ""
    public readonly last_name:  string = ""
    public readonly image:      string = ""

    constructor (employee?: Partial<Employee>) {
        const new_this: Employee = {
            ...this,
            ...employee
        }
        Object.setPrototypeOf(new_this, Employee.prototype)
        return new_this
    }
}
