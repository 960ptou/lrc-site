$ErrorActionPreference = "Stop"

cd backend
poetry install

cd ..\frontend
npm i

cd ..
