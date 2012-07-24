#!/bin/sh
# Forever script to start Playa
# Should probably make it into a daemon
echo Starting Playa
forever -m 5 -l data/playa.log -o data/playa.stdout -e data/playa.stderr --pidFile data/playa.pid start app 