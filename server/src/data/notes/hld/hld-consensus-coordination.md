---
id: hld-consensus-coordination
title: Consensus and Coordination
lastChecked: 2026-11-13
next: hld-messaging-streaming
roadmapSteps: devops-cloud:monitoring-reliability, backend:deployment-cloud
---
<!-- Published 13 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and AI reviewers read it (two for accuracy, one for plain words); no second person did. Written from docs/content/source-notes/hld-drafts.md and hld-phase1.md. Numbers computed by docs/content/checks/hld-check.py. Claims: docs/content/SOURCES.md. -->

## Overview

Consensus (several servers agreeing on one value, even when some crash or messages are lost) stands behind many leader elections (choosing one server to be in charge), lock services (a server that makes sure only one client holds a lock) and replicated logs (the same list of commands kept on several servers). Interviewers ask about it because "who is the leader?" must have exactly one answer.

After this section you can explain why a majority is needed, why six servers are no better than five, how Raft elects a leader and commits a write, and why a lock with a time limit needs a fencing token.

## Topic: The problem and split brain

**Definition:** Consensus means a group of servers agrees on one value (for example "the leader is server B") and never changes its mind, even if servers crash and messages are delayed or lost. Split brain (two servers both believing they are the leader) is what happens when this goes wrong.

**Why:** A server cannot tell a crashed partner from a slow network, so a timer alone can be wrong.

**Example:** Google's SRE book (chapter 23) tells of file servers in pairs, each sending heartbeats (small "I am alive" messages) to its partner. When they stopped, a server sent a STONITH command ("shoot the other node in the head", which shuts the partner down) and took over. On a slow network, timeouts fired wrongly and some shutdown commands never arrived, so both servers could end up active, or both down. Simple timeouts cannot elect a leader correctly.

**Failure:** Saying "we use heartbeats and a timeout to pick the leader". The next question: what if the network is slow, not the leader dead? A famous proof (FLP, by Fischer, Lynch and Paterson) says that where messages can take any amount of time, no algorithm can promise to always reach agreement. Real systems always keep "never two leaders" and reach agreement most of the time.

## Topic: Majority quorums and the 2f + 1 rule

**Definition:** A quorum is the number of servers that must say yes before a decision counts. A majority is more than half. Two majorities of the same group always share at least one server, so two different decisions can never both win. With 5 servers (2 x 2 + 1), a majority of 3 remains after 2 fail. In general, 2f + 1 servers tolerate f failures (SRE book, chapter 23; this counts crashes only).

**Why:** The shared server remembers the earlier decision and blocks a conflicting one.

**Example:** Majority and failures tolerated:

| Servers | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|
| Majority | 1 | 2 | 2 | 3 | 3 | 4 | 4 |
| Down allowed | 0 | 0 | 1 | 1 | 2 | 2 | 3 |

The SRE book calls three the minimum and recommends five, so one planned maintenance and one unplanned failure can happen together. Chubby (Google's lock service) usually runs five replicas per cell, and three must be up. Assumption: each server is up 99 percent of the time, failures independent. Minutes a year with no majority: 3 servers 156.63, 5 servers 5.18, 6 servers 10.28, 7 servers 0.18. Six is worse than five: it needs 4 up and still tolerates only 2 down.

**Failure:** "More replicas is always more available" is wrong: 5 to 6 lowers availability, 5 to 7 raises it. The SRE book also notes that a sixth server in a data centre that already holds one of the five makes one outage remove two.

## Topic: Raft in plain words

**Definition:** Raft (a consensus algorithm) keeps a log (an ordered list of commands) identical on every server. Each server is a leader, a follower or a candidate (a follower asking for votes). One leader handles all client requests. Time is cut into numbered terms; each starts with an election, and a stale term number tells a server its information is old.

**Why:** If every server applies the same commands in the same order, they all end in the same state.

**Example:**
- Election. A follower that hears no leader within its election timeout adds 1 to its term, votes for itself and asks for votes. Each server votes for at most one candidate per term, and refuses a candidate whose log is behind its own, so a new leader holds every committed entry. A candidate with a majority wins and sends heartbeats (AppendEntries messages with no entries).
- Write. The leader adds the command to its log and sends it with AppendEntries (the message that carries new entries). It is committed (safe to apply) once the leader has stored it on a majority; then the leader answers the client. (A leader never counts replicas to commit an entry from an older term.)
- Random timeouts. A second server that times out before it hears the first candidate's request (assume a delay of about 10 ms) splits the votes. In a simulation with 4 followers this happened in 24.1 percent of elections with timeouts spread over 150 to 300 ms, and in 100 percent squeezed into 150 to 160 ms, because that range is no wider than the delay.

**Failure:** Saying Raft needs every server. It needs a majority: a five-server cluster tolerates two failures. A split vote (nobody gets a majority) is not an error: the term ends and a new election starts.

## Topic: Paxos and Multi-Paxos

**Definition:** Paxos is an older consensus protocol. Multi-Paxos runs it for a whole series of values with a stable leader (a proposer, the server that suggests values, that stays in charge). Each value then needs only one round trip (one message out, one answer back) from the leader to a majority (SRE book, chapter 23).

**Why:** Two proposers can keep outbidding each other without either finishing (dueling proposers). A stable leader avoids this. Own reasoning: a new leader must first run an extra election round.

**Example:** Spanner (Google, 2012) runs one Paxos state machine on each tablet (a piece of the data), with long-lived leaders and time-based leader leases of 10 seconds by default. Chubby uses Paxos too (Bigtable paper).

**Failure:** Raft and Paxos both solve consensus; Raft's goal was to be easier to understand. The SRE book says to use a formally proven, well-tested consensus system, for example through a service such as ZooKeeper, Consul or etcd, rather than build consensus into each application.

## Topic: Distributed locks, leases and fencing tokens

**Definition:** A distributed lock lets only one client use a resource at a time. A client may crash while holding a lock, so it is given as a lease (a lock that expires after a time limit). A fencing token is a number that grows each time the lock is granted. The client sends it with every write, and the storage rejects any token lower than one it has already seen (Kleppmann, 2016).

**Why:** A lease cannot protect a client that is paused. A pause while the program cleans up its memory (garbage collection), a stalled disk or a delayed packet can make a client wake up after its lease ended and write anyway. Checking the lease just before writing does not help: the pause can come after the check.

**Example:** (Kleppmann's example) Client 1 gets token 33, then pauses past its lease. Client 2 gets token 34 and writes with 34: accepted. Client 1 wakes, still thinks it holds the lock, and writes with 33. Storage rejects it because it has seen 34.

**Failure:** Kleppmann splits locks by purpose:
- Efficiency (avoid doing the same work twice): rare failure costs little, so a single Redis lock is acceptable.
- Correctness (protect shared data): needs fencing tokens that the storage checks.
- He says Redlock (a Redis lock over several nodes) lacks fencing tokens and relies on timing. Redlock's author published a reply; this note gives only Kleppmann's argument.
- He suggests a consensus system such as ZooKeeper, whose transaction or version number can serve as the token.

## Topic: Coordination services

**Definition:** A coordination service is a small replicated service that other programs call for locks, small shared data and leader election, so they need not run consensus themselves. The SRE book names ZooKeeper and etcd as services that implement consensus; Chubby is Google's.

**Why:** Consensus is hard to write correctly; one well-tested shared service beats many home-made ones.

**Example:** Chubby (Burrows, 2006) offers coarse-grained locks (held for long periods) and small files, used for leader election and naming. Bigtable uses it so that at most one master (its coordinator server) is active. A client whose Chubby session expires loses its locks.

**Failure:** Treating the service as a database. Chubby's storage is low-volume. The SRE book's monitoring points: whether a leader exists, how often leaders change, and lagging replicas.

## Questions

### Why do consensus systems use a majority?

Any two majorities share a server, so two conflicting decisions cannot both win. With 2f + 1 servers, f can fail and a majority remains.

### Why five servers and not six?

Five needs 3 up and tolerates 2 down. Six needs 4 up and still tolerates only 2, so it adds a server that can fail without adding tolerance.

### How does Raft elect a leader and commit a write?

A follower that hears no leader before its random timeout becomes a candidate in a new term and asks for votes; a majority makes it leader. The leader commits an entry once a majority has stored it.

### Why is a lock with an expiry not safe by itself?

A paused client can wake after the expiry and still write. A fencing token that the storage checks stops it.

## Mistakes

- "More servers are always more available." Six servers are worse than five.
- "A lock lease guarantees one holder." A paused holder can act after the lease ends; only a checked fencing token stops it.
- "Heartbeats and timeouts are enough to elect a leader." The SRE book's split-brain case shows they are not.

## Quiz

### How many of 5 servers can be down while a majority still works?

- [ ] 1
- [x] 2
- [ ] 3
- [ ] 4

Explanation: A majority of 5 is 3, so 2 can be down.

### Why does Raft pick election timeouts at random?

- [ ] So the leader is always the same server
- [x] So usually only one server times out first, which avoids split votes
- [ ] So followers never vote
- [ ] So messages cannot be lost

Explanation: Randomness spreads out the timeouts.

### In Raft, when is a new log entry committed?

- [ ] When the leader writes it to its own log
- [ ] When every server has stored it
- [x] When the leader has stored it on a majority of servers
- [ ] When the client asks again

Explanation: A majority is enough.

### Client 1 holds token 33 and pauses. Client 2 gets token 34 and writes. What happens to Client 1's later write with 33?

- [ ] It is accepted and overwrites
- [x] Storage rejects it because it has already seen 34
- [ ] Client 2's write is undone
- [ ] The lock service accepts it

Explanation: Storage refuses any token lower than the highest seen.

### What does the SRE book advise for leader election and locking in a new design?

- [ ] Every team writes its own gossip protocol with a long timer
- [ ] Heartbeats and timeouts tuned by each team
- [x] A formally proven, well-tested consensus system, for example through ZooKeeper, Consul or etcd
- [ ] A single leader server with a standby that takes over on silence

Explanation: Home-made schemes cause reliability problems in practice.

## Diagram

```json
{ "kind": "sequence", "caption": "Raft write with three servers (one leader, two followers): the client writes (1), the leader sends the entry to both followers (2, 3), follower A stores it and replies (4). The leader and A are a majority of three, so the entry is committed and the client gets the answer (5). Follower B may reply later.", "actors": [{ "id": "c", "label": "Client" }, { "id": "l", "label": "Leader" }, { "id": "a", "label": "Follower A" }, { "id": "b", "label": "Follower B" }], "messages": [{ "from": "c", "to": "l", "label": "Write x = 5" }, { "from": "l", "to": "a", "label": "AppendEntries x = 5" }, { "from": "l", "to": "b", "label": "AppendEntries x = 5" }, { "from": "a", "to": "l", "label": "Stored", "dashed": true }, { "from": "l", "to": "c", "label": "Done (majority)", "dashed": true }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Raft election in a cluster of five servers, A to E. The old leader E is down and D is not shown. Follower A times out first, raises its term to 2 and asks B and C for votes (1, 2). B and C each vote for A (3, 4). With its own vote, A has 3 of 5, a majority. It becomes leader and sends heartbeats (5, 6) so nobody else starts an election.", "actors": [{ "id": "a", "label": "Server A" }, { "id": "b", "label": "Server B" }, { "id": "c", "label": "Server C" }], "messages": [{ "from": "a", "to": "b", "label": "RequestVote, term 2" }, { "from": "a", "to": "c", "label": "RequestVote, term 2" }, { "from": "b", "to": "a", "label": "Vote granted", "dashed": true }, { "from": "c", "to": "a", "label": "Vote granted", "dashed": true }, { "from": "a", "to": "b", "label": "Heartbeat, term 2" }, { "from": "a", "to": "c", "label": "Heartbeat, term 2" }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Fencing tokens (Kleppmann's example): client 1 gets token 33 (1, 2) and then pauses past its lease. Client 2 gets token 34 (3, 4) and writes (5); storage accepts it (6). Client 1 wakes and writes with 33 (7); storage has seen 34 and rejects it (8).", "actors": [{ "id": "c1", "label": "Client 1" }, { "id": "c2", "label": "Client 2" }, { "id": "k", "label": "Lock service" }, { "id": "s", "label": "Storage" }], "messages": [{ "from": "c1", "to": "k", "label": "Get lock" }, { "from": "k", "to": "c1", "label": "Token 33", "dashed": true }, { "from": "c2", "to": "k", "label": "Get lock" }, { "from": "k", "to": "c2", "label": "Token 34", "dashed": true }, { "from": "c2", "to": "s", "label": "Write, token 34" }, { "from": "s", "to": "c2", "label": "Accepted", "dashed": true }, { "from": "c1", "to": "s", "label": "Write, token 33" }, { "from": "s", "to": "c1", "label": "Rejected: seen 34", "dashed": true }] }
```
