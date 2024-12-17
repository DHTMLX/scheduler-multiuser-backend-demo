# Live Update Backend Example for DHTMLX Scheduler

This repository contains a demonstration of a backend compatible with the DHTMLX Scheduler [Live Updates](https://docs.dhtmlx.com/scheduler/multiuser_live_updates.html) module.

## How to Run

- `npm install`
- `npm run start`

## App Structure

- **crud.js** - Mock data layer. Implements Create/Read/Update/Delete actions using in-memory data storage.
- **websocket.js** - WebSocket transport layer. Broadcasts real-time updates to connected users. Uses `sanitize-html` to sanitize the data.
- **index.js** - Express application entry point.
- **public/index.html** - Frontend example with JavaScript initialization code.

## Limitations

This demo does not include permanent data storage and keeps data in memory while the app is running. For real-world scenarios, you will need to implement persistent CRUD operations.

## Related Resources

- Documentation: [https://docs.dhtmlx.com/scheduler/](https://docs.dhtmlx.com/scheduler/)
- DHTMLX Scheduler product page: [https://dhtmlx.com/docs/products/dhtmlxScheduler/](https://dhtmlx.com/docs/products/dhtmlxScheduler/)
