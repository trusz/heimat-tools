

export type Project_Details = {
    id:    		 number
    name:  		 string
	allocations: Allocation[]
}

export type Allocation = {
	id: 		  number,
	project_role: string,
	is_staffed:   boolean
}