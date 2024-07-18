// History type is already used by the standard library
export type OppHistory = {
	id: number
	timestamp: string
	revisionProperties: RevisionProperty[]
}

export type RevisionProperty = {
	id:number
	property: string
	oldValue: string
	newValue: string
}
