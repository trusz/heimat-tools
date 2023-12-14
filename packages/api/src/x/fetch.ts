export function fetch_get()

export function generate_full_url(path: string): string {
	const base_url = window.location.origin
	const full_url = `${base_url}/${path}`

	return full_url
}