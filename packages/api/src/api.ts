import { Employee_API } from "./employee"
import { Project_API } from "./project"
import { Time_Entry_API, type Time_Entry } from "./time_entry"
import { HTTP } from "./x/http"

export class API {
    constructor (
        private jwt:      string = "",
        private base_url: string = ""
    ) {
        if (jwt !== "") {
            const claims = parse_jwt<Claims>(jwt)
            this.employee_id = claims.employeeId
        }

        this.http = new HTTP(jwt)
        this.employee_api = new Employee_API(this.http, base_url)
        this.project_api = new Project_API(this.http, base_url, this.employee_id)
        this.time_entry_api = new Time_Entry_API(this.http, base_url, this.employee_id)
    }

    private readonly http:         HTTP
    private project_api:           Project_API
    private time_entry_api:        Time_Entry_API
    private readonly employee_api: Employee_API

    public employee_id = -1
    public fetch_projects = async (d: Date = new Date()) => await this.project_api.fetch_projects(d)
    public fetch_time_entires = async (f: Date, t: Date) => await this.time_entry_api.fetch_time_entries(f, t)
    public save_time_entry = async (te: Time_Entry) => { await this.time_entry_api.save_time_entry(te) }
    public update_time_entry = async (te: Time_Entry) => { await this.time_entry_api.update_time_entry(te) }
    public delete_time_entry = async (te: Time_Entry) => { await this.time_entry_api.delete_time_entry(te) }
    public fetch_employee = async (id: number) => await this.employee_api.fetch_employee(id)
    public fetch_employee_list = async () => await this.employee_api.fetch_employee_list()
    public fetch_allocation = async (emp_id:number) => await this.employee_api.fetch_allocations(emp_id) 

    public set_base_url (url: string) {
        this.base_url = url
        this.project_api.base_url = url
        this.employee_api.base_url = url
        this.time_entry_api.base_url = url
    }

    public clear_jwt () {
        this.jwt = ""
        this.http.jwt = ""
    }

    public jwt_set (jwt: string) {
        this.jwt = jwt
        this.http.jwt = this.jwt
        const claims = parse_jwt<Claims>(jwt)

        this.employee_id = claims.employeeId
        this.project_api = new Project_API(this.http, this.base_url, this.employee_id)
        this.time_entry_api = new Time_Entry_API(this.http, this.base_url, this.employee_id)
    }

    public employee_id_set (id: number) {
        this.employee_id = id
        this.project_api = new Project_API(this.http, this.base_url, this.employee_id)
        this.time_entry_api = new Time_Entry_API(this.http, this.base_url, this.employee_id)
    }

    public jwt_get (): string {
        return this.jwt
    }
}

export function parse_jwt<T> (token?: string): T {
    if (!token || token === "") {
        throw new Error("now token to parse")
    }

    const base64_url = token.split(".")[1]
    const base64 = base64_url.replace(/-/g, "+").replace(/_/g, "/")
    const json_payload = decodeURIComponent(window.atob(base64).split("").map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(""))

    return JSON.parse(json_payload)
}

export interface Claims {
    employeeId: number
}
