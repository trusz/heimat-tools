<script lang="ts">
    import "../app.pcss";
    import { AppShell } from "$lib/components/ui/app-shell";
    import { Auth_Module, context_api_create, context_api_get, Allocation, Employee } from "@heimtools/api"
    import { Employee_List, type Allocation_Map } from "$lib/components/ui/employee_list"
    import {filter_context_init} from "./filter"
    import Sidebar from "./sidebar.svelte"
    

    // 
    // INPUT
    // 


	// 
	// Config
	// 
    const base_url = window.location.origin

    // 
    // Auth
    // 
    let auth_module: Auth_Module
    auth_module = new Auth_Module();
    const jwt = auth_module.jwt_get()

    // 
    // API
    // 
    context_api_create()
    let api = context_api_get()
    api.set_base_url(base_url)

    if(jwt && jwt !== ""){
        api.jwt_set(jwt)
    }

    filter_context_init()

    

    let emps: Employee[] = []
    let allocation_map: Allocation_Map = {}
    async function init(){
        emps = await api.fetch_employee_list()
        // emps.forEach( emp => allocation_map[emp.id] = undefine)

        emps.forEach(emp => {
            api
                .fetch_allocation(emp.id)
                .then(allocations => {
                    allocation_map[emp.id] = allocations
                })
        })
        

    }
	init()


    let group_by_project: boolean = false
    
</script>

<AppShell>
    <h1 slot="header" class="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Allocation Overview
    </h1>

    <Sidebar slot="sidebar" {allocation_map} />
    <Employee_List slot="content" employees={emps} {allocation_map} />

</AppShell>

<style>

</style>