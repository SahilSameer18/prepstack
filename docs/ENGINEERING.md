# Engineering notes

More technical details behind PrepStack. The [README](../README.md) shows the 9 most important highlights; this file has the other 12.

Everything here describes what the code does. Nothing has been audited by a third party, and no performance number has been measured.

- **Device Fingerprinting & Active Sessions Manager:** A zero-dependency helper reads the User-Agent and client IP and turns each session into a readable device name (*"Chrome on Windows 11"*, *"Safari on iPhone"*). The Profile page lists the sessions and lets a user revoke any of them.
- **Password Change Revokes Other Sessions:** Changing a password removes all *other* active device sessions and keeps the current one.
- **Self-Service Data Erasure:** `DELETE /api/user/account` asks for the password (or, for Google-only accounts, the account email), then deletes the user and every record that references them (progress, projects and Role Analyzer reports). The cascade finds those models automatically: any model with a `user` field that references the User model is included. This supports the right to erasure; it is not a legal certification.
- **Transaction With a Fallback:** The deletion above runs in one MongoDB transaction (`session.withTransaction`) on a replica set such as Atlas. On a standalone MongoDB, which has no transactions, it falls back to separate deletes.
- **Centralized Error Middleware:** One handler maps Zod validation errors, Mongoose validation and cast errors (so an invalid id returns a clean error, not an internal one), JWT errors and duplicate-key errors to a uniform JSON response.
- **Security Headers:** `helmet` sets standard hardening headers (`X-Content-Type-Options`, `Strict-Transport-Security`, `X-Frame-Options`, ...) and removes `X-Powered-By`.
- **Google Sign-In With Account Linking:** Google ID tokens are verified on the server. An existing email/password account can link Google, a Google-only account can set a password, and usernames are generated uniquely for new Google users.
- **Avatar Customizer:** Deterministic DiceBear "bottts" avatars with preset switching, a random-seed button and a live preview.
- **Cookie-Only Auth Transport:** Tokens are not returned in JSON. The auth endpoints use `httpOnly`, `secure` and `sameSite` cookies, so client-side script cannot read them.
- **Typed CS Notes Schema:** A `sectionSchema` defines the shape of every CS notes section, so the notes API returns predictable data.
- **Spring Animations and Reduced Motion:** Framer Motion spring animations on accordions, drawers and modals. The stylesheet respects `prefers-reduced-motion` and `prefers-reduced-transparency`. The solved-problem toggle on a DSA sheet gives a short vibration (`navigator.vibrate(10)`) on phones that support it.
- **Skeleton Loaders:** Loading placeholders sized like the real content reduce layout jumps while data loads, and logout shows a full-screen transition overlay.
