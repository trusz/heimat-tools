export interface Task {
    id:   number
    name: string
}

export function new_task (id: number, name: string): Task {
    return {
        id,
        name,
    }
}
