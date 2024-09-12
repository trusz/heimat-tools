import type { Task } from "./task"

export type Project_v2 = {
    id:    number
    name:  string
}

export function new_project_v2(id: number, name: string, tasks: Task[] = []): Project_v2 {
    return {
        id,
        name,
    }
}


export type Project_Allocation = {
	id: number
	project_role: string
	is_staffed: boolean
}