import type { HTTP, JSON_Response } from "../x/http"
import { Allocation, Project_Allocation } from "./allocation"
import { Employee } from "./employee"

export class Employee_API {
    constructor (
        public http:     HTTP,
        public base_url: string
    ) {
        this.api_url = "heimat-core/employees"
    }

    private readonly api_url: string

    public async fetch_employee_list(): Promise<Employee[]> {
        const url = new URL(this.api_url, this.base_url)
        type Response = { employees: Response_Employee[] }
        const resp: JSON_Response<Response> = await this.http.get<Response>(url.toString())
        const body = await resp.body
        
        const emps = body.employees.map(employee_from_response)
        return emps
    }

    public async fetch_employee(emp_id: number): Promise<Employee> {
        const url = this.url_employee(emp_id)
        const resp: JSON_Response<Response_Employee> = await this.http.get<Response_Employee>(url)

        const emp = employee_from_response(resp.body)
        return emp
    }


    public async fetch_allocations(emp_id: number): Promise<Allocation[]> {
        const url = this.url_allocations(emp_id)
        const resp: JSON_Response<Response_Allocation> = await this.http.get<Response_Allocation>(url)

        const allocations =  allocation_from_response(resp.body)
        return allocations
    }

    private url_employee(emp_id: number): string {
        const api_path = [this.api_url, emp_id].join("/")
        const url = new URL(api_path, this.base_url)
        return url.toString()
    }

    private url_allocations(emp_id: number): string {
        const api_path = [this.api_url, emp_id, "availability", "weeks"].join("/")
        const url = new URL(api_path, this.base_url)
        return url.toString()
    }
}



interface Response_Employee {
    id:             number
    firstName:      string
    lastName:       string
    image:          string
    imageExtension: string
}

function employee_from_response(resp: Response_Employee): Employee {

    const image = `${resp.image}/thumbnail${resp.imageExtension}`

    const emp = new Employee({
        id:         resp.id,
        first_name: resp.firstName,
        last_name:  resp.lastName,
        image,
    })

    return emp
}

interface Response_Allocation {
    weeklyAllocations: {
        year: number,
        calendarWeek: number,
        allocations: {
            value: string,
            projectOrTaskName: string,
        }[]
    }[]
}

function allocation_from_response(resp: Response_Allocation): Allocation[] {

    return resp.weeklyAllocations.map( (allocationObj) => {
        const year = allocationObj.year
        const calendar_week = allocationObj.calendarWeek
        const project_allocations = allocationObj.allocations.map( (allocation) => {
            const value = allocation.value
            const project_or_task_name = allocation.projectOrTaskName
            const project_allocation: Project_Allocation = {
                value,
                project_or_task_name: project_or_task_name,
            }

            return project_allocation
        })

        return new Allocation({
            year,
            calendar_week,
            project_allocations,
        })
    })
}