// simulate data storage and basic CRUD actions

class EventCRUD {
	constructor() {
		this.idSeed = Date.now();
		this.events = [

			{ "id": 1, "start_date": new Date("2025-04-01T12:00:00"), "end_date": new Date("2025-04-01T17:00:00"), "text": "Event 1: Random Activity" },
			{ "id": 2, "start_date": new Date("2025-04-04T10:00:00"), "end_date": new Date("2025-04-04T11:00:00"), "text": "Event 2: Random Activity" },
			{ "id": 3, "start_date": new Date("2025-04-23T01:00:00"), "end_date": new Date("2025-04-23T03:00:00"), "text": "Event 3: Random Activity" },
			{ "id": 4, "start_date": new Date("2025-04-06T19:00:00"), "end_date": new Date("2025-04-07T00:00:00"), "text": "Event 4: Random Activity" },
			{ "id": 5, "start_date": new Date("2025-04-21T12:00:00"), "end_date": new Date("2025-04-21T15:00:00"), "text": "Event 5: Random Activity" },
			{ "id": 6, "start_date": new Date("2025-04-01T22:00:00"), "end_date": new Date("2025-04-02T01:00:00"), "text": "Event 6: Random Activity" },
			{ "id": 7, "start_date": new Date("2025-04-29T20:00:00"), "end_date": new Date("2025-04-30T01:00:00"), "text": "Event 7: Random Activity" },
			{ "id": 8, "start_date": new Date("2025-04-19T12:00:00"), "end_date": new Date("2025-04-19T14:00:00"), "text": "Event 8: Random Activity" },
			{ "id": 9, "start_date": new Date("2025-04-21T01:00:00"), "end_date": new Date("2025-04-21T05:00:00"), "text": "Event 9: Random Activity" },
			{ "id": 10, "start_date": new Date("2025-04-15T22:00:00"), "end_date": new Date("2025-04-16T00:00:00"), "text": "Event 10: Random Activity" },
			{ "id": 11, "start_date": new Date("2025-04-22T13:00:00"), "end_date": new Date("2025-04-22T18:00:00"), "text": "Event 11: Random Activity" },
			{ "id": 12, "start_date": new Date("2025-04-28T14:00:00"), "end_date": new Date("2025-04-28T18:00:00"), "text": "Event 12: Random Activity" },
			{ "id": 13, "start_date": new Date("2025-04-24T11:00:00"), "end_date": new Date("2025-04-24T16:00:00"), "text": "Event 13: Random Activity" },
			{ "id": 14, "start_date": new Date("2025-04-20T14:00:00"), "end_date": new Date("2025-04-20T15:00:00"), "text": "Event 14: Random Activity" },
			{ "id": 15, "start_date": new Date("2025-05-02T04:00:00"), "end_date": new Date("2025-05-02T08:00:00"), "text": "Event 15: Random Activity" }
		];

	}


	uid = () => `ID:${this.idSeed++}`;
	load = (from, to) => {
		if(!from || !to) {
			return this.events.slice();
		}
		return this.events.filter(e => e.start_date.valueOf() < to.valueOf() && e.end_date.valueOf() > from.valueOf());
	}
	insert = (params) => {
		const event = { ...params, id: this.uid() };
		this.events.push(event);
		let action = "inserted";
		if(event.deleted) {
			// delete a single occurrence from  recurring series
			action = "deleted";
		}
		return {
			action,
			tid: event.id,
			item: event
		};
	};
	update = (id, changes) => {
		const eventIndex = this.events.findIndex(event => String(event.id) === String(id));
		this.events[eventIndex] = {...this.events[eventIndex], ...changes};
		const savedEvent = this.events[eventIndex];
		if(savedEvent.rrule && !savedEvent.recurring_event_id){
			// all modified occurrences must be deleted when we update recurring series
			// https://docs.dhtmlx.com/scheduler/server_integration.html#savingrecurringevents
			this.events = this.events.filter(e => String(e.recurring_event_id) !== String(savedEvent.id))
		}

		return {
			action: "updated",
			item: savedEvent
		};
	};

	delete = (id) => {
		const eventIndex = this.events.findIndex(event => String(event.id) === String(id));
		const deletedEvent = this.events[eventIndex];
		if(deletedEvent.recurring_event_id){
			// deleting modified occurrence from recurring series
			// If an event with the recurring_event_id value was deleted - it needs updating with .deleted = true instead of deleting.
			deletedEvent.deleted = true;
			return this.update(id, deletedEvent);

		}

		if(deletedEvent.rrule) {
			// if a recurring series was deleted - delete all modified occurrences of the series
			this.events = this.events.filter(e => String(e.recurring_event_id) !== String(deletedEvent.id))
		}

		this.events = this.events.filter(e => String(e.id) !== String(deletedEvent.id));

		return {
			action: "deleted"
		}
	};
	
}

module.exports = EventCRUD;