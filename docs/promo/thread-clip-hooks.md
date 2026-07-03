# Thread Clip Social Hooks

Grounding: `examples/thread-clip-demo.sh` imports `fixtures/sample`, searches
for `deploy`, and verifies the redacted thread output.

## Hooks

1. A useful Slack handoff can be one redacted thread, not an entire workspace
   dump. `slackcache` imports a local export fixture, searches it, and prints the
   exact thread clip.

2. Demo beat: import sample fixture, search `deploy`, open the printed
   `thread.txt`, and point out the `[redacted:...]` values.

3. `slackcache` is intentionally local-first: fixture files in, local JSON cache
   out, no Slack API calls in the V1 flow.

## Clip beats

1. Show `fixtures/sample/general/2026-05-01.json`.
2. Run `bash examples/thread-clip-demo.sh`.
3. Open `thread.txt`.
4. Show redaction in the thread before passing it to an agent or reviewer.
