## Data redesign

- Clean up factory recipeList/object data
  - Should be object with list computed, perhaps?
  - Easier to look up that way
- Remove the floor number from ID values, to simplify recipe moving and floor removal
- Ensure link IDs only require source/sink/material, since that will always be unique
- Should floor IDs be auto-generated instead of indices?

## UI Testing

- Component + E2E tests

## Cloud sync

- Google drive
- icon in top right, sign in
- new SyncStore to select factories, email, etc

## Collaborate

- Simple websocket server with HTTP endpoints for init, connect, build link, build recipe
- Simple path param for session name, password sent as first message
- Return failure on init if session name already in use
- Button in app bar to enter host/port, when connect pull the init'd factories
  - factories selected by initiator
- Clear session once all clients disconnect
