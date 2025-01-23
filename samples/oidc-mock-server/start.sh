#!/bin/sh

node /oidc-mock/server.mjs &
sleep 5 # Wait for server to start so svelte server doesn't crash on init
node /app/dist &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?