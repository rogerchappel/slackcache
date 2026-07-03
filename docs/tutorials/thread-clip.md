# Thread Clip Demo

This demo turns the checked-in Slack export fixture into a narrow handoff clip:
import scope, search result, and one redacted thread.

## Run it

```sh
bash examples/thread-clip-demo.sh
```

The script builds the local CLI, imports `fixtures/sample`, searches the
`general` channel for `deploy`, and writes the matching thread to a temporary
file.

## What it checks

- The fixture import writes a local cache.
- Search finds the deploy handoff message.
- `thread 1777586400.000100` prints the two-message thread.
- Redaction stays enabled in the thread output.

## Expected outputs

The script prints paths for:

- `import.txt`
- `search.txt`
- `thread.txt`

Use this flow when a reviewer or agent needs one Slack thread with the minimum
local context, not a whole workspace export.
