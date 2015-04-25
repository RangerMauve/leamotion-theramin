var Leap = require("leapjs");
var ctx = require("audio-context");
var Hoover = require("hoover.js");

var main = document.querySelector("main");

var gain = ctx.createGain();
gain.gain.value = 0.2;
gain.connect(ctx.destination);

var osc = new Hoover(ctx);

osc.frequency.value = 290;
osc.start();

var had_hand = false;
var known_hands = 0;
var known_frequency = 0;
var known_level = 0.2;

Leap.loop(handle_update);

function handle_update(frame) {
	var hands = frame.hands;
	var num_hands = hands.length;
	known_hands = num_hands;
	if (num_hands === 0) {
		check_should_stop();
	} else if (num_hands === 1) {
		check_should_play();
		process_right(hands[0])
	} else if (num_hands === 2) {
		check_should_play();
		var hand0 = hands[0];
		var hand1 = hands[1];
		var hand0x = hand0.palmPosition[0];
		var hand1x = hand1.palmPosition[0];
		if (hand0x < hand1x) {
			process_left(hand0);
			process_right(hand1);
		} else {
			process_left(hand1);
			process_right(hand0);
		}
	}
	render_info();
}

function render_info() {
	main.innerHTML =
		"<div>Hands: " +
		known_hands +
		"</div><div>Frequency: " +
		known_frequency +
		"</div><div>Volume: " +
		known_level +
		"</div>";
}

function check_should_play() {
	if (!had_hand) {
		had_hand = true;
		play();
	}
}

function check_should_stop() {
	if (had_hand) {
		had_hand = false;
		stop();
	}
}

function process_right(hand) {
	var height = hand.palmPosition[1];
	var frequency = 50 + height * 2;
	tune(frequency);
}

function process_left(hand) {
	var height = hand.palmPosition[1];
	var level = height / 400;
	volume(level);
}

function play() {
	console.log("Playing");
	osc.connect(gain);
}

function stop() {
	console.log("Stopping");
	osc.disconnect(gain);
}

function volume(level) {
	known_level = level;
	gain.gain.value = level;
}

function tune(frequency) {
	known_frequency = frequency;
	osc.frequency.exponentialRampToValueAtTime(
		frequency,
		ctx.currentTime + 0.1
	);
}
