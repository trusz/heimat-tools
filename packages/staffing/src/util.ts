export function waitForElement(selector:string) {
	return new Promise((resolve) => {
		const element = document.querySelector(selector) as HTMLElement | null
		if (isVisible(element)) {
			resolve(element)
			return
		}

		const observer = new MutationObserver((mutations) => {
			const targetElement = document.querySelector(selector) as HTMLElement | null
			if (targetElement && isVisible(targetElement)) {
				observer.disconnect()
				resolve(targetElement)
			}
		});

		observer.observe(document.body, { attributes: true, childList: true, subtree: true });
	});
}

function isVisible(element:HTMLElement | null) {
	if (!element) {
		return false;
	}
	return element.offsetParent !== null;
}