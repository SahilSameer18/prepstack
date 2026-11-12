"""Computes every number used in the Operating Systems notes (Phase 2, 12 Nov 2026).
Run: python docs/content/checks/os-check.py
The notes may use only numbers printed here (or plain arithmetic shown in the note). Inputs are our own small examples
(the sizes are chosen to be easy to follow); the algorithms are the standard ones from OSTEP and the os-book slides."""
from math import ceil
from itertools import count


def hdr(t):
    print('\n=== ' + t + ' ===')


# ---------------------------------------------------------------- CPU scheduling
def fcfs(ps):
    t, res = 0, {}
    for n, a, b in sorted(ps, key=lambda p: p[1]):
        t = max(t, a)
        res[n] = (t, t + b)  # start, finish
        t += b
    return res


def sjf(ps):  # non-preemptive shortest job first
    left, t, res = list(ps), 0, {}
    while left:
        ready = [p for p in left if p[1] <= t] or [min(left, key=lambda p: p[1])]
        p = min(ready, key=lambda p: (p[2], p[1]))
        t = max(t, p[1])
        res[p[0]] = (t, t + p[2])
        t += p[2]
        left.remove(p)
    return res


def srtf(ps):  # preemptive shortest remaining time first, 1-unit steps
    rem = {n: b for n, a, b in ps}
    arr = {n: a for n, a, b in ps}
    fin, t, order = {}, 0, []
    while rem:
        ready = [n for n in rem if arr[n] <= t]
        if not ready:
            t += 1
            continue
        n = min(ready, key=lambda x: (rem[x], arr[x]))
        if not order or order[-1][0] != n:
            order.append([n, t, t + 1])
        else:
            order[-1][2] = t + 1
        rem[n] -= 1
        t += 1
        if rem[n] == 0:
            del rem[n]
            fin[n] = t
    return fin, order


def rr(ps, q):
    arr = {n: a for n, a, b in ps}
    rem = {n: b for n, a, b in ps}
    queue, t, fin, first, order = [], 0, {}, {}, []
    pending = sorted(ps, key=lambda p: p[1])
    i = 0
    while pending[i:] or queue:
        while i < len(pending) and pending[i][1] <= t:
            queue.append(pending[i][0]); i += 1
        if not queue:
            t = pending[i][1]; continue
        n = queue.pop(0)
        first.setdefault(n, t)
        run = min(q, rem[n])
        order.append((n, t, t + run))
        t += run
        rem[n] -= run
        while i < len(pending) and pending[i][1] <= t:
            queue.append(pending[i][0]); i += 1
        if rem[n] > 0:
            queue.append(n)
        else:
            fin[n] = t
    return fin, first, order


def report(name, ps, fin):
    arr = {n: a for n, a, b in ps}; bur = {n: b for n, a, b in ps}
    wt = {n: fin[n] - arr[n] - bur[n] for n in fin}
    tat = {n: fin[n] - arr[n] for n in fin}
    print(name, 'finish', fin, 'waiting', wt, 'avg wait', round(sum(wt.values()) / len(wt), 2),
          'turnaround', tat, 'avg turnaround', round(sum(tat.values()) / len(tat), 2))


hdr('CPU scheduling example A: P1 burst 24, P2 burst 3, P3 burst 3, all arrive at 0 (convoy effect)')
A = [('P1', 0, 24), ('P2', 0, 3), ('P3', 0, 3)]
r = fcfs(A); report('FCFS order P1,P2,P3', A, {n: v[1] for n, v in r.items()})
A2 = [('P2', 0, 3), ('P3', 0, 3), ('P1', 0, 24)]
r = fcfs(A2); report('FCFS order P2,P3,P1', A2, {n: v[1] for n, v in r.items()})
r = sjf(A); report('SJF', A, {n: v[1] for n, v in r.items()})
fin, first, order = rr(A, 4); report('RR q=4', A, fin); print('RR q=4 timeline', order)

hdr('CPU scheduling example B: P1 0/8, P2 1/4, P3 2/9, P4 3/5 (arrival/burst)')
B = [('P1', 0, 8), ('P2', 1, 4), ('P3', 2, 9), ('P4', 3, 5)]
r = fcfs(B); report('FCFS', B, {n: v[1] for n, v in r.items()})
r = sjf(B); report('SJF non-preemptive', B, {n: v[1] for n, v in r.items()})
fin, order = srtf(B); report('SRTF', B, fin); print('SRTF timeline', order)
fin, first, order = rr(B, 4); report('RR q=4', B, fin)
resp = {n: first[n] - a for n, a, b in B}; print('RR q=4 response times', resp, 'avg', sum(resp.values()) / 4)

hdr('Priority (lower number = higher priority, non-preemptive), all arrive 0: P1 b10 p3, P2 b1 p1, P3 b2 p4, P4 b1 p5, P5 b5 p2')
P = [('P1', 10, 3), ('P2', 1, 1), ('P3', 2, 4), ('P4', 1, 5), ('P5', 5, 2)]
t, wt = 0, {}
for n, b, p in sorted(P, key=lambda x: x[2]):
    wt[n] = t; t += b
print('order', [n for n, b, p in sorted(P, key=lambda x: x[2])], 'waiting', wt, 'avg', sum(wt.values()) / 5)

hdr('Ratio check: HRRN response ratio (W+B)/B for a process that waited 6 with burst 3')
print((6 + 3) / 3)

# ---------------------------------------------------------------- fork
hdr('fork count: n fork() calls in a row, no conditions')
for n in range(1, 5):
    print(n, 'fork calls -> total processes', 2 ** n, 'children', 2 ** n - 1)

# ---------------------------------------------------------------- synchronization
hdr('Race condition: two threads each do counter = counter + 1 (read, add, write) 1 time, counter starts at 0')
import itertools
def run(order):
    c = 0; reg = {}
    for who, step in order:
        if step == 'r': reg[who] = c
        elif step == 'w': c = reg[who] + 1
    return c
seqs = set()
steps = [('A', 'r'), ('A', 'w'), ('B', 'r'), ('B', 'w')]
for perm in itertools.permutations(steps):
    if perm.index(('A', 'r')) < perm.index(('A', 'w')) and perm.index(('B', 'r')) < perm.index(('B', 'w')):
        seqs.add((perm, run(perm)))
vals = sorted({v for _, v in seqs}); print('orders allowed', len(seqs), 'possible final values', vals)
from collections import Counter
print('how many orders give each final value', dict(Counter(v for _, v in seqs)))
# three-step model: each thread reads, adds in a register, then writes (the add step does not touch shared state)
def run3(order):
    c = 0; reg = {}
    for who, step in order:
        if step == 'r': reg[who] = c
        elif step == 'a': reg[who] = reg[who] + 1
        else: c = reg[who]
    return c
steps3 = [('A', 'r'), ('A', 'a'), ('A', 'w'), ('B', 'r'), ('B', 'a'), ('B', 'w')]
res3 = []
for perm in itertools.permutations(steps3):
    ok = all(perm.index((w, 'r')) < perm.index((w, 'a')) < perm.index((w, 'w')) for w in 'AB')
    if ok: res3.append(run3(perm))
print('three-step model: orders', len(res3), 'final values', dict(Counter(res3)))

hdr('Producer-consumer with semaphores: buffer size 3; empty=3, full=0')
empty, full = 3, 0
log = []
for act in ['P', 'P', 'P', 'C', 'P', 'C', 'C', 'C']:
    if act == 'P':
        if empty == 0: log.append('P blocks'); continue
        empty -= 1; full += 1
    else:
        if full == 0: log.append('C blocks'); continue
        full -= 1; empty += 1
    log.append((act, 'empty', empty, 'full', full))
print(log)

# ---------------------------------------------------------------- deadlock / Banker's
hdr("Banker's algorithm: 5 processes, resources A,B,C; Available (3,3,2)")
alloc = {'P0': (0, 1, 0), 'P1': (2, 0, 0), 'P2': (3, 0, 2), 'P3': (2, 1, 1), 'P4': (0, 0, 2)}
mx = {'P0': (7, 5, 3), 'P1': (3, 2, 2), 'P2': (9, 0, 2), 'P3': (2, 2, 2), 'P4': (4, 3, 3)}
avail = (3, 3, 2)
need = {p: tuple(m - a for m, a in zip(mx[p], alloc[p])) for p in alloc}
print('need', need)
def safe(avail, alloc, need):
    work, done, seq = list(avail), set(), []
    while len(done) < len(alloc):
        for p in sorted(alloc):
            if p not in done and all(n <= w for n, w in zip(need[p], work)):
                work = [w + a for w, a in zip(work, alloc[p])]; done.add(p); seq.append(p); break
        else:
            return False, seq
    return True, seq
print('safe?', safe(avail, alloc, need))
req = ('P1', (1, 0, 2))  # P1 asks for (1,0,2)
p, rq = req
a2 = dict(alloc); n2 = dict(need)
newavail = tuple(x - y for x, y in zip(avail, rq))
a2[p] = tuple(x + y for x, y in zip(alloc[p], rq)); n2[p] = tuple(x - y for x, y in zip(need[p], rq))
print('P1 requests (1,0,2): new available', newavail, 'safe?', safe(newavail, a2, n2))
req2 = ('P4', (3, 3, 0))
p, rq = req2
a4 = dict(alloc); n4 = dict(need)
nav4 = tuple(x - y for x, y in zip(avail, rq))
a4[p] = tuple(x + y for x, y in zip(alloc[p], rq)); n4[p] = tuple(x - y for x, y in zip(need[p], rq))
print('P4 requests (3,3,0): within its need', all(r <= n for r, n in zip(rq, need[p])), 'within available', all(r <= a for r, a in zip(rq, avail)),
      'new available', nav4, 'safe?', safe(nav4, a4, n4))
print('note: more than one safe sequence can exist; the code picks the first eligible process each round')
req3 = ('P0', (0, 2, 0))
p, rq = req3
a3 = dict(alloc); n3 = dict(need)
nav = tuple(x - y for x, y in zip(avail, rq))
a3[p] = tuple(x + y for x, y in zip(alloc[p], rq)); n3[p] = tuple(x - y for x, y in zip(need[p], rq))
print('P0 requests (0,2,0): new available', nav, 'safe?', safe(nav, a3, n3))

# ---------------------------------------------------------------- memory
hdr('Paging address split: 32-bit addresses, 4 KB pages')
off_bits = 12; pg_bits = 32 - off_bits
print('offset bits', off_bits, 'page number bits', pg_bits, 'pages', 2 ** pg_bits)
addr = 0x00403A7C
print('address', hex(addr), 'page number', hex(addr >> off_bits), '=', addr >> off_bits, 'offset', hex(addr & 0xFFF), '=', addr & 0xFFF)
print('page table size with 4-byte entries (bytes)', 2 ** pg_bits * 4, '=', 2 ** pg_bits * 4 / 2 ** 20, 'MB')
frame = 0x1F
print('if page 0x403 maps to frame 0x1F, physical address', hex((frame << off_bits) | (addr & 0xFFF)))

hdr('Internal fragmentation: process of 72,766 bytes, page size 2,048 bytes')
pages = ceil(72766 / 2048); print('pages', pages, 'bytes allocated', pages * 2048, 'internal fragmentation', pages * 2048 - 72766)

hdr('Segmentation: segment table (base,limit): seg0 (1400,1000) seg1 (6300,400) seg2 (4300,400)')
seg = {0: (1400, 1000), 1: (6300, 400), 2: (4300, 400)}
for s, o in [(2, 53), (1, 852), (0, 999)]:
    b, l = seg[s]; print('segment', s, 'offset', o, '->', 'trap (offset >= limit)' if o >= l else b + o)

hdr('Contiguous allocation holes 100,500,200,300,600 and processes 212,417,112,426 (in this order)')
def place(strategy):
    holes = [100, 500, 200, 300, 600]; out = []
    for p in [212, 417, 112, 426]:
        c = [i for i, h in enumerate(holes) if h >= p]
        if not c: out.append((p, 'waits')); continue
        i = c[0] if strategy == 'first' else (min(c, key=lambda i: holes[i]) if strategy == 'best' else max(c, key=lambda i: holes[i]))
        out.append((p, 'hole', holes[i])); holes[i] -= p
    return out, holes
for s in ['first', 'best', 'worst']:
    print(s, place(s))

hdr('TLB effective access time: TLB lookup 20 ns, memory access 100 ns, one-level page table')
for h in [0.80, 0.99]:
    eat = h * (20 + 100) + (1 - h) * (20 + 100 + 100)
    print('hit ratio', h, 'EAT', round(eat, 2), 'ns')

hdr('Page faults with 3 frames on 7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1')
def fifo(r, n):
    m, f = [], 0
    for x in r:
        if x not in m:
            f += 1
            if len(m) == n: m.pop(0)
            m.append(x)
    return f
def lru(r, n):
    m, f = [], 0
    for x in r:
        if x in m: m.remove(x)
        else:
            f += 1
            if len(m) == n: m.pop(0)
        m.append(x)
    return f
def opt(r, n):
    m, f = [], 0
    for i, x in enumerate(r):
        if x in m: continue
        f += 1
        if len(m) == n:
            nxt = lambda p: r.index(p, i + 1) if p in r[i + 1:] else 10 ** 9
            m.remove(max(m, key=nxt))
        m.append(x)
    return f
R = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1]
print('FIFO', fifo(R, 3), 'LRU', lru(R, 3), 'OPT', opt(R, 3), 'references', len(R))
Bel = [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5]
print('Belady string', Bel, 'FIFO 3 frames', fifo(Bel, 3), 'FIFO 4 frames', fifo(Bel, 4), 'LRU 3', lru(Bel, 3), 'LRU 4', lru(Bel, 4))

hdr('Effective access time with page faults: memory 200 ns, fault service 8 ms, fault rate 1 in 1000')
p = 1 / 1000; eat = (1 - p) * 200 + p * 8_000_000
print('EAT ns', eat, 'slowdown vs 200 ns', round(eat / 200, 1))
print('fault rate that keeps slowdown under 10 percent (EAT <= 220 ns):', (220 - 200) / (8_000_000 - 200))

# ---------------------------------------------------------------- disks and files
hdr('Disk scheduling: head at 53, tracks 0..199, queue 98 183 37 122 14 124 65 67')
q = [98, 183, 37, 122, 14, 124, 65, 67]; head = 53; MAXT = 199
def dist(path): return sum(abs(a - b) for a, b in zip(path, path[1:]))
fc = [head] + q
print('FCFS order', q, 'movement', dist(fc))
rem, cur, path = list(q), head, [head]
while rem:
    n = min(rem, key=lambda x: abs(x - cur)); rem.remove(n); path.append(n); cur = n
print('SSTF order', path[1:], 'movement', dist(path))
lo = sorted(x for x in q if x < head)[::-1]; hi = sorted(x for x in q if x >= head)
sc = [head] + lo + [0] + hi
print('SCAN (toward 0 first) order', lo + [0] + hi, 'movement', dist(sc))
sc2 = [head] + hi + [MAXT] + lo
print('SCAN (toward 199 first) order', hi + [MAXT] + lo, 'movement', dist(sc2))
cs = [head] + hi + [MAXT, 0] + sorted(lo)
print('C-SCAN (toward 199, jump to 0) order', hi + [MAXT, 0] + sorted(lo), 'movement incl. the jump', dist(cs))
lk = [head] + hi + lo
print('LOOK (toward 199 first) order', hi + lo, 'movement', dist(lk))
cl = [head] + hi + sorted(lo)
print('C-LOOK order', hi + sorted(lo), 'movement incl. the jump', dist(cl))

hdr('RAID capacity: 4 disks of 1 TB each')
print('RAID 0', 4, 'TB; RAID 1 (two mirrored pairs)', 2, 'TB; RAID 5 (one disk of parity)', 3, 'TB; RAID 6', 2, 'TB')

hdr('Unix-style inode: 12 direct pointers, 1 single, 1 double, 1 triple indirect; block 4 KB, pointer 4 bytes')
bs = 4096; ptr = 4; per = bs // ptr
print('pointers per block', per)
direct = 12 * bs; single = per * bs; double = per ** 2 * bs; triple = per ** 3 * bs
print('direct bytes', direct, '=', direct // 1024, 'KB; single adds', single // 1024 ** 2, 'MB; double adds', double // 1024 ** 3, 'GB; triple adds', triple // 1024 ** 4, 'TB')
tot = direct + single + double + triple
print('max file size bytes', tot, '~', round(tot / 1024 ** 4, 4), 'TB')
print('file of 100 KB uses direct blocks:', ceil(100 * 1024 / bs), '(12 direct only if <= 12; else needs indirect)')

hdr('Pipe capacity from man page: 16 pages x 4096 bytes')
print(16 * 4096)
