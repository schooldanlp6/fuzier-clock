const { St, Clutter } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const GLib = imports.gi.GLib;
const Lang = imports.lang;

var EVENTS = [
    { label: "Breakfast", hour: 8, minute: 0 },
    { label: "Lunch", hour: 12, minute: 20 },
    { label: "At Home", hour: 17, minute: 30 },
    { label: "Dinner", hour: 19, minute: 0 },
    { label: "Bed", hour: 22, minute: 0 }
];

var fuzzyClockLabel;
var fuzzyClockContainer;
var intervalId;

function getFuzzyTime() {
    var now = GLib.DateTime.new_now_local();
    var currentHour = now.get_hour();
    var currentMinute = now.get_minute();

    var currentTimeInMinutes = currentHour * 60 + currentMinute;

    for (let i = 0; i < EVENTS.length; i++) {
        let event = EVENTS[i];
        let eventTimeInMinutes = event.hour * 60 + event.minute;

        // If current time is less than or equal to event time, return that event.
        if (currentTimeInMinutes <= eventTimeInMinutes) {
            return event.label;
        }
    }

    // If no event matches (i.e., it's after the last event of the day), return the last event.
    return EVENTS[EVENTS.length - 1].label;
}

function setText() {
    var desiredText = getFuzzyTime();
    fuzzyClockLabel.set_text(desiredText);
}

function enable() {
    // Create a new panel button
    fuzzyClockContainer = new PanelMenu.Button(0.0, "FuzzyClock", false);

    // Create a new label
    fuzzyClockLabel = new St.Label({
        text: 'FuzzyClock',
        y_align: Clutter.ActorAlign.CENTER
    });

    // Add the label to the container
    fuzzyClockContainer.add_child(fuzzyClockLabel);

    // Add the container to the panel
    Main.panel.addToStatusArea('fuzzy-clock', fuzzyClockContainer);

    // Set the initial text
    setText();

    // Update every minute
    intervalId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 60, Lang.bind(this, function () {
        setText();
        return true; // Repeat the timeout
    }));
}

function disable() {
    if (fuzzyClockContainer) {
        // Remove the interval
        if (intervalId) {
            GLib.Source.remove(intervalId);
            intervalId = null;
        }

        // Destroy the container
        fuzzyClockContainer.destroy();
        fuzzyClockContainer = null;
        fuzzyClockLabel = null;
    }
}

