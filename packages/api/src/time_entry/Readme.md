## State machine

```txt
                                                                                     Form- or
                                                 ┌─────────────────────────────────────time ────────────────────┐
                                                 │                                    changes                   │
                                                 ▼                                                              │
                         ┌─────────────────────────┐                    ┌────────────┐                   ┌────────────┐
        create event     │                         │      Form          │            │                   │            │
 ○ ─────────────────────▶│       IN PROGRESS       │────finished───────▶│   SAVING   │────Status: 200───▶│   STABLE   │────▶ ◍
                         │                         │                    │            │                   │            │
                         └─────────────────────────┘                    └────────────┘                   └────────────┘
                          ▲  │      ▲ │          ▲                             │
                          │  │      │ │          │                             │
                      creation      Form         │                         Status:
                     progression  Changes        │                           500
                          │  │      │ │          │                             │
                          └──┘      └─┘          │                             │
                                                 │                             ▼
                                                 │                      ┌────────────┐
                                                 │     Form- or         │            │
                                                 └───────time ──────────│   ERROR    │
                                                        changes         │            │
                                                                        └────────────┘
```

```txt
                                                    ┌─────────────────────────<events:error/stable>─────────────────────────┐
                                                    │                                                                       │
                                                    ▼                                    Λ                                  │
                                             ┌────────────┐                             ╱ ╲                          ┌────────────┐
 After saving all event in─ ─ ─ ─ ┐          │            │                            ╱   ╲                         │            │
 the backend we create a                     │Final Events│────────<events>──────────▶▕     ▏────<events:saving>────▶│     API    │
 new snapshot for the "In         │          │            │                            ╲   ╱                         │            │
 Progress Events" store to                   └────────────┘                             ╲ ╱                          └────────────┘
 bring both store to the          │            │        ▲                                V
 same state                        ─ ─ ─ ─ ─Events      │                             Filter:
                                           Snapshot     │                           State==Saving
                                               │        │
 When we finished modifying ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│─  Events to
 an event all affected                         │     commit
 events must be saved                          ▼        │
                                             ┌────────────┐                               ┌────────────┐
                                             │            │◀──────<changed event>─────────│            │
                                             │In Progress │                               │     UI     │
                                             │   Events   │                               │            │
                                             │            │───────<affected events>──────▶│            │
                                             └────────────┘                 │             └────────────┘

                                                                            │

                                                                            │
                                                                             ─ ─ A change can affect
                                                                                 multiple events

```


## Store Implementation

_Step 1_

```txt
┌Store────────────┐                                                                   ┏━━━━━━━━━━━━━━━┓
│                 │                                                                   ┃ Time Entry: 2 ┃   To Save
│                 │                                                                   ┗━━━━━━━━━━━━━━━┛
│┏━━━━━━━━━━━━━━━┓│                                                                   ┏ ━ ━ ━ ━ ━ ━ ━ ┓
│┃ Time Entry: 1 ┃│                                                                     Time Entry: 2     Saving
│┗━━━━━━━━━━━━━━━┛│                                                                   ┗ ━ ━ ━ ━ ━ ━ ━ ┛
│                 │
│┏━━━━━━━━━━━━━━━┓│
│┃ Time Entry: 2 ┃│
│┣━━━━━━━━━━━━━━━┫│
│┃ Time Entry: 3 ┃│
│┗━━━━━━━━━━━━━━━┛│
│                 │
│                 │◀────────────────────────────────────────┐
└─────────────────┘                                         │
         │                                                  │
         │                                                  │
         │                                                  │
         │                                                  │
         │                                                  │        We set every
         │                                                  │        entries' status to
  status=to-save                                            │        saving as soon es we
         │                                                  │        have them in the
         │                                            set status to  processor
         │                                              "Saving"
         │                                                  │        We have to do this
         │                                                  │        in batches otherwise
         │                                                  │        we would trigger the
         ▼                                                  │        subscriptions with
┌Store: To Save───┐                                         │        every change
│                 │                                         │
│                 │                                         │                                    .───────.
│┏━━━━━━━━━━━━━━━┓│                                    │││││││││││                            ,─'         '─.
│┃ Time Entry: 2 ┃│                                   ┌┴┴┴┴┴┴┴┴┴┴┴┐                       .──╱               ╲
│┣━━━━━━━━━━━━━━━┫│                                 ──┤┌─      ──┐├──               _.───'  ;                 :───.
│┃ Time Entry: 3 ┃│                                 ──┤│         │├──              ╱        :                 ;    ╲
│┗━━━━━━━━━━━━━━━┛│──────────────────────────────────▶┤ Proceccor ├──────────────▶(                 BE              )
│                 │    ┏━━━━━━━━━━━━━━━┓            ──┤│         │├──              `.                             ,'
│                 │    ┃ Time Entry: 2 ┃            ──┤└─      ──┘├──                `────.    '           '_.───'
│                 │    ┣━━━━━━━━━━━━━━━┫              └┬┬┬┬┬┬┬┬┬┬┬┘                        `──────`─────'──'
│                 │    ┃ Time Entry: 3 ┃               │││││││││││
│                 │    ┗━━━━━━━━━━━━━━━┛
│                 │
└─────────────────┘      The whole set of
                         entries are sent for
                         processing.


```

_Step 2_

```txt
┌Store────────────┐
│                 │
│                 │
│┏━━━━━━━━━━━━━━━┓│
│┃ Time Entry: 1 ┃│
│┗━━━━━━━━━━━━━━━┛│
│                 │
│┏ ━ ━ ━ ━ ━ ━ ━ ┓│
│  Time Entry: 2  │
│┣ ━ ━ ━ ━ ━ ━ ━ ┫│
│  Time Entry: 3  │
│┗ ━ ━ ━ ━ ━ ━ ━ ┛│
│                 │
│                 │◀────────────────────────────────────────┐
└─────────────────┘                                         │
         │             Having changed the                   │
         │             status to "Saving"                   │
         │             removes the entries                  │
         │             from the "Store: To                  │
         │             Save" so we only get                 │
         │             new entries in the                   │
  status=to-save       store                                │
         │                                                  │
         │                                            set status to
         │                                              "Saving"
         │                                                  │
         │                                                  │
         │                                                  │
         ▼                                                  │
┌Store: To Save───┐                                         │
│                 │                                         │
│                 │                                         │                                             .───────.
│                 │                                    │││││││││││                                     ,─'         '─.
│                 │                                   ┌┴┴┴┴┴┴┴┴┴┴┴┐                                .──╱               ╲
│                 │                                 ──┤┌─      ──┐├──                        _.───'  ;                 :───.
│                 │                                 ──┤│         │├──                       ╱        :                 ;    ╲
│                 │──────────────────────────────────▶┤ Proceccor ├───────────────────────▶(                 BE              )
│                 │                                 ──┤│         │├──                       `.                             ,'
│                 │                                 ──┤└─      ──┘├──   ┏ ━ ━ ━ ━ ━ ━ ━ ┓     `────.    '           '_.───'
│                 │                                   └┬┬┬┬┬┬┬┬┬┬┬┘       Time Entry: 2             `──────`─────'──'
│                 │                                    │││││││││││      ┣ ━ ━ ━ ━ ━ ━ ━ ┫
│                 │                                                       Time Entry: 3
│                 │                                                     ┗ ━ ━ ━ ━ ━ ━ ━ ┛
└─────────────────┘

                                                                          We sent the
                                                                          entries to the
                                                                          BE
```
