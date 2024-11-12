#!/bin/bash

set -e

# Assume in root
cd backend
poetry install
cd ../frontend
npm i
cd ..