# Permissions

## Event membership

| Action | Organizer | Participant |
|---|---:|---:|
| View event details | yes | yes |
| View participant status | yes | no |
| View organizer teams/tasks/duties | yes | no |
| View participant own QR | future API | yes |
| Verify entry QR | yes, same event only | no |
| Edit participant check-in | yes | no |

## Organizer access

| Action | Lead | Member |
|---|---:|---:|
| Create/edit event operations | yes | no |
| Create/edit stages | yes | no |
| Create tasks | yes | no |
| Assign duties | yes | no |
| Update assigned operational work | yes | limited by endpoint policy |
| View event operational data | yes | yes |

`EventMembership` is the broad gate. `OrgAccess` is the lead/member gate. Never authorize by frontend role state alone.

## Isolation requirements

- Resolve the target record first, then derive its `eventId`.
- Check membership for that exact event.
- Never trust an event ID supplied only in a body when the target record already has an event.
- QR verification must check organizer membership for the participant's event.
