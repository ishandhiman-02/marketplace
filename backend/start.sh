#!/bin/sh

set -e

echo "Running migrations..."
./bin/migration

echo "Starting server..."
exec ./bin/imagine_backend
