#!/usr/bin/env python3
"""Numbers for the PrepStack System Design (HLD) concept notes. Every number a draft shows comes from this file's output
(or is plain arithmetic shown in the draft). Run: python3 hld-check.py > hld-check-output.txt
Everything here is a made-up example or a computation; nothing is measured on a real system. Random parts use fixed seeds."""
import bisect
import hashlib
import itertools
import math
import random
from math import comb, ceil, exp, log

def sec(name):
    print("\n" + "=" * 8, name)

def p(label, value):
    print(f"{label}: {value}")

# ------------------------------------------------------------------ A. estimation (hld-approach-estimation)
sec("A1 seconds in a day and a quick rule")
p("seconds per day", 24 * 3600)
p("round to", "about 100,000 (86,400 is 14 percent lower, good enough for a first estimate)")

sec("A2 powers of two")
for name, e in [("KB", 10), ("MB", 20), ("GB", 30), ("TB", 40), ("PB", 50)]:
    p(f"2^{e} ({name})", f"{2**e:,} bytes; decimal 10^{int(e*0.3+0.5)*1} is about {10**(round(e*0.30103)):,}")

sec("A3 example traffic and storage (made-up numbers)")
dau, reads, writes = 100_000_000, 20, 2
avg_read = dau * reads / 86400
avg_write = dau * writes / 86400
p("daily active users", f"{dau:,}")
p("reads per user per day", reads); p("writes per user per day", writes)
p("average read QPS", f"{avg_read:,.0f}")
p("average write QPS", f"{avg_write:,.0f}")
p("peak read QPS if peak is 2x average", f"{2*avg_read:,.0f}")
p("peak write QPS if peak is 2x average", f"{2*avg_write:,.0f}")
size = 1000
daily_bytes = dau * writes * size
p("new data per day at 1 KB per write", f"{daily_bytes/1e9:,.0f} GB")
p("data kept for 5 years (no copies)", f"{daily_bytes*365*5/1e12:,.1f} TB")
p("same with 3 copies", f"{daily_bytes*365*5*3/1e12:,.1f} TB")
p("read bandwidth if each read returns 2 KB, at average QPS", f"{avg_read*2000/1e6:,.1f} MB per second")

sec("A4 latency numbers (Jeff Dean's talk, about 2007; orders of magnitude only)")
dean = [("L1 cache reference", 0.5), ("Branch mispredict", 5), ("L2 cache reference", 7), ("Mutex lock/unlock", 100),
        ("Main memory reference", 100), ("Read 1 MB sequentially from memory", 250_000),
        ("Round trip within same datacenter", 500_000), ("Disk seek", 10_000_000),
        ("Read 1 MB sequentially from disk", 30_000_000), ("Send packet CA->Netherlands->CA", 150_000_000)]
for n, ns in dean:
    p(n, f"{ns:,} ns")
mem = 100
p("if a main memory reference took 1 second: a datacenter round trip takes", f"{500_000/mem:,.0f} s = {500_000/mem/60:.0f} minutes")
p("                                            a disk seek takes", f"{10_000_000/mem:,.0f} s = {10_000_000/mem/86400:.2f} days")
p("                                            CA->Netherlands->CA takes", f"{150_000_000/mem/86400:.1f} days")
p("disk seek divided by memory reference", f"{10_000_000//mem:,}x")

sec("A5 availability in nines")
for a in [99.0, 99.9, 99.95, 99.99, 99.999]:
    down = (1 - a / 100)
    p(f"{a}%", f"per year {down*365*24*60:,.1f} min ({down*365*24:.2f} h); per 30 days {down*30*24*60:.1f} min; per day {down*86400:.1f} s")
p("two services in a row, each 99.9%", f"{0.999*0.999*100:.4f}%")
p("two copies in parallel, each 99.9%, if failures are independent", f"{(1-(0.001*0.001))*100:.4f}%")
p("three services in a row, each 99.95%", f"{0.9995**3*100:.4f}%")

# ------------------------------------------------------------------ B. scaling and load balancing
sec("B1 Little's law (concurrency = rate x time)")
p("1,000 requests per second, 100 ms each: requests in progress", 1000 * 0.1)
p("same service when latency grows to 2 s", 1000 * 2)
p("100 messages per second, 100 ms each: threads needed (AWS queue article example)", 100 * 0.1)
p("same when latency spikes to 10 s", 100 * 10)

sec("B2 N+2 capacity (Google SRE book chapter 22 example numbers)")
brk, peak = 5000, 19000
need = ceil(peak / brk)
p("breaking point per cluster (QPS)", brk); p("peak load (QPS)", peak)
p("clusters needed to carry peak", need); p("clusters for N+2", need + 2)
p("book says", "approximately six clusters")

sec("B3 round robin against least loaded on uneven requests (simulation, made-up costs)")
rng = random.Random(11)
costs = [rng.lognormvariate(0, 1.0) for _ in range(1000)]
servers = 5
rr = [0.0] * servers
for i, c in enumerate(costs):
    rr[i % servers] += c
ll = [0.0] * servers
for c in costs:
    ll[ll.index(min(ll))] += c
p("average work per server", f"{sum(costs)/servers:.1f}")
p("round robin: busiest / quietest server", f"{max(rr)/min(rr):.2f}")
p("round robin: busiest / average", f"{max(rr)/(sum(costs)/servers):.2f}")
p("least loaded (ideal, sees all work): busiest / quietest", f"{max(ll)/min(ll):.3f}")

sec("B4 hash mod N when N changes")
def h32(s): return int(hashlib.md5(s.encode()).hexdigest()[:8], 16)
keys = [f"key-{i}" for i in range(100_000)]
for a, b in [(4, 5), (10, 11), (100, 101)]:
    moved = sum(1 for k in keys if h32(k) % a != h32(k) % b)
    p(f"servers {a} -> {b}: keys that change server", f"{moved/len(keys)*100:.1f}% (ideal minimum 1/{b} = {100/b:.1f}%)")

# ------------------------------------------------------------------ C. caching
sec("C1 hit ratio changes the average time and the load on the database (made-up latencies)")
hit_ms, miss_ms, qps = 1, 21, 10_000
p("hit takes", f"{hit_ms} ms; a miss takes {miss_ms} ms (1 ms cache look-up + 20 ms database)")
for h in [0.5, 0.8, 0.9, 0.95, 0.99]:
    p(f"hit ratio {h*100:.0f}%", f"average {h*hit_ms+(1-h)*miss_ms:.1f} ms; database gets {(1-h)*qps:,.0f} of {qps:,} requests per second")

sec("C2 LRU against LFU on a fixed trace (simulation; keys follow a Zipf-like spread)")
rng = random.Random(7)
universe = 1000
weights = [1 / (i + 1) for i in range(universe)]
trace = rng.choices(range(universe), weights=weights, k=20000)
# a one-time scan of 1,000 new keys in the middle (like a batch job reading everything once)
scan = list(range(universe, universe + 1000))
trace2 = trace[:10000] + scan + trace[10000:]

def lru(trace, size):
    from collections import OrderedDict
    c = OrderedDict(); hits = 0; counted = 0
    for k in trace:
        real = k < universe  # the scan keys are not counted, only the regular requests are
        counted += real
        if k in c:
            hits += real; c.move_to_end(k)
        else:
            c[k] = 1
            if len(c) > size: c.popitem(last=False)
    return hits / counted

def lfu(trace, size):
    cnt = {}; stamp = {}; c = set(); hits = 0; t = 0; counted = 0
    for k in trace:
        t += 1
        real = k < universe
        counted += real
        if k in c:
            hits += real
        else:
            if len(c) >= size:
                victim = min(c, key=lambda x: (cnt[x], stamp[x]))
                c.remove(victim)
            c.add(k)
        cnt[k] = cnt.get(k, 0) + 1; stamp[k] = t
    return hits / counted

for size in [50, 100, 200]:
    p(f"cache size {size} (of {universe} keys), plain trace", f"LRU {lru(trace,size)*100:.1f}%  LFU {lfu(trace,size)*100:.1f}%")
for size in [50, 100, 200]:
    p(f"cache size {size}, same trace plus a 1,000-key one-time scan (only the 20,000 regular requests are counted)", f"LRU {lru(trace2,size)*100:.1f}%  LFU {lfu(trace2,size)*100:.1f}%")

sec("C3 stampede (many requests miss one key at once; made-up numbers)")
qps_key, refill_s = 2000, 0.05
p("a popular key gets", f"{qps_key:,} requests per second")
p("refilling it from the database takes", f"{refill_s*1000:.0f} ms")
p("requests that arrive while the first one refills (each goes to the database)", f"{qps_key*refill_s:.0f}")
p("with request coalescing (one refill, the rest wait)", 1)

# ------------------------------------------------------------------ D. databases (sizes only)
sec("D1 how big is it (made-up example)")
rows, row_bytes = 1_000_000_000, 200
p("1 billion rows of 200 bytes", f"{rows*row_bytes/1e9:,.0f} GB of table data")
p("with an index of 16 bytes per row", f"{rows*16/1e9:,.0f} GB more")
p("read 1 MB sequentially from disk (Dean, about 2007) versus 1 MB from memory", f"{30_000_000/250_000:.0f}x slower")

# ------------------------------------------------------------------ E. replication, partitioning, consistent hashing
sec("E1 consistent hashing ring: how many keys move when a node is added")
def ring(nodes, v):
    pts = sorted((h32(f"{n}#{i}"), n) for n in nodes for i in range(v))
    return [x for x, _ in pts], [n for _, n in pts]
def owner(r, key):
    xs, ns = r
    i = bisect.bisect(xs, h32(key)) % len(xs)
    return ns[i]
four = ["A", "B", "C", "D"]; five = four + ["E"]
for v in [1, 10, 100, 200]:
    r4, r5 = ring(four, v), ring(five, v)
    moved = sum(1 for k in keys if owner(r4, k) != owner(r5, k))
    load = {}
    for k in keys:
        n = owner(r5, k); load[n] = load.get(n, 0) + 1
    avg = len(keys) / 5
    p(f"virtual nodes per server {v}", f"moved when E joins {moved/len(keys)*100:.1f}% (ideal 20.0%); busiest node {max(load.values())/avg:.2f}x average, quietest {min(load.values())/avg:.2f}x")
p("moved keys all went to the new node", all(owner(ring(five, 100), k) == "E" for k in keys if owner(ring(four, 100), k) != owner(ring(five, 100), k)))

sec("E2 replica placement: walk the ring and take the next 3 different servers (v=100)")
r = ring(five, 100)
def replicas(r, key, n=3):
    xs, ns = r
    i = bisect.bisect(xs, h32(key)) % len(xs); out = []
    while len(out) < n:
        if ns[i % len(ns)] not in out: out.append(ns[i % len(ns)])
        i += 1
    return out
for k in ["user-1", "user-2", "user-3"]:
    p(k, replicas(r, k))

sec("E3 a hot partition (Zipf-like keys spread over 8 shards by hash)")
rng = random.Random(3)
w = [1 / (i + 1) for i in range(10_000)]
t = rng.choices(range(10_000), weights=w, k=200_000)
shard = [0] * 8
for k in t: shard[h32(f"k{k}") % 8] += 1
p("requests per shard", shard)
p("busiest shard / average", f"{max(shard)/(len(t)/8):.2f}")
p("share of all requests that hit the single hottest key", f"{t.count(0)/len(t)*100:.1f}%")

# ------------------------------------------------------------------ F. consistency, quorums, vector clocks
sec("F1 quorums: a read and a write quorum must overlap when R + W > N (checked by trying every pair of replica sets)")
for N in [3, 5]:
    print(f"N = {N}")
    for W in range(1, N + 1):
        for R in range(1, N + 1):
            overlap_always = all(set(a) & set(b) for a in itertools.combinations(range(N), W) for b in itertools.combinations(range(N), R))
            assert overlap_always == (R + W > N)
            if R + W > N or (R, W) in [(1, 1), (1, N), (N, 1)]:
                print(f"  W={W} R={R}: R+W>N {R+W>N}; every read set meets every write set: {overlap_always}; write survives {N-W} down, read survives {N-R} down")
p("(N, R, W) = (3, 2, 2)", "R+W = 4 > 3, tolerates 1 replica down for reads and for writes (Dynamo paper's common setting)")

sec("F2 vector clocks (made-up object, three servers X, Y, Z)")
def compare(a, b):
    ge = all(a.get(k, 0) >= v for k, v in b.items()); le = all(b.get(k, 0) >= v for k, v in a.items())
    return "same" if ge and le else "a is newer or equal (a descends from b)" if ge else "b is newer (b descends from a)" if le else "CONFLICT (neither descends from the other)"
d1 = {"X": 1}; d2 = {"X": 2}
d3 = {"X": 2, "Y": 1}; d4 = {"X": 2, "Z": 1}
p("write 1 at X", d1); p("write 2 at X (after write 1)", d2)
p("write 3 at Y, which saw write 2", d3); p("write 4 at Z, which saw write 2", d4)
p("compare write 2 with write 1", compare(d2, d1))
p("compare write 3 with write 4", compare(d3, d4))
merged = {"X": 3, "Y": 1, "Z": 1}
p("client merges 3 and 4, X writes the result", merged)
p("compare merged with write 3", compare(merged, d3)); p("compare merged with write 4", compare(merged, d4))

sec("F3 last write wins loses a newer write when clocks differ (made-up)")
p("server A clock runs 5 ms fast. A writes 'blue' at true time 100 ms", "stamp 105")
p("server B (accurate clock) writes 'green' at true time 103 ms, which is later in real life", "stamp 103")
p("last-write-wins keeps", "'blue' (stamp 105 > 103): the later real write is lost")

# ------------------------------------------------------------------ G. consensus
sec("G1 majority and failures tolerated")
for n in range(1, 8):
    maj = n // 2 + 1
    p(f"{n} servers", f"majority {maj}, tolerates {n-maj} down; SRE rule 2f+1: f = {(n-1)//2}")
sec("G2 chance that a majority is up (each server up with probability 0.99, independent; made-up)")
for n in [3, 5, 6, 7]:
    maj = n // 2 + 1
    ok = sum(comb(n, k) * 0.99**k * 0.01**(n - k) for k in range(maj, n + 1))
    p(f"{n} servers", f"{ok*100:.5f}% (down about {(1-ok)*365*24*60:.2f} min a year)")
sec("G3 split votes: Raft picks election timeouts at random in a range (Monte Carlo; the network delay is an assumption)")
rng = random.Random(5)
def split(lo, hi, followers, delay, trials=200_000):
    c = 0
    for _ in range(trials):
        ts = sorted(rng.uniform(lo, hi) for _ in range(followers))
        if ts[1] - ts[0] < delay: c += 1
    return c / trials
for lo, hi in [(150, 300), (150, 160), (150, 500)]:
    for d in [10, 20]:
        p(f"4 followers, timeouts uniform in {lo} to {hi} ms, message delay {d} ms", f"two or more time out within the delay: {split(lo,hi,4,d)*100:.1f}% of elections")
sec("G4 fencing token trace (Kleppmann's example)")
store = {"max_token": 0, "value": None}
def write(client, token, value):
    if token < store["max_token"]:
        return f"{client} write with token {token} REJECTED (storage has seen {store['max_token']})"
    store["max_token"] = token; store["value"] = value
    return f"{client} write with token {token} accepted"
print("client 1 gets lock token 33, then pauses for longer than its lease")
print("client 2 gets lock token 34"); print(write("client 2", 34, "from 2"))
print("client 1 wakes up and still believes it holds the lock"); print(write("client 1", 33, "from 1"))

# ------------------------------------------------------------------ H. messaging
sec("H1 backlog after an outage (arrival rate L per second, consumers can do M per second)")
for mult in [1.25, 1.5, 2, 3]:
    L = 100; M = L * mult; outage = 3600
    backlog = L * outage
    p(f"capacity {mult}x arrivals, hour-long outage", f"backlog {backlog:,.0f} messages; drains in {backlog/(M-L)/60:,.0f} minutes")
p("AWS article example: capacity exactly 2x -> an hour-long outage takes", "another hour to clear (3600 s backlog / (2L-L)/L = 3600 s)")
sec("H2 partitions limit how many consumers can work in one group")
for parts, cons in [(6, 3), (6, 6), (6, 10)]:
    p(f"{parts} partitions, {cons} consumers", f"{min(parts,cons)} busy, {max(0,cons-parts)} idle")
sec("H3 at-least-once delivery and duplicates (simulation: crash after processing, before saving the offset)")
rng = random.Random(2)
n_msgs, crash = 100_000, 0.001
dups = 0
for _ in range(n_msgs):
    if rng.random() < crash: dups += 1
p("messages", f"{n_msgs:,}"); p("chance of a crash between processing and saving the position", crash)
p("messages processed twice", f"{dups} (about {n_msgs*crash:.0f} expected)")
p("same run with an idempotent consumer (it remembers ids it has handled)", "0 duplicate effects")
sec("H4 order within a key (hash of the key picks the partition)")
for k in ["user-1", "user-2", "user-3", "user-4", "user-5", "user-6"]:
    p(k, f"partition {h32(k) % 4} of 4")

# ------------------------------------------------------------------ I. rate limiting
sec("I1 limit 5 requests per 10 seconds; five requests at 9.0-9.8 s and five at 10.0-10.8 s")
trace = [9.0, 9.2, 9.4, 9.6, 9.8, 10.0, 10.2, 10.4, 10.6, 10.8]
LIMIT, WIN = 5, 10.0
def fixed_window(tr):
    cnt = {}; out = []
    for t in tr:
        w = int(t // WIN); cnt[w] = cnt.get(w, 0)
        if cnt[w] < LIMIT: cnt[w] += 1; out.append(True)
        else: out.append(False)
    return out
def sliding_log(tr):
    log_ = []; out = []
    for t in tr:
        log_ = [x for x in log_ if x > t - WIN]
        if len(log_) < LIMIT: log_.append(t); out.append(True)
        else: out.append(False)
    return out
def sliding_counter(tr):
    cnt = {}; out = []
    for t in tr:
        w = int(t // WIN); frac = (t % WIN) / WIN
        est = cnt.get(w - 1, 0) * (1 - frac) + cnt.get(w, 0)
        if est < LIMIT: cnt[w] = cnt.get(w, 0) + 1; out.append(True)
        else: out.append(False)
    return out
def token_bucket(tr, cap=5, rate=0.5):
    tokens = cap; last = tr[0]; out = []
    for t in tr:
        tokens = min(cap, tokens + (t - last) * rate); last = t
        if tokens >= 1: tokens -= 1; out.append(True)
        else: out.append(False)
    return out
for name, fn in [("fixed window", fixed_window), ("sliding window log (exact)", sliding_log), ("sliding window counter (estimate)", sliding_counter), ("token bucket (5 tokens, 0.5 a second)", token_bucket)]:
    res = fn(trace)
    p(name, f"allowed {sum(res)} of {len(trace)}: {''.join('Y' if x else 'n' for x in res)}")
p("fixed window lets through", "10 requests inside 1.8 seconds although the limit is 5 per 10 seconds (twice the limit around the boundary)")

sec("I2 how often the approximations disagree with the exact log (random arrivals, made-up)")
rng = random.Random(9)
t = 0.0; tr = []
for _ in range(20000):
    t += rng.expovariate(1.0)  # about 1 request per second, limit 5 per 10 s is often near the edge
    tr.append(t)
exact = sliding_log(tr)
for name, fn in [("fixed window", fixed_window), ("sliding window counter", sliding_counter)]:
    res = fn(tr); dis = sum(1 for a, b in zip(exact, res) if a != b)
    p(name, f"decides differently from the exact log on {dis/len(tr)*100:.2f}% of requests; allowed {sum(res)/len(res)*100:.1f}% (exact allows {sum(exact)/len(exact)*100:.1f}%)")

sec("I3 memory per user for 1,000,000 users, limit 100 per minute (assumption: 8 bytes per number)")
users = 1_000_000
p("sliding window log (up to 100 timestamps)", f"{users*100*8/1e6:,.0f} MB")
p("sliding window counter (2 counts)", f"{users*2*8/1e6:,.0f} MB")
p("token bucket (a count and a time)", f"{users*2*8/1e6:,.0f} MB")

# ------------------------------------------------------------------ J. reliability
sec("J1 retries multiply (SRE chapter 22 and 21, AWS timeouts article)")
p("3 retries = 4 attempts per layer; 3 layers", f"4^3 = {4**3} attempts on the database for one user request")
p("5 layers in a chain, 3 retries (4 attempts) each (made-up chain)", f"4^5 = {4**5} attempts at the bottom for one user request")
p("per-client retry budget of 10 percent", "worst case 1.1x load instead of about 3x (SRE chapter 21)")
sec("J2 retry storm: 1,000 clients all fail at t = 0, then retry (simulation, made-up)")
rng = random.Random(4)
def schedule(jitter, attempts=6, base=0.1, cap=10.0):
    times = []
    for _ in range(1000):
        t = 0.0; ts = []
        for a in range(attempts):
            d = min(cap, base * 2 ** a)
            t += rng.uniform(0, d) if jitter else d
            ts.append(t)
        times.append(ts)
    return times
for name, jit in [("exponential backoff, no jitter", False), ("exponential backoff, full jitter", True)]:
    ts = schedule(jit)
    per_attempt = []
    for a in range(6):
        slots = {}
        for client in ts:
            b = int(client[a] / 0.05); slots[b] = slots.get(b, 0) + 1
        per_attempt.append(max(slots.values()))
    p(name, f"busiest 50 ms slot for retry 1, 2, 3, 4, 5, 6: {per_attempt} (of 1,000 clients)")
sec("J3 error budget")
for a in [99.9, 99.95, 99.99]:
    p(f"SLO {a}% over 30 days", f"{(1-a/100)*30*24*60:.1f} minutes of allowed failure")
sec("J4 queues and deadlines (SRE chapter 22 examples)")
p("queue 10x the thread count, 100 ms a request", "a full queue means 10 x 100 ms + 100 ms = 1.1 s (1.0 s waiting)")
p("deadline 30 s; 7 s used by the first service", f"{30-7} s left for B; B uses 4 s: {30-7-4} s left for C")
sec("J5 bimodal latency (SRE chapter 22 example)")
threads, q, fast, slow, frac_slow = 1000, 1000, 0.1, 100, 0.05
mean_time = (1 - frac_slow) * fast + frac_slow * slow
p("thread-seconds per request", f"{mean_time:.3f}")
p("requests per second the 1,000 threads can finish", f"{threads/mean_time:.0f} of {q} arriving")
p("share served", f"{threads/mean_time/q*100:.1f}%; share failed: {100-threads/mean_time/q*100:.1f}%")

# ------------------------------------------------------------------ K. storage and special indexes
sec("K1 Bloom filter: false positive rate p = (1 - e^(-kn/m))^k, best k = (m/n) ln 2")
n = 1_000_000
for bits_per in [5, 8, 10, 15]:
    m = n * bits_per; k = max(1, round(bits_per * log(2)))
    pp = (1 - exp(-k * n / m)) ** k
    p(f"{bits_per} bits per item, {k} hash functions", f"false positive rate {pp*100:.2f}%; memory for 1,000,000 items {m/8/1e6:.2f} MB")
need_bits = -log(0.01) / (log(2) ** 2)
p("bits per item for a 1% rate (best k)", f"{need_bits:.2f} bits, k = {need_bits*log(2):.1f}")
rng = random.Random(1)
m, k, items = 80_000, 6, 10_000   # 8 bits per item
bits = bytearray(m)
def positions(x): return [h32(f"{x}:{i}") % m for i in range(k)]
for i in range(items):
    for pos in positions(f"in-{i}"): bits[pos] = 1
fp = sum(1 for i in range(20000) if all(bits[pos] for pos in positions(f"out-{i}")))
p("measured: 10,000 items, 8 bits each, k = 6; 20,000 absent keys tested", f"{fp/200:.2f}% reported present (formula {(1-exp(-k*items/m))**k*100:.2f}%)")
sec("K2 replication against erasure coding (storing 1 PB of user data)")
for name, k_, m_ in [("3 copies", 1, 2), ("Reed-Solomon 6 data + 3 parity", 6, 3), ("Reed-Solomon 10 data + 4 parity", 10, 4)]:
    p(name, f"stored {(k_+m_)/k_:.2f} PB; extra {((k_+m_)/k_-1)*100:.0f}%; survives {m_} lost pieces")
sec("K3 chunk size and the master's memory (GFS paper: under 64 bytes of metadata per 64 MB chunk)")
data = 1 * 2**50
chunks = data / (64 * 2**20)
p("1 PB of files in 64 MB chunks", f"{chunks:,.0f} chunks")
p("master metadata at 64 bytes a chunk", f"{chunks*64/2**30:.2f} GiB")
p("same data in 4 KB blocks (made-up comparison)", f"{data/4096:,.0f} blocks; at 64 bytes each {data/4096*64/2**40:.0f} TiB of metadata")
sec("K4 geohash cell size (a geohash character carries 5 bits, alternating longitude then latitude)")
for chars in range(1, 9):
    bits_total = 5 * chars; lon_bits = (bits_total + 1) // 2; lat_bits = bits_total // 2
    w = 360 / 2 ** lon_bits; hgt = 180 / 2 ** lat_bits
    p(f"{chars} characters", f"cell {w:.5f} x {hgt:.5f} degrees; at the equator about {w*111.32*1000:,.0f} m wide x {hgt*110.57*1000:,.0f} m tall (width: 1 degree of longitude = 40,075 km / 360 = 111.32 km; height: 110.57 km a degree of latitude near the equator)")
sec("K5 inverted index (three tiny documents)")
docs = {1: "cold coffee", 2: "hot coffee shop", 3: "hot tea"}
index = {}
for d, text in docs.items():
    for word in text.split(): index.setdefault(word, []).append(d)
for w, ids in sorted(index.items()): p(w, ids)
p("search 'hot coffee' (documents that have both words)", sorted(set(index['hot']) & set(index['coffee'])))
