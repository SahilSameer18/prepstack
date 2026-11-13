---
id: hld-case-video-streaming
title: "Case Study: Video Streaming"
next: hld-case-ride-sharing
roadmapSteps: devops-cloud:cloud-aws-basics, fullstack:deployment-scaling
---

<!-- Draft 13 Nov 2026, not published. Written from docs/content/source-notes/hld-drafts.md. Numbers from docs/content/checks/hld-case-check.py (section 8). -->

## Overview

A video streaming service lets people upload videos and watch them without long waits, on fast and slow connections. This note builds one reasonable design from stated assumptions. The central trade-off is storage cost against smooth playback: we store each video many times at different quality levels so every viewer gets one that fits. After this note you can explain preparing a video, adaptive bit rate (the player switching quality as the connection changes), and why a CDN (a network of caches close to viewers) carries almost all the traffic.

## Topic: Requirements and scope

**Definition:** We build: upload a video, watch it on phone and computer, start fast, keep playing when speed changes. We leave out recommendations, comments, copy protection, live streaming and billing.

**Why:** Each left-out part is its own design. Clarify first: how long are videos, how many viewers at once, and is live video needed?

**Example:** Requirements: (1) an uploaded video becomes watchable after processing; (2) playback starts in a few seconds; (3) quality adapts to the connection; (4) no video is lost. Out of scope: live streaming, recommendations.

**Failure:** If requirement 3 is skipped, a viewer on a slow connection sees a stalled picture while the fast one wastes bandwidth. The follow-up: "what if processing fails halfway?"

## Topic: Numbers

**Definition:** Estimates for storage, segments and delivery. Every input is an assumption, not a real company's figure.

**Why:** Storage cost and delivery bandwidth drive the whole design, and show the origin cannot serve viewers directly.

**Example:** Assumption: six renditions (versions at different quality) with these bit rates: 240p 0.4 Mbit/s, 360p 0.8, 480p 1.5, 720p 3.0, 1080p 6.0, 4K 15.0. One hour of each: 180, 360, 675, 1,350, 2,700 and 6,750 MB. All six: 12,015 MB, about 12.0 GB per hour of video. Assumption: 100,000 hours uploaded a day: 1,202 TB a day, 439 PB a year. Assumption: 10 million viewers at 3 Mbit/s at once: 30 Tbit/s.

**Failure:** If upload volume is 10x higher, storage becomes 4,390 PB a year; dropping the 4K rendition for rarely watched videos then matters (a cost choice, see below).

## Topic: API and data

**Definition:** Calls: `POST /videos` starts an upload and returns an upload id; `PUT` sends the file (in parts); `GET /videos/{id}/playlist` returns the playlist. Records: a video record (id, owner, status such as processing or ready, duration) and per-rendition segment lists. The files themselves sit in object storage (see System Design: Storage and Indexes).

**Why:** Video bytes are large and never edited, so object storage fits; the small status records fit a database.

**Example:** `video {id: 42, status: "ready", renditions: [240p, ..., 4K]}`.

**Failure:** A database cannot hold the video bytes economically, and a "videos like this" query needs a separate index.

## Topic: The first design

**Definition:** Parts (diagram 1): upload service, original-file storage, a job queue, conversion workers, segment storage, origin servers, a CDN, and the player. 

**Why:** Conversion is slow, so it runs in the background through a queue, not during the upload request.

**Example:** Write path (diagram 2): 1 the upload is stored; 2 a job goes to the queue; 3 workers convert and store segments; 4 status becomes ready. Read path (diagram 3): 1 the player asks for the playlist; 2 the playlist comes from the CDN; 3 the player requests segments from the CDN; 4 on a miss the CDN asks the origin.

**Failure:** First bottleneck: the origin, if viewers reached it directly (see Numbers).

## Topic: Preparing the video

**Definition:** The decision: split the video into short segments and convert each into every rendition, as independent jobs. Assumption: 4-second segments. One hour has 900 segments per rendition, so six renditions make 5,400 files.

**Why:** Small independent jobs run in parallel on many workers, and a failure costs one segment, not the whole video. The rejected alternative: convert whole files, where a crash near the end wastes hours of work. Storage is the price: 12.0 GB per hour and 439 PB a year under our assumptions. Cheaper options are our own reasoning: skip high renditions for videos nobody watches, or move old segments to cheaper storage.

**Example:** The queue holds jobs named (video, segment, rendition). A worker takes one, converts it and writes the output under a name made of those three values. If the worker dies, the job becomes visible again after a timeout and another worker redoes it. Because the output name is fixed, redoing it overwrites the same file (idempotent: doing it twice has the same effect as once). After a set number of failures the job goes to a dead-letter queue (a side queue for jobs that keep failing) for a person to look at (see System Design: Messaging and Streaming).

**Failure:** If one segment fails every time, the video is never ready. Fix: retry with waits that grow, then mark the video failed and tell the owner. Mark ready only when every segment of every rendition exists.

## Topic: Playing it smoothly

**Definition:** The decision: serve ordinary files over ordinary HTTP and let the player choose quality per segment. RFC 8216 (HTTP Live Streaming, August 2017, informational) describes a media segment as a short piece of media with a link, and a media playlist as a text file listing segments in order. A master playlist points to other playlists, one per variant (version at a bit rate and resolution); the RFC says the client should switch variants to match network conditions.

**Why:** Plain files use ordinary web servers and caches. The rejected alternative: a special streaming server per viewer, which a CDN cannot cache. The player decides because only it sees its own speed.

**Example:** Our assumed rule: pick the highest rendition at or below 80 percent of the measured speed. Speeds 8.0, 6.5, 3.0, 1.2, 0.6, 2.0, 5.0, 9.0 Mbit/s choose 1080p, 720p, 480p, 360p, 240p, 480p, 720p, 1080p. Start-up: assumption: first segment 4 s at 1 Mbit/s is 0.5 MB; at 5 Mbit/s it downloads in 0.80 s, so starting low and moving up speeds the first picture.

**Failure:** Switching too eagerly makes quality flicker; too slowly causes stalls. CDN delivery (assumption: 10 million viewers at 3 Mbit/s, 30 Tbit/s): hit ratio 90% leaves 3.00 Tbit/s for the origin, 95% leaves 1.50, 99% leaves 0.30. Popular videos stay cached near viewers; rare ones are fetched from the origin on first view. Netflix's Open Connect page (read 2026, undated, copyright 2026) described servers placed inside internet providers' networks, pre-filled with content suited to the area; this is one company's approach (see System Design: Caching).

## Topic: Failures and scaling

**Definition:** Failures: a worker dies, an origin node fails, a CDN node is lost.

**Why:** Viewers notice a stall at once, so playback must survive node loss.

**Example:** A CDN node fails. The player's next segment request goes to another node (a miss there), which fetches from the origin. The viewer sees at most a short pause, and the player may drop one rendition.

**Failure:** At 10x viewers a new hit video can send many first requests to the origin together. Fix: pre-load new popular videos to the CDN, and let the CDN merge identical requests into one.

## Questions

### Why cut video into segments?

Segments are small files, so workers convert them in parallel, a failure costs little, and the player can switch quality at every segment.

### What does the player do on a slow connection?

It measures speed and requests the next segment at a lower rendition, so playback continues at lower quality.

### Why does cache hit ratio matter?

At 30 Tbit/s total, a 99% hit ratio leaves 0.30 Tbit/s for the origin; 90% leaves 3.00.

### How do you retry a failed conversion?

Jobs are idempotent and retried with growing waits, and then go to a dead-letter queue.

## Mistakes

- "Convert one big file per video." One failure wastes all work.
- "Serve every viewer from the origin." At 30 Tbit/s no origin cluster is affordable; use a CDN.
- "Pick one quality for all." Slow viewers stall and fast ones get a poor picture.

## Quiz

### One hour, 4-second segments, one rendition: how many segments?

- [ ] 360
- [ ] 450
- [x] 900
- [ ] 3,600

Explanation: 3,600 seconds divided by 4 is 900.

### Speed is 3.0 Mbit/s and the player uses 80 percent. Which rendition (from our list)?

- [ ] 720p
- [x] 480p
- [ ] 1080p
- [ ] 360p

Explanation: 80 percent of 3.0 is 2.4; the highest rendition at or below 2.4 is 480p (1.5).

### What is in a media playlist (RFC 8216)?

- [ ] The video bytes
- [x] An ordered list of segments
- [ ] The viewer's speed
- [ ] The CDN cache

Explanation: The client downloads the list, then fetches each segment.

### With 10 million viewers at 3 Mbit/s, hit ratio 95% leaves the origin how much?

- [ ] 0.30 Tbit/s
- [ ] 3.00 Tbit/s
- [x] 1.50 Tbit/s
- [ ] 30 Tbit/s

Explanation: 5 percent of 30 Tbit/s.

### Why can a worker redo a segment job safely?

- [ ] Workers never fail
- [x] The output has a fixed name, so redoing it overwrites the same file
- [ ] The queue deletes the job
- [ ] The CDN hides it

Explanation: Idempotent output.

## Diagram

```json
{ "kind": "graph", "caption": "Main architecture (our own design). The upload service stores the file (1) and queues a job (2); workers read it, convert segments (3) and write them to segment storage (4). Viewers get playlists and segments from the CDN (5), which asks the origin on a miss (6).", "groups": [{ "id": "dc", "label": "Data centre" }], "nodes": [{ "id": "u", "label": "Upload service", "x": 8, "y": 20, "group": "dc" }, { "id": "q", "label": "Job queue", "x": 38, "y": 20, "shape": "queue", "group": "dc" }, { "id": "w", "label": "Workers", "x": 66, "y": 20, "group": "dc" }, { "id": "s", "label": "Segment storage", "x": 66, "y": 62, "shape": "database", "group": "dc" }, { "id": "o", "label": "Origin", "x": 38, "y": 62, "group": "dc" }, { "id": "cdn", "label": "CDN", "x": 38, "y": 92, "shape": "cache" }, { "id": "p", "label": "Player", "x": 8, "y": 92, "shape": "client" }], "edges": [{ "from": "u", "to": "q", "step": 2 }, { "from": "q", "to": "w", "step": 3 }, { "from": "w", "to": "s", "step": 4 }, { "from": "s", "to": "o", "dashed": true }, { "from": "cdn", "to": "o", "step": 6 }, { "from": "p", "to": "cdn", "step": 5 }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Write path: the upload is stored, a job is queued, a worker converts one segment and stores it, and the status becomes ready when all segments exist.", "actors": [{ "id": "u", "label": "Uploader" }, { "id": "a", "label": "Upload service" }, { "id": "q", "label": "Job queue" }, { "id": "w", "label": "Worker" }], "messages": [{ "from": "u", "to": "a", "label": "Upload video" }, { "from": "a", "to": "q", "label": "Add segment jobs" }, { "from": "w", "to": "q", "label": "Take a job" }, { "from": "w", "to": "a", "label": "Segment stored" }, { "from": "a", "to": "u", "label": "Status: ready", "dashed": true }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Read path: the player gets the playlist from the CDN, then requests each segment; on a miss the CDN asks the origin and keeps a copy.", "actors": [{ "id": "p", "label": "Player" }, { "id": "c", "label": "CDN" }, { "id": "o", "label": "Origin" }], "messages": [{ "from": "p", "to": "c", "label": "Get playlist" }, { "from": "c", "to": "p", "label": "Playlist", "dashed": true }, { "from": "p", "to": "c", "label": "Get segment 7, 720p" }, { "from": "c", "to": "o", "label": "Miss: ask origin" }, { "from": "o", "to": "c", "label": "Segment", "dashed": true }, { "from": "c", "to": "p", "label": "Segment", "dashed": true }] }
```

## Diagram

```json
{ "kind": "flow", "caption": "Adaptive bit rate in our assumed rule: measure the speed, take 80 percent of it, pick the highest rendition at or below that, request the next segment, and repeat.", "steps": [{ "label": "Measure speed" }, { "label": "Take 80 percent" }, { "label": "Pick rendition" }, { "label": "Fetch next segment" }] }
```
