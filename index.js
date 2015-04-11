var Leap = require("leapjs");
var ctx = require("audio-context");

var main = document.querySelector("main");

var gain = ctx.createGain();

gain.gain.value = 0.2;
gain.connect(ctx.destination);

var oscillator1 = ctx.createOscillator();

oscillator1.type = "sine";
oscillator1.start();

var oscillator2 = ctx.createOscillator();

oscillator2.type = "sine";
oscillator2.start();

var had_hand = false;
var known_hands = 0;
var known_frequency = 0;
var known_level = 0.2;
var known_detune = 0;

Leap.loop(handle_update);

function handle_update(frame) {
	var hands = frame.hands;
	var num_hands = hands.length;
	known_hands = num_hands;
	if (num_hands === 0) {
		//check_should_stop();
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
		"</div><div>Detune: " +
		known_detune +
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
	var depth = hand.palmPosition[2];
	var c4 = 261.63;
	var frequency = c4 + height;
	var detune_distance = depth * 1.5;
	tune(frequency);
	detune(detune_distance);
}

function process_left(hand) {
	var height = hand.palmPosition[1];
	var level = height / 400;
	volume(level);
}

function play() {
	console.log("Playing");
	oscillator1.connect(gain);
	oscillator2.connect(gain);
}

function stop() {
	console.log("Stopping");
	oscillator1.disconnect(gain);
	oscillator2.disconnect(gain);
}

function volume(level) {
	known_level = level;
	gain.gain.value = level;
}

function tune(frequency) {
	known_frequency = frequency;
	oscillator1.frequency.value = frequency;
	oscillator2.frequency.value = frequency;
}

function detune(distance) {
	known_detune = distance;
	oscillator2.detune.value = distance;
}
