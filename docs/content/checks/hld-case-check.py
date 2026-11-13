#!/usr/bin/env python3
"""Numbers for the PrepStack System Design case studies (HLD Phase 3). Every number a case study shows comes from this file's output
(or is plain arithmetic shown in the draft). Run: PYTHONIOENCODING=utf-8 python hld-case-check.py > hld-case-check-output.txt
All inputs are made-up assumptions (each is printed with its output); nothing is measured on a real system. Random parts use fixed seeds."""
import heapq
import math
import random
import zlib
from math import ceil, exp, log

def sec(name): print("\n" + "=" * 8, name)
def p(label, value): print(f"{label}: {value}")
def h(s, seed=0): return zlib.crc32(f"{seed}:{s}".encode())
DAY = 86400

# ============================================================ 1. URL shortener
sec("1A URL shortener: traffic and storage (assumption: 100 million new links a month, 100 reads per write, 500 bytes a record, kept 5 years)")
new_month = 100_000_000
w_qps = new_month / (30 * DAY); r_qps = w_qps * 100
p("average write QPS", f"{w_qps:,.1f}"); p("average read QPS", f"{r_qps:,.0f}"); p("peak read QPS at 2x", f"{2*r_qps:,.0f}")
records = new_month * 12 * 5
p("links after 5 years", f"{records:,}"); p("storage", f"{records*500/1e12:,.1f} TB")
sec("1B code length: how many codes fit (62 characters: a-z, A-Z, 0-9)")
for n in range(5, 9): p(f"{n} characters", f"62^{n} = {62**n:,}")
p("7 characters used after 5 years", f"{records/62**7*100:.3f}% of the space")
sec("1C base-62 from a counter")
A = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
def b62(n):
    s = ""
    while n: n, r = divmod(n, 62); s = A[r] + s
    return s or "0"
for n in [1, 61, 62, 125, 1_000_000, 6_000_000_000]: p(f"counter {n:,}", f"code {b62(n)} ({len(b62(n))} characters)")
M = 62**7; MULT = 2_718_281_829  # odd, not divisible by 31, so coprime with 62
from math import gcd
p("multiplier coprime with 62^7", gcd(MULT, 62) == 1); p("multiplier mod 62 (the last character steps by this much each time)", MULT % 62)
p("counters 1 to 5 scrambled by multiplying and taking the remainder", [b62((i * MULT) % M).rjust(7, "0") for i in range(1, 6)])
p("scrambling never repeats a code (checked on the first 1,000,000 counters)", len({(i * MULT) % M for i in range(1, 1_000_001)}) == 1_000_000)
sec("1D random codes: the chance a new random code is already taken equals the share of the space used")
for u in [0.0017, 0.1, 0.5, 0.9]: p(f"{u*100:.2f}% of codes used", f"average tries until a free one {1/(1-u):.2f}")
sec("1E cache hit ratio for redirects (assumption: 100,000 links, Zipf-like reads; LRU; simulation)")
rng = random.Random(21); N = 100_000
w = [1 / (i + 1) for i in range(N)]; trace = rng.choices(range(N), weights=w, k=200_000)
from collections import OrderedDict
def lru(tr, size):
    c = OrderedDict(); hit = 0
    for k in tr:
        if k in c: hit += 1; c.move_to_end(k)
        else:
            c[k] = 1
            if len(c) > size: c.popitem(last=False)
    return hit / len(tr)
for pct in [0.5, 1, 5, 10]: p(f"cache holds {pct}% of the links", f"hit ratio {lru(trace, int(N*pct/100))*100:.1f}%")

# ============================================================ 2. Rate limiter
sec("2A a counter updated as read-then-write is wrong when requests overlap (assumption: limit 5; 10 requests read the counter before any writes it)")
def nonatomic(limit, concurrent):
    count = 0; reads = [count for _ in range(concurrent)]  # all read 0
    allowed = sum(1 for r in reads if r < limit)
    return allowed
p("limit 5, 10 overlapping requests, read then write", f"{nonatomic(5, 10)} allowed")
def atomic(limit, concurrent):
    count = 0; ok = 0
    for _ in range(concurrent):
        count += 1                    # increment first, then compare
        if count <= limit: ok += 1
    return ok
p("same with an atomic increment", f"{atomic(5, 10)} allowed")
sec("2B splitting a quota across servers (assumption: limit 100 a minute, 5 servers)")
p("each server gets", 100 // 5)
p("a user whose requests all land on one server can use", f"{100//5} of 100 ({100//5}%)")
p("if each server only checks its own counter against the full limit, one user spread over 5 servers can send up to", f"{5*100} a minute (5x the limit)")
sec("2C memory for the limiter state (assumption: 10,000,000 active users, token bucket = a count and a time, 8 bytes each, plus 50 bytes of key)")
users = 10_000_000
p("bytes per user", 8 + 8 + 50); p("total", f"{users*66/1e6:,.0f} MB")
p("requests per second if each user sends 1 request every 10 s on average", f"{users/10:,.0f}")
sec("2D token bucket: allowed requests in a burst (assumption: capacity 10 tokens, refill 5 a second)")
def tb(trace, cap, rate):
    tok = cap; last = trace[0]; ok = []
    for t in trace:
        tok = min(cap, tok + (t - last) * rate); last = t
        if tok >= 1: tok -= 1; ok.append(1)
        else: ok.append(0)
    return ok
burst = [0.0] * 15 + [1.0] * 15
r = tb(burst, 10, 5); p("15 requests at t=0 then 15 at t=1", f"allowed {sum(r[:15])} of the first 15, {sum(r[15:])} of the next 15")

# ============================================================ 3. Key-value store
sec("3A sizing (assumption: 10 TB of data, 3 copies, 2 TB of data per node kept under 60 percent full)")
data_tb, copies, node_tb, fill = 10, 3, 2, 0.6
need = ceil(data_tb * copies / (node_tb * fill)); p("nodes needed", need)
sec("3B read and write quorums with N = 3 (each node up with probability 0.99, independent; assumption)")
from math import comb
def p_at_least(n, k, pp): return sum(comb(n, i) * pp**i * (1 - pp)**(n - i) for i in range(k, n + 1))
p("write succeeds with W = 2 (2 of the 3 replicas up)", f"{p_at_least(3,2,0.99)*100:.4f}%")
p("write succeeds with W = 3", f"{p_at_least(3,3,0.99)*100:.4f}%")
p("write succeeds with W = 1", f"{p_at_least(3,1,0.99)*100:.5f}%")
sec("3C Merkle tree comparison (assumption: 1,048,576 keys in a range, 32-byte hashes, one key differs)")
leaves = 2**20; depth = int(log(leaves, 2))
p("levels below the root", depth)
p("hashes exchanged walking down to the one differing key (both children at each level)", f"{2*depth} hashes = {2*depth*32} bytes")
p("sending every key's hash instead", f"{leaves*32/1e6:.1f} MB")
sec("3D replica set from the ring (see hld-check-output E2); sloppy quorum and hinted handoff are described in the Dynamo paper")
sec("3E writes and reads per second needed (assumption: 100,000 reads and 20,000 writes per second; each write goes to 3 replicas)")
p("replica writes per second", f"{20_000*3:,}"); p("replica reads per second at R = 2", f"{100_000*2:,}")
p("per node if spread over the nodes from 3A", f"{(20_000*3+100_000*2)/need:,.0f} operations a second")

# ============================================================ 4. Chat
sec("4A traffic (assumption: 50 million daily users, 40 messages sent each, 300 bytes stored per message with metadata)")
dau = 50_000_000; msgs = dau * 40
p("messages a day", f"{msgs:,}"); p("average messages a second", f"{msgs/DAY:,.0f}"); p("peak at 3x", f"{3*msgs/DAY:,.0f}")
p("storage a year", f"{msgs*300*365/1e12:,.0f} TB")
sec("4B connections (assumption: 10 million users connected at once, 10 KB memory a connection, 100,000 connections a server)")
conn = 10_000_000
p("memory for connections", f"{conn*10e3/1e9:,.0f} GB"); p("connection servers", ceil(conn / 100_000))
sec("4C group fan-out (assumption: a group of 500 members; 1 message)")
p("deliveries for one message", 500)
p("if 1 percent of all messages go to such groups", f"{msgs*0.01*500/DAY:,.0f} extra deliveries a second on average")
sec("4D ordering: two senders, messages arrive out of order; the server stamps a sequence number per conversation")
arrival = [("B", "second"), ("A", "first")]; stamped = [(i + 1, who, txt) for i, (who, txt) in enumerate(arrival)]
p("order the server saw them", stamped)
p("a client sorts by the number, not by its own clock", [x[2] for x in sorted(stamped)])
sec("4E offline users (assumption: a phone is off for 8 hours; the user gets 5 messages an hour)")
p("messages waiting", 8 * 5); p("stored for all such users if 20 percent of 50 million are offline", f"{int(0.2*dau)*40:,} messages = {0.2*dau*40*300/1e9:,.0f} GB")

# ============================================================ 5. Notification service
sec("5A a burst (assumption: 5 million marketing pushes sent at once, one worker sends 1,000 a second)")
burst_n = 5_000_000
for workers in [1, 50, 500]: p(f"{workers} workers", f"{burst_n/(1000*workers):,.0f} s ({burst_n/(1000*workers)/60:.1f} min)")
sec("5B one shared queue delays a login code behind the burst (assumption: 10,000 sends a second in total)")
p("a code that arrives just after 5,000,000 marketing messages waits", f"{5_000_000/10_000:,.0f} s ({5_000_000/10_000/60:.1f} min)")
p("with a separate queue for codes", "no wait behind the marketing messages")
sec("5C retries with backoff (assumption: start 1 s, double each time, 5 retries)")
t = 0; rows = []
for a in range(5): d = 2**a; t += d; rows.append((a + 1, d, t))
p("(retry, wait seconds, seconds since the first failure)", rows)
sec("5D duplicates: at-least-once sending with an id (assumption: 1,000,000 sends, 0.1 percent are repeated by a retry after a lost acknowledgement)")
p("repeated sends", int(1_000_000 * 0.001)); p("with a stored send id they are dropped", "0 duplicate pushes reach users")
sec("5E fan-out for an event (assumption: 1 event notifies 2,000 followers on 3 channels)")
p("deliveries", 2000 * 3)

# ============================================================ 6. News feed
sec("6A fan-out on write against fan-out on read (assumption: 100 million daily users, 200 follows each, 20 million posts a day, 10 feed loads per user a day)")
posts = 20_000_000; follows = 200; dau = 100_000_000
p("feed entries written a day if every post is copied to 200 followers", f"{posts*follows:,} = {posts*follows/DAY:,.0f} a second")
loads = dau * 10
p("feed loads a second", f"{loads/DAY:,.0f}")
p("timeline reads a second if each load merges 200 timelines at read time", f"{loads/DAY*follows:,.0f}")
sec("6B storage of ready-made feeds (assumption: 800 post ids a user, 8 bytes each)")
p("all users", f"{dau*800*8/1e9:,.0f} GB (one copy)")
sec("6C who dominates the copying (simulation: 1,000,000 accounts, Pareto-distributed follower counts, assumption)")
rng = random.Random(6)
fol = [min(int(rng.paretovariate(1.2) * 20), 50_000_000) for _ in range(1_000_000)]
tot = sum(fol); fol_sorted = sorted(fol, reverse=True)
p("total followers over all accounts", f"{tot:,}")
for top in [0.001, 0.01]:
    k = int(len(fol) * top); p(f"the top {top*100:.1f}% of accounts ({k:,}) hold", f"{sum(fol_sorted[:k])/tot*100:.1f}% of all follower links")
cut = 10_000
heavy = sum(1 for f in fol if f > cut); p(f"accounts with more than {cut:,} followers", f"{heavy:,} ({heavy/len(fol)*100:.3f}%)")
p(f"copies avoided if accounts above {cut:,} are read at feed time instead", f"{sum(f for f in fol if f > cut)/tot*100:.1f}% of all fan-out writes")
sec("6D one celebrity post (assumption: 50 million followers, one worker does 20,000 feed writes a second)")
p("workers needed to finish in 10 s", ceil(50_000_000 / (20_000 * 10))); p("one worker alone needs", f"{50_000_000/20_000:,.0f} s = {50_000_000/20_000/60:.0f} min")

# ============================================================ 7. File storage and sync
sec("7A block size (assumption: 4 MB blocks)")
MB = 2**20
for size_mb in [1, 100, 1024]: p(f"a {size_mb} MB file", f"{ceil(size_mb/4)} blocks; changing one byte re-uploads 4 MB, not {size_mb} MB ({4/size_mb*100:.2f}%)" if size_mb > 4 else "1 block")
sec("7B fixed-size blocks against content-defined blocks when 1 byte is inserted at the start (simulation: 4 MB of random bytes)")
rng = random.Random(8); data = bytes(rng.getrandbits(8) for _ in range(4 * MB))
def fixed_chunks(b, size=64 * 1024): return [zlib.crc32(b[i:i + size]) for i in range(0, len(b), size)]
# content-defined: cut after a byte when a rolling hash of the last 48 bytes matches a pattern (average block about 64 KB)
import array
def cdc(b, mask=(1 << 16) - 1, minimum=16 * 1024, maximum=256 * 1024):
    out = []; start = 0; hsh = 0
    G = [rng2 for rng2 in range(256)]
    rr = random.Random(99); gear = [rr.getrandbits(32) for _ in range(256)]
    for i, byte in enumerate(b):
        hsh = ((hsh << 1) + gear[byte]) & 0xFFFFFFFF
        size = i - start + 1
        if (size >= minimum and (hsh & mask) == 0) or size >= maximum:
            out.append(zlib.crc32(b[start:i + 1])); start = i + 1; hsh = 0
    if start < len(b): out.append(zlib.crc32(b[start:]))
    return out
data2 = b"X" + data
f1, f2 = fixed_chunks(data), fixed_chunks(data2)
p("fixed 64 KB blocks: blocks that differ after the insert", f"{len(set(f2)-set(f1))} of {len(f2)}")
c1, c2 = cdc(data), cdc(data2)
p("content-defined blocks (about 64 KB average): blocks that differ", f"{len(set(c2)-set(c1))} of {len(c2)}")
p("average content-defined block size in this run", f"{len(data)/len(c1)/1024:.0f} KB ({len(c1)} blocks in 4 MB)")
sec("7C deduplication (assumption: 1 million users each store the same 100 MB installer)")
p("without dedupe", f"{1_000_000*100/1e6:,.0f} TB"); p("with one stored copy of each block", "100 MB plus a small reference per user")
sec("7D metadata (assumption: 100 million users, 200 files each, 500 bytes of metadata a file)")
p("metadata", f"{100_000_000*200*500/1e12:,.0f} TB")

# ============================================================ 8. Video streaming
sec("8A storage of one hour of video in several renditions (assumption: the bit rates below)")
ladder = [("240p", 0.4), ("360p", 0.8), ("480p", 1.5), ("720p", 3.0), ("1080p", 6.0), ("4K", 15.0)]
tot_mb = 0
for n, mbps in ladder:
    mb = mbps * 3600 / 8; tot_mb += mb; p(f"{n} at {mbps} Mbit/s", f"{mb:,.0f} MB an hour")
p("all renditions together", f"{tot_mb:,.0f} MB = {tot_mb/1000:.1f} GB an hour of video")
sec("8B uploads (assumption: 100,000 hours of video uploaded a day)")
p("storage a day for all renditions", f"{100_000*tot_mb/1e6:,.0f} TB"); p("a year", f"{100_000*tot_mb*365/1e9:,.0f} PB")
sec("8C segments (assumption: 4-second segments)")
p("segments in one hour of one rendition", 3600 // 4); p("files for six renditions", 6 * 3600 // 4)
sec("8D adaptive bit rate: the player picks the highest rendition at or below 80 percent of the measured speed (assumption)")
speeds = [8.0, 6.5, 3.0, 1.2, 0.6, 2.0, 5.0, 9.0]
def pick(s):
    best = ladder[0][0]
    for n, m in ladder:
        if m <= 0.8 * s: best = n
    return best
p("measured speeds (Mbit/s)", speeds); p("renditions chosen", [pick(s) for s in speeds])
sec("8E delivery (assumption: 10 million viewers at 3 Mbit/s at the same time)")
p("total bandwidth", f"{10_000_000*3/1e6:,.0f} Tbit/s")
for hit in [0.9, 0.95, 0.99]: p(f"CDN hit ratio {hit*100:.0f}%", f"origin must supply {10_000_000*3*(1-hit)/1e6:,.2f} Tbit/s")
sec("8F start-up delay (assumption: first segment of 4 s at 1 Mbit/s = 0.5 MB; connection speed 5 Mbit/s)")
p("download time of the first segment", f"{0.5*8/5:.2f} s")

# ============================================================ 9. Ride sharing
sec("9A location updates (assumption: 1,000,000 drivers online, one update every 4 seconds, 100 bytes each)")
p("updates a second", f"{1_000_000/4:,.0f}"); p("data a second", f"{1_000_000/4*100/1e6:,.0f} MB")
sec("9B finding nearby drivers: grid search against checking everyone (simulation: 10,000 drivers on a 20 km x 20 km city, 1 km cells, 1,000 rider requests, nearest driver within the 3x3 cells around the rider)")
rng = random.Random(9); drivers = [(rng.uniform(0, 20), rng.uniform(0, 20)) for _ in range(10_000)]
cells = {}
for i, (x, y) in enumerate(drivers): cells.setdefault((int(x), int(y)), []).append(i)
checked = 0; same = 0; found = 0; rid = [(rng.uniform(0, 20), rng.uniform(0, 20)) for _ in range(1000)]
for (x, y) in rid:
    cand = []
    for dx in (-1, 0, 1):
        for dy in (-1, 0, 1): cand += cells.get((int(x) + dx, int(y) + dy), [])
    checked += len(cand)
    best_all = min(range(len(drivers)), key=lambda i: (drivers[i][0] - x) ** 2 + (drivers[i][1] - y) ** 2)
    if cand:
        found += 1; best_c = min(cand, key=lambda i: (drivers[i][0] - x) ** 2 + (drivers[i][1] - y) ** 2)
        if best_c == best_all: same += 1
p("drivers checked per request with the grid", f"{checked/1000:.1f} (brute force: 10,000)")
p("requests where the grid found a driver", f"{found} of 1000"); p("grid answer equals the true nearest driver", f"{same} of {found}")
sec("9B2 the same grid search in a thin area (simulation: 100 drivers on the same 20 km x 20 km city, 1,000 rider requests)")
rng = random.Random(10); drivers2 = [(rng.uniform(0, 20), rng.uniform(0, 20)) for _ in range(100)]
cells2 = {}
for i, (x, y) in enumerate(drivers2): cells2.setdefault((int(x), int(y)), []).append(i)
found2 = same2 = 0
for (x, y) in rid:
    cand = []
    for dx in (-1, 0, 1):
        for dy in (-1, 0, 1): cand += cells2.get((int(x) + dx, int(y) + dy), [])
    best_all = min(range(len(drivers2)), key=lambda i: (drivers2[i][0] - x) ** 2 + (drivers2[i][1] - y) ** 2)
    if cand:
        found2 += 1; best_c = min(cand, key=lambda i: (drivers2[i][0] - x) ** 2 + (drivers2[i][1] - y) ** 2)
        if best_c == best_all: same2 += 1
p("requests where the 3x3 block held any driver", f"{found2} of 1000"); p("block answer equals the true nearest driver", f"{same2} of {found2}")
sec("9C a driver near a cell border (the true nearest driver can be outside the 3x3 block only when the nearest is more than 1 km away: checked above)")
sec("9D matching rate (assumption: 100,000 ride requests a minute in the busiest hour)")
p("requests a second", f"{100_000/60:,.0f}")
sec("9E geohash cell sizes: see hld-check-output K4 (6 characters about 1.2 km wide at the equator)")

# ============================================================ 10. Web crawler
sec("10A crawl rate (assumption: 1 billion pages in 30 days, 100 KB a page)")
pages = 1_000_000_000; rate = pages / (30 * DAY)
p("pages a second", f"{rate:,.0f}"); p("download bandwidth", f"{rate*100e3/1e6:,.1f} MB/s = {rate*100e3*8/1e6:,.0f} Mbit/s"); p("storage for the pages", f"{pages*100e3/1e12:,.0f} TB")
sec("10B politeness (assumption: at most 1 request a second to one site)")
p("time to fetch 10,000 pages from one site", f"{10_000} s = {10_000/3600:.1f} hours")
p("sites that must be crawled in parallel to reach the rate above", f"about {rate:,.0f} (each at 1 page a second)")
sec("10C remembering visited URLs (assumption: 10 billion URLs seen, 8-byte hash each)")
p("exact set of hashes", f"{10e9*8/1e9:,.0f} GB")
for bits, k, fp in [(10, 7, 0.82), (15, 10, 0.07)]: p(f"Bloom filter, {bits} bits a URL ({k} hashes)", f"{10e9*bits/8/1e9:,.1f} GB, about {fp}% of new URLs wrongly seen as visited (see hld-check-output K1)")
sec("10D frontier by site (simulation: 3 sites, each polled at most once per 2 seconds, queue per site)")
sites = {"a.com": 5, "b.com": 3, "c.com": 1}; t = 0; last = {s: -99 for s in sites}; order = []
heap = [(0, s) for s in sites]; heapq.heapify(heap); left = dict(sites)
while heap:
    ready, s = heapq.heappop(heap); t = max(t, ready)
    if left[s] > 0:
        left[s] -= 1; order.append((t, s)); heapq.heappush(heap, (t + 2, s))
    else: continue
    t += 0.5
p("(time in seconds, site) fetch order", order)
sec("10E DNS (assumption: 1 lookup of 50 ms per new site, 386 new sites a second, the same as the page rate)")
p("lookup time a second", f"{386*0.05:.1f} s of waiting per second: needs parallel lookups and a cache")

# ============================================================ 11. Ticket booking
sec("11A double booking: check-then-write (worked by hand, not simulated: 10 buyers look at the same free seat at the same moment; assumption)")
p("seat sold to", f"{10} buyers if each reads 'free' then writes 'mine' (no lock)")
p("with one atomic 'set owner where owner is empty' update", "1 buyer wins, 9 get 'taken'")
sec("11B holds that expire (assumption: 50,000 seats, 10-minute hold, 70 percent of holds are abandoned)")
p("seats held but never bought at the end of a 10-minute round", f"{int(50_000*0.7):,} of 50,000")
p("with a 10-minute timeout they come back after", "10 minutes; with 2 minutes they come back 5x sooner but honest buyers may lose the seat while paying")
sec("11C waiting room (assumption: 1,000,000 people arrive at once, the booking service finishes 2,000 purchases a second at most)")
p("time to let everyone through at 2,000 a second", f"{1_000_000/2000:,.0f} s = {1_000_000/2000/60:.1f} min")
p("50,000 seats sell out after at least", f"{50_000/2000:.0f} s if every admitted person buys one seat")
sec("11D payment retries (assumption: 1 percent of payment requests time out and the buyer presses again)")
p("duplicate charges without an idempotency key per 100,000 orders", int(100_000 * 0.01)); p("with one", 0)

# ============================================================ 12. Top-K counting
sec("12A count-min sketch size: width = ceil(e / error), depth = ceil(ln(1 / failure chance)) (assumption: error 0.1 percent of the total count, failure chance 1 percent)")
eps, dlt = 0.001, 0.01; wd = ceil(math.e / eps); dp = ceil(log(1 / dlt))
p("width", wd); p("depth", dp); p("counters", wd * dp); p("memory at 4 bytes a counter", f"{wd*dp*4/1e3:,.1f} KB")
sec("12B exact counting memory (assumption: 100,000 / 100,000,000 / 1,000,000,000 different items, 16 bytes each: id and count)")
for d in [100_000, 100_000_000, 1_000_000_000]: p(f"{d:,} items", f"{d*16/1e6:,.1f} MB" if d < 10**9 else f"{d*16/1e9:,.0f} GB")
sec("12C count-min sketch on a stream (simulation: 1,000,000 events over 100,000 items, Zipf-like)")
rng = random.Random(12); N = 100_000
w_ = [1 / (i + 1) for i in range(N)]; stream = rng.choices(range(N), weights=w_, k=1_000_000)
exact = {}
for x in stream: exact[x] = exact.get(x, 0) + 1
table = [[0] * wd for _ in range(dp)]
for x in stream:
    for r in range(dp): table[r][h(x, r) % wd] += 1
est = lambda x: min(table[r][h(x, r) % wd] for r in range(dp))
top_true = sorted(exact, key=exact.get, reverse=True)[:10]
top_est = sorted(range(N), key=est, reverse=True)[:10]
p("true top 10 items and counts", [(i, exact[i]) for i in top_true])
p("sketch top 10 found among the true top 10", f"{len(set(top_true) & set(top_est))} of 10")
errs = [est(i) - exact.get(i, 0) for i in top_true]
p("sketch minus true count for the true top 10 (never negative)", errs)
p("largest overcount over 2,000 random items", max(est(i) - exact.get(i, 0) for i in rng.sample(range(N), 2000)))
p("allowed error (0.1 percent of 1,000,000 events)", int(0.001 * 1_000_000))
sec("12D windows (assumption: top items of the last hour, kept as 1-minute buckets)")
p("buckets kept for a sliding hour", 60); p("memory with 54 KB sketch each", f"{60*wd*dp*4/1e6:.1f} MB")
sec("12E late events (simulation: 100,000 events, 5 percent arrive 3 minutes late, a window closes 1 minute after its end)")
rng = random.Random(13); late = sum(1 for _ in range(100_000) if rng.random() < 0.05)
p("events that miss their window if lateness over 1 minute is dropped", f"{late:,} ({late/1000:.1f}%)")
p("allowing 5 minutes of lateness", "0 dropped, the window result is delayed by 5 minutes")
