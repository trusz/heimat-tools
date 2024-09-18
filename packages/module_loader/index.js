(async function() {
    'use strict';
    
	let params = new URLSearchParams(document.location.search); 
	
	const module_name = params.get("module");
	if(!module_name){ 
		console.error("no module given, stopping")
		return
	}

	const heimat_base_url = "https://heimat.sprinteins.com"
	let heimat_module_path = params.get("heimat_module_path")
	if(!heimat_module_path){
		console.error("no heimat module path given, stopping")
		return
	}

	const root_selector = params.get("root_selector")
	if(!root_selector){
		console.error("no root selector given, stopping")
		return
	}

	const module_url = generate_module_url(module_name)
    const target_url = `${heimat_base_url}/${heimat_module_path}`

    await wait_for_element_and_url(root_selector, target_url)

    init(root_selector, module_url)

    //
    // FUNCTIONS
    //

    function wait_for_element_and_url(selector, url) {
	return new Promise((resolve) => {
		const element = document.querySelector(selector)

		if (is_visible(element) && is_current_url_equal(url)) {
			resolve(element)
			return
		}

		const observer = new MutationObserver((mutations) => {
            if(!is_current_url_equal(url)){ return; }

			const targetElement = document.querySelector(selector)
			if (targetElement && is_visible(targetElement)) {
				observer.disconnect()
				resolve(targetElement)
			}
		});

        observer.observe(document.body, { attributes: true, childList: true, subtree: true });
    });
   }


    function is_current_url_equal(url){
        const {origin, pathname} = window.location
        const currentURL = origin+pathname

        return currentURL === url
    }


    function is_visible(element) {
        if (!element) {
            return false;
        }
        return element.offsetParent !== null;
    }

	/**
	 * 
	 * @param {string} root_selector 
	 * @param {string} module_url 
	 */
    async function init(root_selector, module_url){

        const root = document.querySelector(root_selector);
		if(!root){
			console.error("could not find element based on root selector, stopping")
			return;
		}

        root.id="heimat-tool"
        root.innerHTML = "";

        const module = await import(`${module_url}?cachbuster=${Math.random()}`);
        const initFn = module.default;
        initFn();
    }


})();

/**
 * 
 * @param {string} module 
 * @returns string
 */
function generate_module_url(module){
	const base_url = "https://tamasruss.com/heimat-tools/packages"
	const file = "index.js"

	const module_url = `${base_url}/${module}/${file}`

	return module_url
}