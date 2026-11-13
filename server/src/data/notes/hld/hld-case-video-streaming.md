---
id: hld-case-video-streaming
title: "Case Study: Video Streaming"
lastChecked: 2026-11-13
next: hld-case-ride-sharing
roadmapSteps: devops-cloud:cloud-aws-basics, fullstack:deployment-scaling
---

<!-- Published 13 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and AI reviewers read it (two for accuracy, one for plain words); no second person did. Written from docs/content/source-notes/hld-cases.md and hld-phase1.md. Numbers computed by docs/content/checks/hld-case-check.py. Claims: docs/content/SOURCES.md. -->

## Overview

A video streaming service lets people upload videos and watch them without long waits, on fast and slow connections. This note builds one reasonable design from stated assumptions. The central trade-off is storage cost against smooth playback: we store each video many times at different quality levels so every viewer gets one that fits. The numbers are examples worked out with a short program. After this note you can explain preparing a video, adaptive bit rate (the player switching quality as the connection changes), and why a CDN (a network of caches close to viewers) carries almost all the traffic.

## Topic: Requirements and scope

**Definition:** We build: upload a video, watch it on phone and computer, start fast, keep playing when speed changes. We leave out recommendations, comments, copy protection, live streaming and billing.

**Why:** Each left-out part is its own design. Clarify first: how long are videos, how many viewers at once, and is live video needed?

**Example:** Requirements: (1) an uploaded video becomes watchable after processing (converting it into smaller files at several qualities); (2) playback starts in a few seconds; (3) quality adapts to the connection; (4) no video is lost. Out of scope: live streaming, recommendations.

**Failure:** If requirement 3 is skipped, a viewer on a slow connection sees a stalled picture while the fast one wastes bandwidth. The follow-up: "what if processing fails halfway?"

## Topic: Numbers

**Definition:** An estimate is a rough calculation done before building. A bit rate is how many bits (tiny units of data) one second of video uses; Mbit/s is a million bits a second and Tbit/s a million million. 240p, 720p and 1080p are picture heights in lines: the higher, the sharper. A rendition is one version of the video at one quality. Every input is an assumption, not a real company's figure.

**Why:** Storage cost and delivery bandwidth drive the whole design, and show the origin (our own servers that hold the real files) cannot serve viewers directly.

**Example:** Assumption: six renditions with these bit rates: 240p 0.4 Mbit/s, 360p 0.8, 480p 1.5, 720p 3.0, 1080p 6.0, 4K 15.0.
- 240p for one hour: 0.4 x 3,600 = 1,440 Mbit; divided by 8 (8 bits make 1 byte) = 180 MB. The other rates work the same way: 360, 675, 1,350, 2,700 and 6,750 MB.
- All six: 12,015 MB, about 12.0 GB per hour of video.
- Assumption: 100,000 hours uploaded a day: 100,000 x 12.015 GB = 1,202 TB a day; x 365 = 439 PB a year.
- Assumption: 10 million viewers at 3 Mbit/s at once: 10,000,000 x 3 = 30,000,000 Mbit/s = 30 Tbit/s.

**Failure:** With ten times more uploads, storage becomes about 4,385 PB a year (10 x 438.5); dropping the 4K rendition for rarely watched videos then matters (a cost choice, see below).

## Topic: API and data

**Definition:** Calls: `POST /videos` starts an upload and returns an upload id; `PUT` sends the file (in parts); `GET /videos/{id}/playlist` returns the playlist. Records: a video record (id, owner, status such as processing or ready, duration) and per-rendition segment lists. The files themselves sit in object storage (see System Design: Storage and Indexes).

**Why:** Video bytes are large and never edited, so object storage fits; the small status records fit a database.

**Example:** `video {id: 42, status: "ready", renditions: [240p, ..., 4K]}`.

**Failure:** A database cannot hold the video bytes economically, and a "videos like this" query needs a separate index.

## Topic: The first design

**Definition:** Parts (diagram 1): upload service, original-file storage, a job queue, conversion workers, segment storage, origin servers, a CDN, and the player. The origin holds the real segments; the CDN keeps copies close to viewers.

**Why:** Conversion is slow, so it runs in the background through a queue, not during the upload request.

**Example:** Write path (diagram 2): 1 the upload is stored; 2 a job goes to the queue; 3 workers convert and write segments; 4 when all are done, the status becomes ready. Read path (diagram 3): 1 the player asks for the playlist; 2 the playlist comes from the CDN; 3 the player requests segments from the CDN; 4 on a miss (the CDN does not hold the file) it asks the origin.

**Failure:** First bottleneck: the origin, if viewers reached it directly (see Numbers).

## Topic: Preparing the video

**Definition:** The decision: first a split step cuts the original into short segments (assumption: 4 seconds), then each segment is converted into every rendition as an independent job. One hour has 3,600 / 4 = 900 segments per rendition, so six renditions make 5,400 files. All renditions must be cut at the same moments, and each segment must start on a key frame (a picture the player can show without earlier pictures), or the player cannot switch quality cleanly (RFC 8216, sections 3 and 6.2.4).

**Why:** Small independent jobs run in parallel on many workers, and a failure costs one segment, not the whole video. The rejected alternative: convert whole files, where a crash near the end wastes hours of work. Storage is the price: 12.0 GB per hour and 439 PB a year under our assumptions. Cheaper options are our own reasoning: skip high renditions for videos nobody watches, or move old segments to cheaper storage.

**Example:** The queue holds jobs named (video, segment, rendition). While a worker has a job, other workers cannot see it. If the worker dies, the job becomes visible again after a set time and another worker redoes it. The output name is fixed by those three values, so redoing it overwrites the same file (idempotent: doing it twice has the same effect as once). After a set number of failures the job goes to a dead-letter queue (a side queue for jobs that keep failing) for a person to look at (see System Design: Messaging and Streaming).

**Failure:** If one segment fails every time, the video is never ready. Fix: retry with waits that grow, then mark the video failed and tell the owner. Mark ready only when every segment of every rendition exists.

## Topic: Playing it smoothly

**Definition:** The decision: serve ordinary files over ordinary HTTP (the normal web protocol) and let the player choose quality per segment. RFC 8216 (HTTP Live Streaming, August 2017; an RFC is a public technical document) describes the parts:
- A media segment is a piece of media named by a URI (a web address), optionally with a byte range.
- A media playlist is a text file listing segments in order.
- A master playlist lists the variants (versions of the same video at different bit rates and sizes), one for each quality.

The RFC says the player (the client) should switch variants to match the connection. It leaves the switching rule to the player; the 80 percent below is ours.

**Why:** Plain files use ordinary web servers and caches. The rejected alternative: a special streaming server per viewer, which a CDN cannot cache. The player decides because only it sees its own speed.

**Example:** Our assumed rule: pick the highest rendition at or below 80 percent of the measured speed. At 8.0 Mbit/s: 8.0 x 0.8 = 6.4, so 1080p (6.0). The speeds 8.0, 6.5, 3.0, 1.2, 0.6, 2.0, 5.0, 9.0 Mbit/s choose 1080p, 720p, 480p, 360p, 240p, 480p, 720p, 1080p.

Start-up, on an assumed 5 Mbit/s connection: the first 4-second piece of 240p is 0.4 x 4 = 1.6 Mbit and downloads in 1.6 / 5 = 0.32 s. A 1080p first piece is 6.0 x 4 = 24 Mbit and takes 4.8 s. So starting low shows the first picture sooner.

**Failure:** Switching too eagerly makes quality flicker; too slowly causes stalls. The hit ratio is the share of requests the CDN answers from its own copies. Of 30 Tbit/s, what reaches the origin: at 90 percent, 10 percent = 3.00 Tbit/s; at 95 percent, 5 percent = 1.50; at 99 percent, 1 percent = 0.30. Popular videos stay cached near viewers; rare ones are fetched from the origin on first view. Netflix's Open Connect page (read 2026, undated) described servers placed inside internet providers' networks, pre-filled with content suited to the area; this is one company's approach (see System Design: Caching).

## Topic: Failures and scaling

**Definition:** Failures: a worker dies, an origin node fails, a CDN node is lost.

**Why:** Viewers notice a stall at once, so playback must survive node loss.

**Example:** A CDN node fails. The player's next segment request goes to another node (a miss there), which fetches from the origin. The viewer sees at most a short pause, and the player may drop one rendition.

**Failure:** With ten times more viewers, a new popular video can send many first requests to the origin at the same moment. Fix: copy new popular videos to the CDN before viewers ask, and let the CDN combine identical requests into one.

## Questions

### Why cut video into segments?

Segments are small files, so workers convert them in parallel, a failure costs little, and the player can switch quality at every segment, because all renditions are cut at the same moments.

### What does the player do on a slow connection?

It measures speed and requests the next segment at a lower rendition, so playback continues at lower quality.

### Why does the hit ratio matter?

It is the share of requests the CDN answers itself. At 99 percent only 1 percent of 30 Tbit/s (0.30) reaches the origin; at 90 percent, 10 percent (3.00).

### How do you retry a failed conversion?

Jobs are idempotent and retried with growing waits, and then go to a dead-letter queue.

## Mistakes

- "Convert one big file per video." One failure wastes all work.
- "Serve every viewer from the origin." At 30 Tbit/s that would be impractical (our reasoning); use a CDN.
- "Pick one quality for all." Slow viewers stall and fast ones get a poor picture.

## Quiz

### One hour, 4-second segments, one rendition: how many segments?

- [ ] 360
- [ ] 450
- [x] 900
- [ ] 3,600

Explanation: 3,600 seconds divided by 4 is 900.

### The measured connection speed is 3.0 Mbit/s. The player picks the highest rendition whose bit rate is at most 80 percent of that speed. Which one?

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

### With 10 million viewers at 3 Mbit/s and a 95 percent hit ratio, how much traffic still reaches the origin?

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

Explanation: The job is idempotent.

## Diagram

```json
{ "kind": "graph", "caption": "Main architecture (our own design). The upload service stores the original file (1) and queues a job (2). Workers take the job (3), read the original (4, dashed), convert segments and write them to segment storage (5). The origin reads segments from storage (6, dashed). Viewers get playlists and segments from the CDN (8), which asks the origin on a miss (7).", "groups": [{ "id": "dc", "label": "Data centre" }], "nodes": [{ "id": "u", "label": "Upload service", "x": 14, "y": 14, "group": "dc" }, { "id": "q", "label": "Job queue", "x": 50, "y": 14, "shape": "queue", "group": "dc" }, { "id": "w", "label": "Workers", "x": 86, "y": 14, "group": "dc" }, { "id": "of", "label": "Original files", "x": 14, "y": 50, "shape": "database", "group": "dc" }, { "id": "o", "label": "Origin", "x": 50, "y": 50, "group": "dc" }, { "id": "s", "label": "Segment storage", "x": 86, "y": 50, "shape": "database", "group": "dc" }, { "id": "p", "label": "Player", "x": 14, "y": 86, "shape": "client" }, { "id": "cdn", "label": "CDN", "x": 50, "y": 86, "shape": "cache" }], "edges": [{ "from": "u", "to": "of", "step": 1 }, { "from": "u", "to": "q", "step": 2 }, { "from": "q", "to": "w", "step": 3 }, { "from": "of", "to": "w", "step": 4, "dashed": true }, { "from": "w", "to": "s", "step": 5 }, { "from": "s", "to": "o", "step": 6, "dashed": true }, { "from": "cdn", "to": "o", "step": 7 }, { "from": "p", "to": "cdn", "step": 8 }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Write path: the upload service queues segment jobs (1), a worker takes one (2) and writes the converted segment to storage (3). When every segment of every rendition exists, the worker reports (4) and the upload service sets the status to ready.", "actors": [{ "id": "a", "label": "Upload service" }, { "id": "q", "label": "Job queue" }, { "id": "w", "label": "Worker" }, { "id": "s", "label": "Segment storage" }], "messages": [{ "from": "a", "to": "q", "label": "Add segment jobs" }, { "from": "w", "to": "q", "label": "Take a job" }, { "from": "w", "to": "s", "label": "Write segment" }, { "from": "w", "to": "a", "label": "All done: set ready", "dashed": true }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Read path: the player gets the playlist from the CDN, then requests each segment; on a miss the CDN asks the origin and keeps a copy.", "actors": [{ "id": "p", "label": "Player" }, { "id": "c", "label": "CDN" }, { "id": "o", "label": "Origin" }], "messages": [{ "from": "p", "to": "c", "label": "Get playlist" }, { "from": "c", "to": "p", "label": "Playlist", "dashed": true }, { "from": "p", "to": "c", "label": "Get segment 7, 720p" }, { "from": "c", "to": "o", "label": "Miss: ask origin" }, { "from": "o", "to": "c", "label": "Segment", "dashed": true }, { "from": "c", "to": "p", "label": "Segment", "dashed": true }] }
```

## Diagram

```json
{ "kind": "flow", "caption": "Adaptive bit rate in our assumed rule: measure the speed, take 80 percent of it, pick the highest rendition at or below that, request the next segment, and repeat.", "steps": [{ "label": "Measure speed" }, { "label": "Take 80 percent" }, { "label": "Pick rendition" }, { "label": "Fetch next segment" }] }
```
