import { describe, expect, it } from "vitest"
import { Time_Entries } from "./time_entries"
import { Time_Entry_State, type Time_Entry } from "./time_entry"
import { get } from "svelte/store"
// import { Time_Entry_Action, time_entry_execute_action, Time_Entry_State, type Time_Entry } from "./time_entry"

type Test_Action = (tes: Time_Entries) => void

describe("time_entries", () => {
    type Test_Case = {
        desc:                                      string
        time_entries_to_create:                    Time_Entry[]
        expected_time_entries_in_store:            Time_Entry[]
        expected_time_entries_in_store_to_save?:   Time_Entry[]
        expected_time_entries_in_store_to_delete?: Time_Entry[]
        actions?:                                  Test_Action[]
    }

    const feature_test: Test_Case[] = [
        {
            desc: "added entries are in the store",

            time_entries_to_create: [
                make_time_entry({ id: 1 }),
                make_time_entry({ id: 2 }),
            ],

            // order is deliberatly changed
            // so that our test don't depend on the order
            // but check the each entry separately
            expected_time_entries_in_store: [
                make_time_entry({ id: 2 }),
                make_time_entry({ id: 1 }),
            ],
        },
        {
            desc: "selecting an entry",

            time_entries_to_create: [
                make_time_entry({ id: 1 }),
                make_time_entry({ id: 2 }),
            ],
            actions: [
                (tes) => { tes.select_time_entry(1) },
            ],
            expected_time_entries_in_store: [
                make_time_entry({ id: 1, is_selected: true }),
                make_time_entry({ id: 2 }),
            ],
        },
        {
            desc: "selecting an entry, deselects the previous one",

            time_entries_to_create: [
                make_time_entry({ id: 1, is_selected: false }),
                make_time_entry({ id: 2, is_selected: true }),
            ],
            actions: [
                (tes) => { tes.select_time_entry(1) },
            ],
            expected_time_entries_in_store: [
                make_time_entry({ id: 1, is_selected: true }),
                make_time_entry({ id: 2, is_selected: false }),
            ],
        },
        {
            desc: "selecting additional entries is possible without deselecting the previous one",

            time_entries_to_create: [
                make_time_entry({ id: 1, is_selected: false }),
                make_time_entry({ id: 2, is_selected: true }),
            ],
            actions: [
                (tes) => { tes.select_additional_time_entry(1) },
            ],
            expected_time_entries_in_store: [
                make_time_entry({ id: 1, is_selected: true }),
                make_time_entry({ id: 2, is_selected: true }),
            ],
        },
        {
            desc: "it can reset selection",

            time_entries_to_create: [
                make_time_entry({ id: 1, is_selected: false }),
                make_time_entry({ id: 2, is_selected: true }),
            ],
            actions: [
                (tes) => { tes.reset_selected_time_entry() },
            ],
            expected_time_entries_in_store: [
                make_time_entry({ id: 1, is_selected: false }),
                make_time_entry({ id: 2, is_selected: false }),
            ],
        },
        {
            desc: "it can flag elements for saving",

            time_entries_to_create: [
                make_time_entry({ id: 1 }),
                make_time_entry({ id: 2 }),
            ],
            actions: [
                (tes) => { tes.flag_to_save(2) },
            ],
            expected_time_entries_in_store: [
                make_time_entry({ id: 1 }),
                make_time_entry({ id: 2, state: Time_Entry_State.ToSave  }),
            ],
            expected_time_entries_in_store_to_save: [
                make_time_entry({ id: 2, state: Time_Entry_State.ToSave  }),
            ],
        },
        {
            desc: "it can flag elements for deletion",

            time_entries_to_create: [
                make_time_entry({ id: 1 }),
                make_time_entry({ id: 2 }),
            ],
            actions: [
                (tes) => { tes.flag_to_delete(2) },
            ],
            expected_time_entries_in_store: [
                make_time_entry({ id: 1 }),
                make_time_entry({ id: 2, state: Time_Entry_State.ToDelete  }),
            ],
            expected_time_entries_in_store_to_delete: [
                make_time_entry({ id: 2, state: Time_Entry_State.ToDelete  }),
            ],
        },
        {
            desc: "it can delete elements",

            time_entries_to_create: [
                make_time_entry({ id: 1 }),
                make_time_entry({ id: 2 }),
            ],
            actions: [
                (tes) => { tes.delete(2) },
            ],
            expected_time_entries_in_store: [
                make_time_entry({ id: 1 }),
            ],
        },
        {
            desc: "it can delete multiple elements at once",

            time_entries_to_create: [
                make_time_entry({ id: 1 }),
                make_time_entry({ id: 2 }),
                make_time_entry({ id: 3 }),
            ],
            actions: [
                (tes) => { tes.delete_batch([1, 3]) },
            ],
            expected_time_entries_in_store: [
                make_time_entry({ id: 2 }),
            ],
        },
        {
            desc: "it can update entries",

            time_entries_to_create: [
                make_time_entry({ id: 1, description: "before update" }),
            ],
            actions: [
                (tes) => { tes.update_by_id(1, { description: "after update" }) },
            ],
            expected_time_entries_in_store: [
                make_time_entry({ id: 1, description: "after update" }),
            ],
        },
        {
            desc: "it can update multiple entries at once",

            time_entries_to_create: [
                make_time_entry({ id: 1, description: "before update" }),
                make_time_entry({ id: 2, description: "before update" }),
                make_time_entry({ id: 3, description: "before update" }),
            ],
            actions: [
                (tes) => {
                    tes.update_by_batch([
                        { id: 1, time_entry: { description: "after update" } },
                        { id: 2, time_entry: { description: "after update" } },
                        { id: 3, time_entry: { description: "after update" } },
                    ])
                },
            ],
            expected_time_entries_in_store: [
                make_time_entry({ id: 1, description: "after update" }),
                make_time_entry({ id: 2, description: "after update" }),
                make_time_entry({ id: 3, description: "after update" }),
            ],
        },
        {
            desc: "setting a time range automatically flags for saving",

            time_entries_to_create: [
                make_time_entry({ id: 1 }),
            ],
            actions: [
                (tes) => {
                    tes.set_time_range(
                        1,
                        new Date("2000-01-01 13:37"),
                        new Date("2000-01-01 14:37"),
                    )
                },
            ],
            expected_time_entries_in_store: [
                make_time_entry({
                    id:    1,
                    start: new Date("2000-01-01 13:37"),
                    end:   new Date("2000-01-01 14:37"),
                    state: Time_Entry_State.ToSave,
                }),
            ],
            expected_time_entries_in_store_to_save: [
                make_time_entry({
                    id:    1,
                    start: new Date("2000-01-01 13:37"),
                    end:   new Date("2000-01-01 14:37"),
                    state: Time_Entry_State.ToSave,
                }),
            ],
        },
        {
            desc: "update an entry by time range",

            time_entries_to_create: [
                make_time_entry({
                    id:          1,
                    description: "this will be updated",
                    start:       new Date("2006-07-13 08:00"),
                    end:         new Date("2006-07-13 10:00"),
                }),
                make_time_entry({
                    id:          2,
                    description: "this is to make sure we not just replace everything",
                    start:       new Date("2006-07-14 14:00"),
                    end:         new Date("2006-07-14 15:00"),
                }),
            ],
            actions: [
                (tes) => {
                    tes.replace_time_entries_by_time_range([
                        make_time_entry({
                            id:          101,
                            description: "this will be updated",
                            start:       new Date("2006-07-13 08:00"),
                            end:         new Date("2006-07-13 10:00"),
                        }),
                    ])
                },
            ],
            expected_time_entries_in_store: [
                make_time_entry({
                    id:          101,
                    description: "this will be updated",
                    start:       new Date("2006-07-13 08:00"),
                    end:         new Date("2006-07-13 10:00"),
                }),
                make_time_entry({
                    id:          2,
                    description: "this is to make sure we not just replace everything",
                    start:       new Date("2006-07-14 14:00"),
                    end:         new Date("2006-07-14 15:00"),
                }),
            ],
            // expected_time_entries_in_store_to_save: [
            //     make_time_entry({
            //         id:    1,
            //         start: new Date("2000-01-01 13:37"),
            //         end:   new Date("2000-01-01 14:37"),
            //         state: Time_Entry_State.ToSave,
            //     }),
            // ],
        },

    ]

    feature_test.forEach(test_feature)

    function test_feature (tc: Test_Case) {
        it(tc.desc, () => {
            // Arrange
            const tes = new Time_Entries()
            const actions = tc.actions ?? []

            // Act
            tc.time_entries_to_create.forEach((te) => { tes.create_time_entry(te) })
            actions.forEach((action) => { action(tes) })

            // Assert
            const all_time_entries = get(tes.entries$)
            expect(all_time_entries).toHaveLength(tc.expected_time_entries_in_store.length)
            tc.expected_time_entries_in_store.forEach((expected_te) => {
                expect(all_time_entries).toContainEqual(expected_te)
            })

            const time_entries_to_save = get(tes.entries_to_save$)
            expect(time_entries_to_save).toHaveLength(tc.expected_time_entries_in_store_to_save?.length ?? 0)
            tc.expected_time_entries_in_store_to_save?.forEach((expected_te) => {
                expect(time_entries_to_save).toContainEqual(expected_te)
            })

            const time_entries_to_delete = get(tes.entries_to_delete$)
            expect(time_entries_to_delete).toHaveLength(tc.expected_time_entries_in_store_to_delete?.length ?? 0)
            tc.expected_time_entries_in_store_to_delete?.forEach((expected_te) => {
                expect(time_entries_to_delete).toContainEqual(expected_te)
            })
        })
    }
})

function make_time_entry (overrides?: Partial<Time_Entry>): Time_Entry {
    return {
        ...default_time_entry,
        ...overrides,
    }
}

const now = new Date()

const default_time_entry: Time_Entry = {
    id:          1,
    start:       now,
    end:         now,
    state:       Time_Entry_State.In_Progress,
    project:     { id: 1, name: "project 1", tasks: [{ id: 101, name: "task 1" }] },
    task:        { id: 101, name: "task 1" },
    description: "test",
    is_selected: false,
}
