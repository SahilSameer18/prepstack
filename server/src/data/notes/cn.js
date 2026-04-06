const computerNetworksNotes = {
  subject: "Computer Networks",
  sections: [

    // ===========================
    // 1. BASICS
    // ===========================
    {
      title: "Basics",
      topics: [

        {
          name: "Network",

          concept: [
            "Collection of interconnected devices",
            "Used to share data and resources"
          ],

          deepInsight: [
            "Networks enable distributed systems and scalability",
            "Latency and bandwidth are key constraints"
          ],

          realWorld: [
            "Internet is the largest WAN",
            "Data centers rely on high-speed internal networks"
          ],

          interviewAnswer: [
            "A network is a group of interconnected devices that communicate to share resources."
          ]
        },

        {
          name: "Topologies",

          deepInsight: [
            "Tradeoff between cost, reliability, scalability"
          ],

          traps: [
            "Star has single point of failure",
            "Mesh is expensive but highly fault tolerant"
          ],

          interviewAnswer: [
            "Topology defines how devices are connected and affects performance and reliability."
          ]
        }

      ]
    },

    // ===========================
    // 2. OSI MODEL
    // ===========================
    {
      title: "OSI Model",
      topics: [

        {
          name: "OSI Layers",

          concept: [
            "7-layer abstraction for network communication"
          ],

          deepInsight: [
            "Separation of concerns improves modularity",
            "Each layer communicates with its peer layer"
          ],

          realWorld: [
            "Used as conceptual model; TCP/IP is used in practice"
          ],

          traps: [
            "OSI is theoretical, not implemented exactly"
          ],

          interviewAnswer: [
            "OSI model standardizes communication into 7 layers for modular design."
          ],

          followUps: [
            "OSI vs TCP/IP?",
            "Which layer does HTTP belong to?"
          ]
        }

      ]
    },

    // ===========================
    // 3. TCP/IP MODEL
    // ===========================
    {
      title: "TCP/IP Model",
      topics: [

        {
          name: "TCP/IP vs OSI",

          deepInsight: [
            "TCP/IP has fewer layers and is practical",
            "Application layer combines multiple OSI layers"
          ],

          traps: [
            "Session + Presentation not separate in TCP/IP"
          ],

          interviewAnswer: [
            "TCP/IP is a practical model used in the internet, unlike OSI which is conceptual."
          ]
        }

      ]
    },

    // ===========================
    // 4. IP ADDRESSING
    // ===========================
    {
      title: "IP Addressing",
      topics: [

        {
          name: "IP vs MAC",

          deepInsight: [
            "IP used for routing (logical)",
            "MAC used for local delivery (physical)"
          ],

          realWorld: [
            "Routers use IP, switches use MAC"
          ],

          traps: [
            "MAC changes per network hop, IP stays same"
          ],

          interviewAnswer: [
            "IP identifies device globally, MAC identifies device locally."
          ]
        },

        {
          name: "NAT",

          deepInsight: [
            "Allows multiple devices to share one public IP"
          ],

          realWorld: [
            "Used in home routers"
          ],

          traps: [
            "Breaks end-to-end connectivity"
          ]
        },

        {
          name: "Subnetting",

          deepInsight: [
            "Improves routing efficiency and reduces broadcast domain"
          ],

          interviewAnswer: [
            "Subnetting divides networks into smaller parts for efficiency."
          ]
        }

      ]
    },

    // ===========================
    // 5. TRANSPORT LAYER
    // ===========================
    {
      title: "Transport Layer",
      topics: [

        {
          name: "TCP vs UDP",

          deepInsight: [
            "TCP ensures reliability via ACKs and retransmission",
            "UDP is faster due to no overhead"
          ],

          realWorld: [
            "TCP → Web, Email",
            "UDP → Video streaming, gaming"
          ],

          traps: [
            "UDP is not always faster (depends on loss/retransmission)",
            "TCP does not guarantee latency"
          ],

          interviewAnswer: [
            "TCP is reliable and connection-oriented, UDP is fast and connectionless."
          ]
        },

        {
          name: "3-Way Handshake",

          flow: [
            "SYN → SYN-ACK → ACK"
          ],

          deepInsight: [
            "Prevents old duplicate connections",
            "Ensures both sides are ready"
          ],

          traps: [
            "Why not 2-way? → can cause half-open connections"
          ],

          interviewAnswer: [
            "TCP handshake establishes reliable connection using 3 steps."
          ],

          followUps: [
            "Why 3-way handshake?",
            "What is SYN flood?"
          ]
        },

        {
          name: "Congestion Control",

          deepInsight: [
            "Network capacity is dynamic",
            "Uses AIMD (Additive Increase, Multiplicative Decrease)"
          ],

          realWorld: [
            "TCP dynamically adjusts sending rate"
          ],

          traps: [
            "Different from flow control"
          ]
        }

      ]
    },

    // ===========================
    // 6. APPLICATION LAYER
    // ===========================
    {
      title: "Application Layer",
      topics: [

        {
          name: "HTTP vs HTTPS",

          deepInsight: [
            "HTTPS uses TLS for encryption",
            "Adds security but increases latency"
          ],

          realWorld: [
            "All modern websites use HTTPS"
          ],

          traps: [
            "HTTPS ≠ fully secure (depends on implementation)"
          ],

          interviewAnswer: [
            "HTTPS is secure version of HTTP using encryption."
          ]
        },

        {
          name: "DNS",

          flow: [
            "Cache → Resolver → Root → TLD → Authoritative"
          ],

          deepInsight: [
            "DNS is distributed and hierarchical"
          ],

          realWorld: [
            "Used every time you open a website"
          ],

          traps: [
            "DNS is not always recursive"
          ],

          interviewAnswer: [
            "DNS maps domain names to IP addresses."
          ]
        }

      ]
    },

    // ===========================
    // 7. IMPORTANT PROTOCOLS
    // ===========================
    {
      title: "Protocols",
      topics: [

        {
          name: "ARP",

          deepInsight: [
            "Maps IP → MAC within local network"
          ],

          traps: [
            "Only works within same LAN"
          ]
        },

        {
          name: "ICMP",

          deepInsight: [
            "Used for diagnostics (ping)"
          ]
        }

      ]
    },

    // ===========================
    // 8. DEVICES
    // ===========================
    {
      title: "Networking Devices",
      topics: [

        {
          name: "Hub vs Switch",

          deepInsight: [
            "Switch reduces collisions using MAC table"
          ],

          traps: [
            "Hub operates at physical layer"
          ],

          interviewAnswer: [
            "Switch is smarter than hub and reduces collisions."
          ]
        },

        {
          name: "Router",

          deepInsight: [
            "Routes packets using IP addresses"
          ],

          realWorld: [
            "Core of internet routing"
          ]
        }

      ]
    },

    // ===========================
    // 9. KEY FLOWS
    // ===========================
    {
      title: "Key Flows",
      topics: [

        {
          name: "DNS + HTTP Flow",

          flow: [
            "1. DNS lookup",
            "2. TCP handshake",
            "3. HTTP request",
            "4. Server response"
          ],

          deepInsight: [
            "Multiple layers interact in real request"
          ],

          interviewAnswer: [
            "User request goes through DNS, TCP, then HTTP to fetch data."
          ],

          followUps: [
            "What happens when you type google.com?"
          ]
        }

      ]
    },

    // ===========================
    // 10. SYSTEM DESIGN
    // ===========================
    {
      title: "System Design Concepts",
      topics: [

        {
          name: "CDN",

          deepInsight: [
            "Reduces latency by serving from nearest location"
          ],

          realWorld: [
            "Used by Netflix, YouTube"
          ],

          interviewAnswer: [
            "CDN improves performance by caching content geographically."
          ]
        },

        {
          name: "Load Balancer",

          deepInsight: [
            "Distributes traffic to avoid overload"
          ],

          realWorld: [
            "Used in all large-scale systems"
          ],

          traps: [
            "Single load balancer can become bottleneck"
          ],

          interviewAnswer: [
            "Load balancer distributes requests across servers."
          ]
        }

      ]
    }

  ]
};

module.exports = computerNetworksNotes;