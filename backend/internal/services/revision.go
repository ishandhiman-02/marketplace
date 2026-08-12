package services

import "sync/atomic"

// The content revision: a counter bumped by every write that changes something a
// visitor or another admin can see.
//
// Clients poll GET /api/version — a few bytes, no database work — and refetch
// only when the number moves. That is deliberately duller than a websocket or an
// SSE stream: there is no long-lived connection to be dropped by a proxy, no
// reconnect storm after a redeploy, and nothing to rewrite if the service is
// ever run on more than one instance.
//
// It lives in memory, so a restart resets it to zero. The only consequence is
// that connected clients see the number change once and refetch, which is
// exactly what should happen after a deploy anyway.
var revision atomic.Uint64

// BumpRevision marks the content as changed. Called by the write paths in this
// package, so no handler has to remember to do it.
func BumpRevision() { revision.Add(1) }

// Revision is the value clients compare against.
func Revision() uint64 { return revision.Load() }
