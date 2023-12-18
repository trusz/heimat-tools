import { writable } from 'svelte/store';
import { setContext, getContext } from 'svelte';

export class Filter {
	public max_occupancy_rate = writable(100);
	public min_occupancy_rate = writable(0);
	public max_occupancy_rate_some_or_every = writable<"some" | "every">("some");
	public min_occupancy_rate_some_or_every = writable<"some" | "every">("every");
	public employee = writable("");
	public project = writable("");
}


const key={}

export function filter_context_get(): Filter{
	return getContext<Filter>(key)
}

export function filter_context_init(){
	setContext(key, new Filter())
}