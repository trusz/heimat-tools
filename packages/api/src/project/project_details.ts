

export type Project_Details = {
    id:    		 number
    name:  		 string
	allocations: Allocation[]
	priority:	 string
}

export type Allocation = {
	id: 		  number,
	project_role: string,
	is_staffed:   boolean,
	start: 		  Date,
	end: 		  Date,
}

export type Custom_Field = {
	id: number,
	name: string,
	option_value: {
		id: number,
		value: string
	}
}