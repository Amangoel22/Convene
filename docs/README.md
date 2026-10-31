# Convene documentation

> A practical map of the product, its data, its workflows, and its deployment path.

```text
UNDERSTAND ─────── BUILD ─────── OPERATE ─────── SHIP
  scope       architecture       workflows      setup
  database    permissions        import/export  deployment
                                              themes
```

Start with the root [README](../README.md) for the visual product overview, then use this index when you need implementation detail.

Convene is an event operations workspace for college events. It manages schedules, teams, participants, tasks, duties, inventory, resources, and issues in event-scoped experiences for organizers and participants.

## Documents

- [Scope](01-scope.md)
- [Architecture](02-architecture.md)
- [Database](03-database.md)
- [Permissions](04-permissions.md)
- [Workflows](05-workflows.md)
- [API](06-api.md)
- [Local Setup](07-setup.md)
- [Deployment](08-deployment.md)
- [Import and Export](09-import-export.md)
- [Themes and UI](10-themes.md)

The Prisma schema at `backend/prisma/schema.prisma` is the source of truth for the database.
