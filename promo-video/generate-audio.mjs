import fs from 'fs';
import path from 'path';

// Generate a 55.5-second corporate SaaS ambient piano & pad track
const sampleRate = 44100;
const duration = 55.5;
const numSamples = Math.floor(sampleRate * duration);
const numChannels = 2;

const left = new Float32Array(numSamples);
const right = new Float32Array(numSamples);

// Chord progression in C Major:
// C maj (C4, E4, G4, B4) -> Am7 (A3, C4, E4, G4) -> Fmaj7 (F3, A3, C4, E4) -> Gsus4/G (G3, C4, D4, G4)
const chords = [
  { time: 0, freqs: [130.81, 261.63, 329.63, 392.00, 493.88] }, // Cmaj7
  { time: 4, freqs: [110.00, 220.00, 261.63, 329.63, 392.00] }, // Am7
  { time: 8, freqs: [87.31, 174.61, 220.00, 261.63, 329.63] },  // Fmaj7
  { time: 12, freqs: [98.00, 196.00, 261.63, 293.66, 392.00] }, // Gsus4
  { time: 16, freqs: [130.81, 261.63, 329.63, 392.00, 523.25] }, // Product Reveal Swell: Cmaj9
  { time: 20, freqs: [110.00, 220.00, 261.63, 329.63, 440.00] }, // Am
  { time: 24, freqs: [87.31, 174.61, 220.00, 261.63, 349.23] },  // F
  { time: 28, freqs: [98.00, 196.00, 246.94, 293.66, 392.00] }, // G
  { time: 32, freqs: [130.81, 261.63, 329.63, 392.00, 523.25] }, // Features C
  { time: 36, freqs: [110.00, 220.00, 261.63, 329.63, 440.00] }, // Am
  { time: 40, freqs: [87.31, 174.61, 220.00, 261.63, 349.23] },  // Pricing F
  { time: 44, freqs: [98.00, 196.00, 246.94, 293.66, 392.00] }, // G
  { time: 48, freqs: [130.81, 261.63, 329.63, 392.00, 523.25] }, // Testimonials C
  { time: 52, freqs: [130.81, 261.63, 329.63, 392.00, 523.25] }, // CTA C
];

// Synth note function (soft electric piano / Rhodes sound with warm envelope)
function addPianoNote(freq, startTime, noteDuration, velocity, pan = 0) {
  const startSample = Math.floor(startTime * sampleRate);
  const endSample = Math.min(numSamples, startSample + Math.floor(noteDuration * sampleRate));

  for (let i = startSample; i < endSample; i++) {
    const t = (i - startSample) / sampleRate;
    
    // Smooth ADSR envelope
    let env = 0;
    const attack = 0.015;
    const decay = 0.4;
    const sustain = 0.35;
    const release = 1.2;

    if (t < attack) {
      env = t / attack;
    } else if (t < attack + decay) {
      env = 1.0 - (1.0 - sustain) * ((t - attack) / decay);
    } else {
      const relTime = t - (attack + decay);
      env = sustain * Math.exp(-relTime / release);
    }

    // Harmonics (Fundamental + warm 2nd & 3rd harmonics + bell tone)
    const fundamental = Math.sin(2 * Math.PI * freq * t);
    const h2 = 0.4 * Math.sin(2 * Math.PI * freq * 2 * t);
    const h3 = 0.15 * Math.sin(2 * Math.PI * freq * 3 * t);
    const bell = 0.1 * Math.sin(2 * Math.PI * freq * 4.2 * t) * Math.exp(-t * 8);

    const val = (fundamental + h2 + h3 + bell) * env * velocity;

    const leftGain = Math.cos((pan + 1) * Math.PI / 4);
    const rightGain = Math.sin((pan + 1) * Math.PI / 4);

    left[i] += val * leftGain;
    right[i] += val * rightGain;
  }
}

// Add soft warm string pad (analog style sine + soft triangle with chorus)
function addWarmPad(freq, startTime, padDuration, velocity) {
  const startSample = Math.floor(startTime * sampleRate);
  const endSample = Math.min(numSamples, startSample + Math.floor(padDuration * sampleRate));

  for (let i = startSample; i < endSample; i++) {
    const t = (i - startSample) / sampleRate;
    
    // Slow swell envelope
    let env = 0;
    const attack = 0.8;
    const release = 0.8;

    if (t < attack) {
      env = t / attack;
    } else if (t > padDuration - release) {
      env = (padDuration - t) / release;
    } else {
      env = 1.0;
    }

    const detune1 = 1.002;
    const detune2 = 0.998;
    const s1 = Math.sin(2 * Math.PI * freq * t);
    const s2 = Math.sin(2 * Math.PI * freq * detune1 * t);
    const s3 = Math.sin(2 * Math.PI * freq * detune2 * t);

    const val = (s1 + s2 + s3) / 3 * env * velocity;

    left[i] += val * 0.7;
    right[i] += val * 0.7;
  }
}

// Render chord beds
for (let c = 0; c < chords.length; c++) {
  const chord = chords[c];
  const nextTime = (c + 1 < chords.length) ? chords[c + 1].time : duration;
  const chordDur = nextTime - chord.time;

  // Bass & Pad
  chord.freqs.forEach((f, idx) => {
    // Strings/Pad
    const isReveal = chord.time >= 16 && chord.time < 22;
    const padVol = isReveal ? 0.07 : 0.04;
    addWarmPad(f, chord.time, chordDur + 0.5, padVol);

    // Arpeggiated Piano notes
    const delay = idx * 0.12;
    const pan = (idx / (chord.freqs.length - 1)) * 1.2 - 0.6;
    addPianoNote(f, chord.time + delay, 3.5, 0.06, pan);
    
    // Second arpeggio hit mid-chord
    if (chordDur >= 4 && idx >= 2) {
      addPianoNote(f, chord.time + 2.0 + (idx - 2) * 0.2, 2.5, 0.045, -pan);
    }
  });
}

// Global master fade out from 53s to 55s
for (let i = 0; i < numSamples; i++) {
  const t = i / sampleRate;
  if (t > 52.5) {
    const fadeOut = Math.max(0, 1 - (t - 52.5) / 2.5);
    left[i] *= fadeOut;
    right[i] *= fadeOut;
  }
}

// Master limiter / volume normalization to -18dB (~0.12 peak)
let peak = 0;
for (let i = 0; i < numSamples; i++) {
  peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
}

const targetPeak = 0.15; // -16.5 dBFS
const masterGain = peak > 0 ? (targetPeak / peak) : 1;

for (let i = 0; i < numSamples; i++) {
  left[i] *= masterGain;
  right[i] *= masterGain;
}

// Encode to 16-bit PCM WAV
const bytesPerSample = 2;
const blockAlign = numChannels * bytesPerSample;
const byteRate = sampleRate * blockAlign;
const dataSize = numSamples * blockAlign;
const buffer = Buffer.alloc(44 + dataSize);

// RIFF chunk descriptor
buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + dataSize, 4);
buffer.write('WAVE', 8);

// fmt sub-chunk
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16); // subchunk1 size
buffer.writeUInt16LE(1, 20);  // PCM format
buffer.writeUInt16LE(numChannels, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(byteRate, 28);
buffer.writeUInt16LE(blockAlign, 32);
buffer.writeUInt16LE(16, 34); // bits per sample

// data sub-chunk
buffer.write('data', 36);
buffer.writeUInt32LE(dataSize, 40);

let offset = 44;
for (let i = 0; i < numSamples; i++) {
  const sL = Math.max(-1, Math.min(1, left[i]));
  const sR = Math.max(-1, Math.min(1, right[i]));

  buffer.writeInt16LE(Math.floor(sL * 32767), offset);
  buffer.writeInt16LE(Math.floor(sR * 32767), offset + 2);
  offset += 4;
}

const outDir = path.join(process.cwd(), 'assets');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const outFile = path.join(outDir, 'corporate-bed.wav');
fs.writeFileSync(outFile, buffer);
console.log(`✓ Audio generated successfully at ${outFile} (duration: ${duration}s)`);
