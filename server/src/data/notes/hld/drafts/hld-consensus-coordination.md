---
id: hld-consensus-coordination
title: Consensus and Coordination
next: hld-messaging-streaming
roadmapSteps: devops-cloud:monitoring-reliability, backend:deployment-cloud
---
<!-- Draft 13 Nov 2026, not published. Written from docs/content/source-notes/hld-phase1.md. Numbers from docs/content/checks/hld-check.py. -->

## Overview

Consensus (several servers agreeing on one value, even when some crash or messages are lost) is what stands behind every leader election, every lock service and every replicated log. Interviewers ask about it because "who is the leader?" has to have exactly one answer.

After this section you can explain why a majority is needed, why five servers are a common choice and six are not better, how Raft elects a leader and commits a write, why a lock with a time limit is not enough, and what a fencing token does.

## Topic: The problem and split brain

**Definition:** Consensus means a group of servers agrees on one value (for example "the leader is server B") and never changes its mind, even if servers crash and messages are delayed or lost. Split brain (two servers both believing they are the leader) is what happens when this goes wrong.

**Why:** Servers cannot tell a crashed partner from a slow network. If each one decides alone using a timer, both can be wrong.

**Example:** Google's SRE book (chapter 23) tells of a content repository with pairs of file servers, one leader and one follower. Each server sent heartbeats (small "I am alive" messages) to its partner. When heartbeats stopped, a server sent a STONITH command ("shoot the other node in the head", a command that shuts the partner down) and took over the files. On a slow or lossy network, timeouts fired wrongly and some shutdown commands never arrived. Both servers could end up active for the same files, or both could be down, so data was corrupted or unavailable. The book's lesson: leader election cannot be done correctly with simple timeouts.

**Failure:** Saying "we use heartbeats and a timeout to pick the leader". The follow-up is: what if the network is slow, not the leader dead? FLP (the Fischer, Lynch and Paterson result), as the SRE book states it, says no algorithm can guarantee progress on an asynchronous network (one with no upper limit on message delay). Real systems keep the promise "never two leaders" always, and keep progress "most of the time" using timeouts and randomness.

## Topic: Majority quorums and the 2f + 1 rule

**Definition:** A quorum is the number of servers that must say yes before a decision counts. A majority is more than half. Two majorities of the same group always share at least one server, so two different decisions can never both win. With 2f + 1 servers, a majority still exists after f servers fail, so the group tolerates f failures (SRE book, chapter 23).

**Why:** The shared server remembers the earlier decision and blocks a conflicting one. Without overlap, two halves of a split network could each decide differently.

**Example:** Script output G1. Servers: majority, failures tolerated. 1: 1, 0. 2: 2, 0. 3: 2, 1. 4: 3, 1. 5: 3, 2. 6: 4, 2. 7: 4, 3. Two servers tolerate nothing, and four are no better than three. The SRE book calls three the minimum and recommends five, so that one planned maintenance and one unplanned failure can happen together. Chubby (Google's lock service) usually runs five replicas per cell, and three must be running for the cell to be up. Script G2 (assumption: each server is up 99 percent of the time, failures independent): a majority is up 99.97020 percent of the time with 3 servers (about 156.63 minutes down a year), 99.99901 percent with 5 (5.18 minutes) and 99.99804 percent with 6 (10.28 minutes). Six is worse than five because it needs 4 up, and still tolerates only 2 down.

**Failure:** "More replicas is always more available" is wrong, as G2 shows. Also, the SRE book notes that a sixth server placed in a data centre that already holds one of the five makes one outage remove two servers. Placement across failure zones matters as much as the count. (Read and write quorums for data, R + W > N, are in Replication and Partitioning; here the quorum agrees on one decision.)

## Topic: Raft in plain words

**Definition:** Raft (a consensus algorithm from the paper "In Search of an Understandable Consensus Algorithm") keeps a log (an ordered list of commands) identical on every server. Each server is a leader, a follower or a candidate (a follower asking for votes). Normally one leader handles all client requests and the others follow. Time is cut into terms, numbered 1, 2, 3, ...; each term starts with an election, and a stale term number tells a server its information is old.

**Why:** If every server applies the same commands in the same order, they all end in the same state.

**Example:** Election. A follower that hears nothing from a leader within its election timeout adds 1 to its term, votes for itself and asks the others for votes. Each server votes for at most one candidate per term, and a candidate with a majority wins and starts sending heartbeats (empty AppendEntries messages). The timeout is chosen at random, for example between 150 and 300 ms in the paper, so usually only one server times out first. Write. The leader adds the command to its log, sends it to the followers with AppendEntries, and the entry is committed (safe to apply) once a majority has stored it. The leader then answers the client. The paper's safety properties (Figure 3) are named Election Safety (at most one leader per term), Leader Append-Only, Log Matching, Leader Completeness and State Machine Safety. Script G3 is a simulation with an assumed message delay of 10 ms: with 4 followers and timeouts spread over 150 to 300 ms, two or more time out within that delay in 24.1 percent of elections; spread over only 150 to 160 ms, 100 percent. A delay of 20 ms gives 43.5 percent for the 150 to 300 ms range.

**Failure:** Saying Raft needs every server. It needs a majority: the paper says a typical five-server cluster tolerates two failures. Another trap: a split vote (nobody gets a majority) is not an error, the term simply ends and a new election starts with new random timeouts.

## Topic: Paxos and Multi-Paxos

**Definition:** Paxos is an older consensus protocol. Multi-Paxos runs it for a whole series of values with a stable leader (a proposer that stays in charge), so each value needs only one round trip from the leader to a majority (SRE book, chapter 23).

**Why:** Changing leaders costs an extra round, and two proposers can keep outbidding each other without either finishing (dueling proposers). A stable leader avoids this. The price: all writes go through one machine, and a slow leader slows everyone.

**Example:** Spanner (Google, 2012) runs one Paxos state machine on top of each tablet (a piece of the data), with long-lived leaders and time-based leader leases that last 10 seconds by default. Chubby uses Paxos too (Bigtable paper).

**Failure:** Do not say "Raft and Paxos are different problems". Both solve consensus; the Raft paper's stated goal was to be easier to understand. For interviews, say which you would use: a proven existing system, not your own (the SRE book says to use a proven consensus service such as ZooKeeper, Consul, etcd or Chubby rather than build consensus into each application).

## Topic: Distributed locks, leases and fencing tokens

**Definition:** A distributed lock lets only one client use a resource at a time. Because a client may crash while holding it, a lock is given as a lease (a lock that expires after a time limit). A fencing token is a number that grows each time the lock is granted; the client sends it with every write and the storage rejects any token lower than one it has already seen (Kleppmann, 2016).

**Why:** A lease cannot protect a client that is paused. A long garbage-collection pause, a stalled disk or a delayed network packet can make a client wake up after its lease ended and write anyway. Checking the lease just before writing does not help, because the pause can happen after the check.

**Example:** Script G4 (Kleppmann's example). Client 1 gets token 33, then pauses past its lease. Client 2 gets token 34 and writes with 34, accepted. Client 1 wakes, still thinks it holds the lock, writes with 33, and storage rejects it because it has seen 34.

**Failure:** Kleppmann splits locks by purpose. A lock for efficiency (avoid doing the same work twice) can fail rarely at little cost, so a simple single Redis lock is acceptable. A lock for correctness (protect shared data) needs fencing tokens, and the storage must check them. He describes Redlock (a Redis lock over several nodes) as lacking fencing tokens and relying on timing assumptions; the Redis author published a rebuttal that I did not read, so treat this as Kleppmann's critique. He suggests a consensus system such as ZooKeeper, whose zxid or version number can serve as the token.

## Topic: Coordination services

**Definition:** A coordination service is a small replicated service (Chubby, ZooKeeper, etcd) that other programs call for locks, tiny pieces of shared data, and leader election, so they need not run consensus themselves.

**Why:** Consensus is hard to write correctly. One shared, well-tested service is safer than many home-made ones.

**Example:** Chubby (Burrows, 2006) offers coarse-grained locks (held for long periods, not for single operations) and small files, used for leader election and naming. Bigtable uses Chubby so that there is at most one active master at any time, and to find its tablet servers. A client's Chubby session expires if it cannot renew its lease in time, and then it loses its locks.

**Failure:** Treating the service as a database. It holds small data. Monitoring from the SRE book: whether a leader exists (without one the group is fully unavailable), how often leaders change (many changes suggest flapping, an unstable leader), and lagging replicas.

## Questions

### Why do consensus systems use a majority?

Any two majorities share a server, so two conflicting decisions cannot both win. With 2f + 1 servers, f can fail and a majority remains.

### Why five servers and not six?

Five needs 3 up and tolerates 2 down. Six needs 4 up and still tolerates only 2, so it adds a server that can fail without adding tolerance (G1, G2).

### How does Raft elect a leader and commit a write?

A follower that hears no leader before its random timeout becomes a candidate in a new term and asks for votes; a majority makes it leader. The leader sends each new entry with AppendEntries and commits it when a majority has stored it.

### Why is a lock with an expiry not safe by itself?

A paused client can wake after the expiry and still write. The fix is a fencing token that the storage checks: it rejects a token older than the newest it has seen.

## Mistakes

- "More servers are always more available." Six is worse than five in G2.
- "A lock lease guarantees one holder." A paused holder can act after the lease ends; only a checked fencing token stops it.
- "Heartbeats and timeouts are enough to elect a leader." The SRE book's split-brain case shows they are not.

## Quiz

### How many servers can fail in a group of 5 that needs a majority?

- [ ] 1
- [x] 2
- [ ] 3
- [ ] 4

Explanation: A majority of 5 is 3, so 2 can be down (script G1).

### Why does Raft pick election timeouts at random?

- [ ] So the leader is always the same server
- [x] So usually only one server times out first, which avoids split votes
- [ ] So followers never vote
- [ ] So messages cannot be lost

Explanation: If many servers time out together, votes split. Randomness spreads them out (G3 shows the effect in a simulation).

### In Raft, when is a log entry committed?

- [ ] When the leader writes it to its own log
- [ ] When every server has stored it
- [x] When a majority of servers have stored it
- [ ] When the client asks again

Explanation: Majority storage is enough, so one slow or dead server cannot block commits.

### Client 1 holds token 33 and pauses. Client 2 gets token 34 and writes. What happens to Client 1's later write with 33?

- [ ] It is accepted and overwrites
- [x] Storage rejects it because it has already seen 34
- [ ] Client 2's write is undone
- [ ] The lock service accepts it

Explanation: The storage checks tokens and refuses any token lower than the highest seen (G4).

### What does the SRE book recommend for leader election and locking in a new design?

- [ ] Heartbeats and gossip written by each team
- [ ] A single server with a long timer
- [x] A proven consensus service such as ZooKeeper, etcd or Chubby
- [ ] Six replicas

Explanation: Home-made timer schemes led to outages and subtle data problems; proven consensus systems are the advice.

## Diagram

```json
{ "kind": "sequence", "caption": "Raft write with three servers (one leader, two followers): the client writes (1), the leader sends the entry to both followers (2, 3), follower A stores it and replies (4). The leader and A are a majority of three, so the entry is committed and the client gets the answer (5). Follower B may reply later.", "actors": [{ "id": "c", "label": "Client" }, { "id": "l", "label": "Leader" }, { "id": "a", "label": "Follower A" }, { "id": "b", "label": "Follower B" }], "messages": [{ "from": "c", "to": "l", "label": "Write x = 5" }, { "from": "l", "to": "a", "label": "AppendEntries (x = 5)" }, { "from": "l", "to": "b", "label": "AppendEntries (x = 5)" }, { "from": "a", "to": "l", "label": "Stored", "dashed": true }, { "from": "l", "to": "c", "label": "Done (majority stored)", "dashed": true }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Raft election after the leader fails: follower A times out first, raises its term to 2 and asks for votes (1, 2). B and C each vote for A (3, 4). A has a majority, becomes leader and sends heartbeats (5, 6) so nobody else starts an election.", "actors": [{ "id": "a", "label": "Server A" }, { "id": "b", "label": "Server B" }, { "id": "c", "label": "Server C" }], "messages": [{ "from": "a", "to": "b", "label": "RequestVote, term 2" }, { "from": "a", "to": "c", "label": "RequestVote, term 2" }, { "from": "b", "to": "a", "label": "Vote granted", "dashed": true }, { "from": "c", "to": "a", "label": "Vote granted", "dashed": true }, { "from": "a", "to": "b", "label": "Heartbeat, term 2" }, { "from": "a", "to": "c", "label": "Heartbeat, term 2" }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Fencing tokens (Kleppmann's example): client 1 gets token 33 (1, 2) and pauses past its lease. Client 2 gets token 34 (3, 4) and writes (5), accepted. Client 1 wakes and writes with 33 (6); storage has seen 34 and rejects it (7).", "actors": [{ "id": "c1", "label": "Client 1" }, { "id": "c2", "label": "Client 2" }, { "id": "k", "label": "Lock service" }, { "id": "s", "label": "Storage" }], "messages": [{ "from": "c1", "to": "k", "label": "Get lock" }, { "from": "k", "to": "c1", "label": "Token 33", "dashed": true }, { "from": "c2", "to": "k", "label": "Get lock (lease ended)" }, { "from": "k", "to": "c2", "label": "Token 34", "dashed": true }, { "from": "c2", "to": "s", "label": "Write, token 34" }, { "from": "c1", "to": "s", "label": "Write, token 33" }, { "from": "s", "to": "c1", "label": "Rejected (seen 34)", "dashed": true }] }
```
