# Futsal scoreboard

Live futsal scoreboard for Instellar 2026: a controller page and an OBS overlay (score, clock, half, goal animation).
Needs Node.js only. No `npm install`, no database file.

## Setup

1. Install Node.js (LTS) from https://nodejs.org
2. Download this repo: `git clone https://github.com/FadhieZzen13/instellar-futsal-overlay.git`, or on GitHub click Code → Download ZIP and unzip it
3. Open a terminal in the folder: `cd instellar-futsal-overlay`
4. Run `node server.js` and keep that terminal open while streaming
2. Controller: open http://localhost:3400/futsalcontrol.html
3. OBS: add a Browser Source, URL http://localhost:3400/futsaldisplay.html, size 1920x1080

## Logos

One logo per campus PPI in `logos/`. Teams from the same campus share it (set by `logo:` in `teams.js`). No file = a coloured initials badge.

ut (FM UT KL) · unisiraj (SEVERA A, SEVERA B) · aiu (Zenith AIU) · xmum (Nasi Gandul) · apu (Arjuna, Arjuna Gantenk) · uum (Northern FT) · taylors (Victoria FC, Victoria FC B) · sunway (Eunion) · upm (UPM Putra) · iium (IIUM Top Global) · um (Aksara Sengsara, Aksara UM B) · msu (Kantoi FC) · **ukm (HIMBA): missing, add `logos/ukm.png`**

Team names and short names live in `teams.js`. Edit there and reload the pages.

## Controller

- Pick Team A (left) and Team B (right), their colours, and a stage title.
- GOAL adds a goal and plays the goal animation on the stream.
- −1 takes a goal off without an animation.
- Clock: Start/Pause, ±1s/10s/1min, or type a time and press Set. Counts down from the half length by default.
- "Go to 2nd half" switches to Babak 2 and resets the clock.
- Reset match: 0-0, Babak 1, clock reset. Teams and stage title stay.

Keys: A = goal Team A, L = goal Team B, Space = start/pause.

The clock runs on the laptop running `server.js`, so phones and the stream always show the same time. To control from a phone on the same Wi-Fi, use the laptop's IP, e.g. http://192.168.1.14:3400/futsalcontrol.html.
