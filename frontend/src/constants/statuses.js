// Purpose: centralize status labels and semantic presentation classes shared by the UI.
export const PARTICIPANT_STATUSES = Object.freeze([
  "Checked In",
  "Confirmed",
  "Unconfirmed",
  "Absent",
  "Withdrawn",
  "Rejected",
]);

export const TEAM_STATUSES = Object.freeze([
  "Unconfirmed",
  "Confirmed",
  "Checked In",
  "Rejected",
]);

export const PARTICIPANT_STATUS_PILL_CLASSES = Object.freeze({
  Unconfirmed: "bg-token-warning/10 text-token-warning border-token-warning/20",
  Confirmed: "bg-token-success/10 text-token-success border-token-success/20",
  "Checked In": "bg-token-accent/10 text-token-accent border-token-accent/20",
  Absent: "bg-token-field text-token-secondary border-token-subtle",
  Withdrawn: "bg-token-info/18 text-token-info border-token-info/35",
  Rejected: "bg-token-error/10 text-token-error border-token-error/20",
});

export const PARTICIPANT_STATUS_TEXT_CLASSES = Object.freeze({
  Unconfirmed: "text-token-warning",
  Confirmed: "text-token-success",
  "Checked In": "text-token-success",
  Absent: "text-token-secondary",
  Withdrawn: "text-token-secondary",
  Rejected: "text-token-error",
});

export const STATUS_TEXT_CLASSES = Object.freeze({
  Todo: "text-token-muted",
  "In Progress": "text-token-accent",
  Done: "text-token-success",
  Unconfirmed: "text-token-warning",
  Registered: "text-token-warning",
  Confirmed: "text-token-success",
  "Checked In": "text-token-accent",
  Rejected: "text-token-error",
  Completed: "text-token-success",
  LIVE: "text-token-success",
  current: "text-token-accent",
  complete: "text-token-muted",
  upcoming: "text-token-secondary",
});

export const PRIORITY_TEXT_CLASSES = Object.freeze({
  Critical: "text-token-error",
  High: "text-token-warning",
  Medium: "text-token-accent",
  Low: "text-token-muted",
});
