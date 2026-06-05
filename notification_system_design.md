
# Stage 1: Notification Priority System Design

This document describes the architectural logic and data structure selections used to sort and manage the high-volume campus notification stream.

## Core Problem Statement
With high quantities of administrative notifications being delivered continuously, time-sensitive and critical messages can easily be overlooked by users. This backend module acts as a fast, localized buffer to dynamically capture, filter, and serve the top 10 most critical feeds to the consumer application instantly.

## Priority Rules Framework
Urgencies are mapped explicitly using numeric weighting assignments combined with notification timestamps to determine high-priority standing:
* **Placement Updates:** Weight = 3 (Highest importance)
* **Result Announcements:** Weight = 2 (Medium importance)
* **Event Notifications:** Weight = 1 (Standard importance)

Whenever items have identical priority weights, the sorting logic relies on the `Timestamp` attribute as a tie-breaker, putting the most recent notification ahead of older ones.

## Algorithmic Efficiency via Bounded Min-Heap
To support efficiency as updates scale, the sorting algorithm utilizes a **Bounded Min-Priority Queue** (Min-Heap structural format) configured to a maximum size limit of `n = 10`.

1. **Space Complexity:** By limiting the heap size to exactly 10 items, the memory space required remains static at $O(1)$ constant space, completely independent of the size of the total payload data stream.
2. **Time Complexity:** For an overall collection containing $N$ records, parsing items one-by-one keeps processing times fast. The algorithm checks incoming entries against the lowest-ranked item currently sitting at the top of the heap. If the new item ranks higher, the top item is ejected, and the new one is added. This keeps total processing bound tightly to an efficient $O(N \log n)$ run-time footprint.

## Logging Middleware
A separate logging middleware filter tracks outgoing request payloads and incoming status headers. This ensures the application can easily trace system exceptions or server network timeouts without injecting clunky console code inside the main application logic.
