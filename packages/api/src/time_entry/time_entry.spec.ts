import { suite, test, expect } from "vitest"

import {
    type Time_Entry,
    date_to_slot,
    slot_to_minutes,
    time_entry_execute_action,
    time_entry_overlap,
    Time_Entry_Action,
    Time_Entry_State,
    new_time_entry,
} from "./time_entry"

suite("time_entry", () => {
    suite("date_to_slot", () => {
        interface Test_Case {
            desc:                 string
            date:                 Date
            start_hour:           number
            step_in_minutes:      number
            expected_slot_number: number
        }

        const feature_tests: Test_Case[] = [
            {
                desc:                 "first slot",
                date:                 new Date("2000-01-01 06:00"),
                start_hour:           6,
                step_in_minutes:      15,
                expected_slot_number: 0,
            },
            {
                desc:                 "second slot",
                date:                 new Date("2000-01-01 06:15"),
                start_hour:           6,
                step_in_minutes:      15,
                expected_slot_number: 1,
            },
            {
                desc:                 "somewhere slot",
                date:                 new Date("2000-01-01 09:00"),
                start_hour:           6,
                step_in_minutes:      15,
                expected_slot_number: 12,
            },
            {
                desc:                 "30 min step",
                date:                 new Date("2000-01-01 08:45"),
                start_hour:           6,
                step_in_minutes:      30,
                expected_slot_number: 5,
            },
        ]

        feature_tests.forEach(test_feature)

        function test_feature (tc: Test_Case): void {
            test(tc.desc, () => {
                const actual_slot_number = date_to_slot(
                    tc.date,
                    tc.start_hour,
                    tc.step_in_minutes,
                )

                expect(actual_slot_number).toEqual(tc.expected_slot_number)
            })
        }
    })

    suite("slot_to_minutes", () => {
        interface Test_Case {
            desc:                     string
            start_hour:               number
            step_in_minutes:          number
            slot:                     number
            expected_date_in_minutes: number
        }

        const slot_to_date_tests: Test_Case[] = [
            {
                desc:                     "first slot",
                start_hour:               6,
                step_in_minutes:          15,
                slot:                     1,
                expected_date_in_minutes: 375,
            },
            {
                desc:                     "some slot",
                start_hour:               6,
                step_in_minutes:          15,
                slot:                     7,
                expected_date_in_minutes: 465,
            },
        ]

        slot_to_date_tests.forEach(test_feature)

        function test_feature (tc: Test_Case) {
            test(tc.desc, () => {
                const acutal_minutes = slot_to_minutes(
                    tc.slot,
                    tc.start_hour,
                    tc.step_in_minutes,
                )
                expect(acutal_minutes).toEqual(tc.expected_date_in_minutes)
            })
        }
    })

    suite("slot_to_minutes and date_to_slot", () => {
        interface Test_Case {
            desc:            string
            start_hour:      number
            step_in_minutes: number
            slot:            number
        }

        const test_cases: Test_Case[] = [
            {
                desc:            "there and back",
                start_hour:      9,
                step_in_minutes: 15,
                slot:            1,
            },
        ]

        for (const tc of test_cases) {
            test(tc.desc, () => {
                const mins = slot_to_minutes(tc.slot, tc.start_hour, tc.step_in_minutes)
                const hours = Math.floor(mins / 60)
                const minutes = mins % 60
                const d = new Date()
                d.setMinutes(minutes)
                d.setHours(hours)
                const slot = date_to_slot(d, tc.start_hour, tc.step_in_minutes)
                // console.log({level:"test", msg:"there and back", mins, now: new Date().toLocaleTimeString("de"), date: d.toLocaleTimeString("de-DE"), slot})
                expect(slot).toEqual(tc.slot)
            })
        }
    })

    suite("state_machine", () => {
        interface Test_Case {
            desc:           string
            start_state:    Time_Entry_State
            action:         Time_Entry_Action
            expected_state: Time_Entry_State
        }

        const test_cases: Test_Case[] = [
            {
                desc:           "Sate can stay the same",
                start_state:    Time_Entry_State.In_Progress,
                action:         Time_Entry_Action.Creation_Progression,
                expected_state: Time_Entry_State.In_Progress,
            },
            {
                desc:           "Sate can change",
                start_state:    Time_Entry_State.In_Progress,
                action:         Time_Entry_Action.Form_Finished,
                expected_state: Time_Entry_State.ToSave,
            },
        ]

        for (const tc of test_cases) {
            test(tc.desc, () => {
                const time_entry: Time_Entry = new_time_entry(
                    undefined,
                    undefined,
                    undefined,
                    tc.start_state,
                )

                const modified_time_entry = time_entry_execute_action(time_entry, tc.action)
                expect(modified_time_entry).toHaveProperty("state", tc.expected_state)
            })
        }
    })

    // overview image: https://i.stack.imgur.com/0c6q0.png
    // stackoverflow: https://stackoverflow.com/questions/325933/determine-whether-two-date-ranges-overlap
    suite("overlapping", () => {
        interface Test_Case {
            desc:                 string
            time_entry_a:         Partial<Time_Entry>
            time_entry_b:         Partial<Time_Entry>
            expected_overlapping: boolean
        }

        const test_cases: Test_Case[] = [
            {
                desc:         "after",
                time_entry_a: {
                    start: new Date("2000-01-01 10:00"),
                    end:   new Date("2000-01-01 11:00"),
                    state: Time_Entry_State.In_Progress,
                },
                time_entry_b: {
                    start: new Date("2000-01-01 11:15"),
                    end:   new Date("2000-01-01 11:30"),
                    state: Time_Entry_State.In_Progress,
                },
                expected_overlapping: false,
            },
            {
                desc:         "start touching",
                time_entry_a: {
                    start: new Date("2000-01-01 10:00"),
                    end:   new Date("2000-01-01 11:00"),
                    state: Time_Entry_State.In_Progress,
                },
                time_entry_b: {
                    start: new Date("2000-01-01 11:00"),
                    end:   new Date("2000-01-01 11:30"),
                    state: Time_Entry_State.In_Progress,
                },
                expected_overlapping: false,
            },
            {
                desc:         "start inside",
                time_entry_a: {
                    start: new Date("2000-01-01 10:00"),
                    end:   new Date("2000-01-01 11:00"),
                    state: Time_Entry_State.In_Progress,
                },
                time_entry_b: {
                    start: new Date("2000-01-01 10:45"),
                    end:   new Date("2000-01-01 11:30"),
                    state: Time_Entry_State.In_Progress,
                },
                expected_overlapping: true,
            },
            {
                desc:         "inside start touching",
                time_entry_a: {
                    start: new Date("2000-01-01 10:00"),
                    end:   new Date("2000-01-01 11:00"),
                    state: Time_Entry_State.In_Progress,
                },
                time_entry_b: {
                    start: new Date("2000-01-01 10:00"),
                    end:   new Date("2000-01-01 11:30"),
                    state: Time_Entry_State.In_Progress,
                },
                expected_overlapping: true,
            },
            {
                desc:         "enclosing start touching",
                time_entry_a: {
                    start: new Date("2000-01-01 10:00"),
                    end:   new Date("2000-01-01 11:00"),
                    state: Time_Entry_State.In_Progress,
                },
                time_entry_b: {
                    start: new Date("2000-01-01 10:00"),
                    end:   new Date("2000-01-01 10:30"),
                    state: Time_Entry_State.In_Progress,
                },
                expected_overlapping: true,
            },
            {
                desc:         "enclosing",
                time_entry_a: {
                    start: new Date("2000-01-01 10:00"),
                    end:   new Date("2000-01-01 11:00"),
                    state: Time_Entry_State.In_Progress,
                },
                time_entry_b: {
                    start: new Date("2000-01-01 10:15"),
                    end:   new Date("2000-01-01 10:30"),
                    state: Time_Entry_State.In_Progress,
                },
                expected_overlapping: true,
            },
            {
                desc:         "enclosing end touching",
                time_entry_a: {
                    start: new Date("2000-01-01 10:00"),
                    end:   new Date("2000-01-01 11:00"),
                    state: Time_Entry_State.In_Progress,
                },
                time_entry_b: {
                    start: new Date("2000-01-01 10:15"),
                    end:   new Date("2000-01-01 11:00"),
                    state: Time_Entry_State.In_Progress,
                },
                expected_overlapping: true,
            },
            {
                desc:         "inside",
                time_entry_a: {
                    start: new Date("2000-01-01 10:00"),
                    end:   new Date("2000-01-01 11:00"),
                    state: Time_Entry_State.In_Progress,
                },
                time_entry_b: {
                    start: new Date("2000-01-01 09:30"),
                    end:   new Date("2000-01-01 11:30"),
                    state: Time_Entry_State.In_Progress,
                },
                expected_overlapping: true,
            },
            {
                desc:         "inside end touching",
                time_entry_a: {
                    start: new Date("2000-01-01 10:00"),
                    end:   new Date("2000-01-01 11:00"),
                    state: Time_Entry_State.In_Progress,
                },
                time_entry_b: {
                    start: new Date("2000-01-01 09:30"),
                    end:   new Date("2000-01-01 11:00"),
                    state: Time_Entry_State.In_Progress,
                },
                expected_overlapping: true,
            },
            {
                desc:         "end inside",
                time_entry_a: {
                    start: new Date("2000-01-01 10:00"),
                    end:   new Date("2000-01-01 11:00"),
                    state: Time_Entry_State.In_Progress,
                },
                time_entry_b: {
                    start: new Date("2000-01-01 10:30"),
                    end:   new Date("2000-01-01 11:30"),
                    state: Time_Entry_State.In_Progress,
                },
                expected_overlapping: true,
            },
            {
                desc:         "end touching",
                time_entry_a: {
                    start: new Date("2000-01-01 10:00"),
                    end:   new Date("2000-01-01 11:00"),
                    state: Time_Entry_State.In_Progress,
                },
                time_entry_b: {
                    start: new Date("2000-01-01 11:00"),
                    end:   new Date("2000-01-01 11:30"),
                    state: Time_Entry_State.In_Progress,
                },
                expected_overlapping: false,
            },
            {
                desc:         "before",
                time_entry_a: {
                    start: new Date("2000-01-01 10:00"),
                    end:   new Date("2000-01-01 11:00"),
                    state: Time_Entry_State.In_Progress,
                },
                time_entry_b: {
                    start: new Date("2000-01-01 11:15"),
                    end:   new Date("2000-01-01 11:30"),
                    state: Time_Entry_State.In_Progress,
                },
                expected_overlapping: false,
            },
        ]

        for (const tc of test_cases) {
            test(tc.desc, () => {
                const time_entry_a = new_time_entry(
                    undefined,
                    tc.time_entry_a.start,
                    tc.time_entry_a.end,
                    tc.time_entry_a.state,
                )
                const time_entry_b = new_time_entry(
                    undefined,
                    tc.time_entry_b.start,
                    tc.time_entry_b.end,
                    tc.time_entry_b.state,
                )
                const overlap = time_entry_overlap(time_entry_a, time_entry_b)
                expect(overlap).toEqual(tc.expected_overlapping)
            })
        }
    })
})
