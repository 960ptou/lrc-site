# Listener Web APP

***Listening to audio with subtitle***

This project is a full-stack web application that delivers media resources through a FastAPI backend, a Vite-powered frontend, and an Nginx reverse proxy. 

The application handles requests for images, audio, and subtitle files via distinct API endpoints, and provides structured error handling and centralized logging for each service.

### Instruction
1. Setting up a folder structured in the following format (for audio and subtitle files)
location of audio and subtitle file will not matter as everything is parsed to keep simple
- Directory
    - ResourceFolder (unique identifier)
        - image (anywhere) (optional, but preferred as there aren't default image for now)
        - N-audio.mp3 (anywhere) -> natural sort is used to pair up 1 audio file to 1 subtitle file
        - N-subtitile.vtt (anywhere)
    - ...
2. Modify '.env' file to have "SOURCE_VOL={directory above}"

3. Running Docker | Local Dev
    - **W/ Docker** run `docker compose up` | Access your site on port 80 => localhost:80 => localhost
    - **Local Dev** 
        - Requirements :
            - Python3.11
            - Poetry
            - Node >=22
            - Optional : Nginx

        - MacOS :
            - In the root directory (Directory with this readme)
            - Init : run `bash init-dev.bash`
        
        - Windows : 
            - powershell : `./init-dev.ps1`

        - To start
        
        ```bash
        # in frontend | your server will start in port 3000
        npm run dev
        ```
        ```bash
        # in backend | your server will start in port 3001
        poetry shell
        # Mac
        LOG='../log/backend' SOURCE='../sample' uvicorn main:app --reload --host localhost --port 3001
        # windows PS
        $env:LOG = '..\log\backend'
        $env:SOURCE = '..\sample'
        uvicorn main:app --reload --host localhost --port 3001
        ```
        - Optional : W/ Nginx
            - modify `proxy_pass http://frontend:3001;` => `proxy_pass http://localhost:3001;`
            - and `proxy_pass http://backend:3000/;` = > `proxy_pass http://localhost:3000/;`
            - run `nginx -c path/to/nginx.conf`

### DEMO to install (w/ docker)
https://github.com/user-attachments/assets/b9b1011c-6efe-402c-badb-f98e2bce226c

| or Check this
[Demo Video](assets/demo.mp4)
