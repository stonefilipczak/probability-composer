let n = 400;
let rate = 500;
let rateSlider;
let drums = [];
let drumIndex = 0;
let synths = [];
let synthIndex = 0;
let currentBeat = 1;
let divisor = 4;

function setup() {
  beatCounter = createSpan(1);
  beatCounter.style("color: red; text-shadow: 2px 2px black; font-size: 40px;");

  fft = new p5.FFT();

  createDiv("master frame rate");

  rateSlider = createSlider(10, 1000, 200);
  rateSlider.addClass('slider')
  rateSlider.style('width: 100px')
  createSpan("cycle length:");
  cycleInput = createInput();
  cycleInput.style("width: 20px");
  cycleInput.changed(() => (divisor = int(cycleInput.value())));

  Help = createButton("?");

  button = createButton("new");
  button.mousePressed(buildModule);
  button.style("float:right");
  sel = createSelect();
  sel.option("noise");
  sel.option("oscillator");
  sel.style("float:right");

  Alert = () => {
    alert(
      "Welcome to the probability composer! The pattern field accepts a comma-seperated list of ones and zeros, where the ones will play and the zeros will rest. For example, a simple snare backbeat would be written as 0, 1, 0, 1. The freq field accepts a comma-seperated list of frequencies, for example 440, 880, 220. Have Fun!"
    );
  };
  Help.mousePressed(this.Alert);
  Help.style("float: right; margin-right: 20px");

  title = createDiv("PROBABILITY COMPOSER");
  title.style(
    "color: white; background-color: green; font-size: 50px; margin-top: 5px"
  );

  createCanvas(windowWidth, 50);
  pulse();
}

function draw() {
  frameRate(25);
  background(250);

  if (drums.length != 0) {
    drawdrums();
  }
}

function drawdrums() {
  for (let i = 0; i < drums.length; i++) {
    drum = drums[i];
    if (drum.freqInput) {
      drum.switched ? stroke("gray") : stroke(250);
    } else {
      drum.switched ? stroke("lightgray") : stroke(250);
    }
    strokeWeight(10);
    fill(250);
    circle(i * 55 + 25, 25, 10);
    // meter(drum.amplitude.getLevel(), i*105);
  }
}

// function meter(source, X){
//  for (let i = 0; i < map(source, 0, 1, 0, 60); i++){
//    fill(255);
//     if (i > 7) {
//       fill(random(255), random(255), random(255));
//     }
//     if (i < 10) {
//     rect(X + i, 100 - i*7, 20, 5);
//     }
//    // console.log(i)
//   }
// }

class Synth {
  constructor(index) {
    this.title = createDiv("OSC");
    this.title.style("color: white; background-color: purple");
    this.noise = new p5.Oscillator();
    this.switched = false;

    this.setType = () => {
      //Set type to 'sine', 'triangle', 'sawtooth' or 'square'.
      this.noise.setType(this.typeSelect.value());
    };
    createSpan("type:");
    this.typeSelect = createSelect();
    this.typeSelect.option("sine");
    this.typeSelect.option("triangle");
    this.typeSelect.option("sawtooth");
    this.typeSelect.option("square");
    this.typeSelect.changed(this.setType);
    createSpan("freq:");
    this.freqs = [440];
    this.fi = 0;
    this.si = 0;
    this.setFreq = () => {
      this.fi = 0;
      this.freqArray = this.freqInput.value().split(",");
      console.log(this.freqArray);
      this.freqs = this.freqArray;
    };

    this.freqInput = createInput("440");

    this.freqInput.changed(this.setFreq);
    this.seqType = createSelect();
    this.seqType.option("random");
    this.seqType.option("sequential");


    this.setAmp = () => {
      this.env.setRange(this.ampInput.value(), 0);
    };

    createDiv("volume:");
    this.ampInput = createSlider(0.01, 1, 1, 0.01);
    this.ampInput.addClass('slider')
    this.ampInput.changed(this.setAmp);

    this.env = new p5.Envelope();

    this.env.setRange(1, 0.0);
    this.noise.amp(this.env);

    this.amplitude = new p5.Amplitude();
    this.amplitude.setInput(this.noise);

    this.filter = () => {
      this.env.setADSR(this.attackTime.value(), this.decayTime.value());
    };
    createDiv("attackTime:");
    this.attackTime = createSlider(0, 1, 0, 0.01);
    this.attackTime.addClass('slider')
    this.attackTime.changed(this.filter);
    this.decayTime = 0.5;
    createDiv("decayTime:");
    this.decayTime = createSlider(0, 1, 0.1, 0.01);
    this.decayTime.addClass('slider')
    this.decayTime.changed(this.filter);
    this.susRatio = 0;

    //fix this to have seperate controlls for each parameter and not get called by the pulse function but by the control being changed
    this.prob = createDiv("probability:");

    this.probSlider = createSlider(0, 100, 50);
    this.probSlider.addClass('slider')

    createSpan("pattern:");

    this.setSkips = () => {
      this.si = 0;
      if (this.skipSelect.value() == "") {
        this.skips = [1];
      } else {
        this.skipsArray = this.skipSelect.value().split(",");
        console.log(this.skipsArray);
        this.skips = this.skipsArray;
      }
    };
    this.skips = [1];
    this.currentBeat = 1;
    this.skipSelect = createInput();
    this.skipSelect.changed(this.setSkips);

    this.chances = [];
    this.shuffle = () => {
      this.chances = [];
      for (let i = 0; i < 100; i++) {
        if (i < this.probSlider.value()) {
          this.chances.push(true);
        } else this.chances.push(false);
      }
    };
    this.probSlider.changed(this.shuffle);
  }
}

class Noise {
  constructor(index) {
    this.title = createDiv(`NOISE`);
    this.title.style("color: white; background-color: Orange");
    this.noise = new p5.Noise();
    this.switched = false;

    this.setType = (type) => {
      //Set type to 'sine', 'triangle', 'sawtooth' or 'square'.
      this.noise.setType(this.typeSelect.value());
    };

    createSpan("type:");
    this.typeSelect = createSelect();
    this.typeSelect.option("white");
    this.typeSelect.option("pink");
    this.typeSelect.option("brown");
    this.typeSelect.changed(this.setType);

    this.si = 0;

    this.setAmp = () => {
      this.env.setRange(this.ampInput.value(), 0);
    };

    createDiv("volume:");
    this.ampInput = createSlider(0.01, 1, 1, 0.01);
    this.ampInput.addClass('slider')
    this.ampInput.changed(this.setAmp);

    this.env = new p5.Envelope();

    this.env.setRange(1, 0.0);
    this.noise.amp(this.env);

    this.fft = new p5.FFT();
    this.fft.setInput(this.noise);
    this.env = new p5.Envelope();

    this.env.setRange(1.0, 0.0);

    this.filter = () => {
      this.env.setADSR(this.attackTime.value(), this.decayTime.value());
    };
    createDiv("attackTime:");
    this.attackTime = createSlider(0, 1, 0, 0.01);
    this.attackTime.addClass('slider')
    this.attackTime.changed(this.filter);
    this.decayTime = 0.5;
    createDiv("decayTime:");
    this.decayTime = createSlider(0, 1, 0.1, 0.01);
    this.decayTime.addClass('slider')
    this.decayTime.changed(this.filter);
    this.susRatio = 0;

    createDiv("probability:");
    this.probSlider = createSlider(0, 100, 50);
    this.probSlider.addClass('slider')

    createSpan("pattern:");
    this.setSkips = () => {
      this.si = 0;
      console.log(this.skipSelect.value());
      if (this.skipSelect.value() == "" || "") {
        this.skips = [1];
      } else {
        this.skipsArray = this.skipSelect.value().split(",");
        console.log(this.skipsArray);
        this.skips = this.skipsArray;
      }
    };
    this.skips = [1];
    this.currentBeat = 1;
    this.skipSelect = createInput();
    this.skipSelect.changed(this.setSkips);

    this.chances = [];
    this.shuffle = () => {
      this.chances = [];
      for (let i = 0; i < 100; i++) {
        if (i < this.probSlider.value()) {
          this.chances.push(true);
        } else this.chances.push(false);
      }
    };
    this.probSlider.changed(this.shuffle);
  }
}


function buildModule() {
  if (sel.value() == "noise") {
    drums.push(new Noise(drumIndex));
  } else {
    drums.push(new Synth(drumIndex));
  }
  //initialize filter and chances
  drums[drumIndex].filter();
  drums[drumIndex].shuffle();
  drumIndex++;
}

function pulse() {
  for (let i = 0; i < drums.length; i++) {
    drum = drums[i];
    play(i);
  }

  setTimeout(function () {
    pulse();
  }, rateSlider.value());
  // console.log(drums.length)
  countBeat();
}

function countBeat() {
  beatCounter.html(currentBeat);
  currentBeat == divisor ? (currentBeat = 1) : currentBeat++;
}

function play(i) {
  drum = drums[i];
  if (int(drum.skips[drum.si]) == 1) {
    playDrum(drum);
    drum.si == drum.skips.length - 1 ? (drum.si = 0) : drum.si++;
  } else {
    drum.si == drum.skips.length - 1 ? (drum.si = 0) : drum.si++;
    return;
  }

}
function playDrum(drum) {
  if (random(drum.chances) == true) {
    drum.noise.start();
    drum.switched = true;
    setTimeout(() => (drum.switched = false), 100);
    drum.env.triggerAttack(drum.noise);
    if (drum.freqs != null) {
      if (drum.seqType.value() == "random") {
        drum.noise.freq(int(random(drum.freqs)));
      } else {
        drum.noise.freq(int(drum.freqs[drum.fi]));
        drum.fi == drum.freqs.length - 1 ? (drum.fi = 0) : drum.fi++;
      }
    }
  }
}
