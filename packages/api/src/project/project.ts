import type { Task } from "./task"

export type Project = {
    id:    number
    name:  string
    tasks: Task[]
}

export function new_project (id: number, name: string, tasks: Task[] = []): Project {
    return {
        id,
        name,
        tasks,
    }
}
