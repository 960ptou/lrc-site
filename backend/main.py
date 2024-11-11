from fastapi import FastAPI
from fastapi.responses import JSONResponse, FileResponse
from util.subtitle_utils import parse_lrc, parse_vtt
import os, re
from pathlib import Path
from glob import glob
from natsort import natsorted
import logging
from datetime import datetime
from fuzzywuzzy import fuzz

# init processes
SOURCE_FOLDER = os.getenv("SOURCE")
LOG_FOLDER = os.getenv("LOG")


logging.basicConfig(
    filename= str(Path(LOG_FOLDER) / f"{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.log"),
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',  # Custom date format
    filemode='w',
)
logger = logging.getLogger()


def init(env_source):
    # Patterns for file types
    subtitle_pattern = re.compile(r".*\.(lrc|vtt)$", re.IGNORECASE)
    audio_pattern = re.compile(r".*\.(mp3|wav|ogg|flac|aac|m4a)$", re.IGNORECASE)
    image_pattern = re.compile(r".*\.(jpeg|jpg|png)$", re.IGNORECASE)

    # Initialize the structure
    all_info = {}
    def index_matching(music : list, subtitle : list) -> list[list]:
        # input natural sorted
        # [m1,m2...], [s1,s2] => [[m1,s1], [m2,s2]...] 
        # assertions
        if len(music) != len(subtitle):
            logger.error(f"music not same size as subtitle {music, subtitle}")

        pairs = []
        
        for m, s in zip(music, subtitle):
            mp,sp = Path(m), Path(s)

            if not(fuzz.ratio(mp.stem, sp.stem) > 50 or  # score 50
                   re.search(r'\d+',mp.stem).group(0) == re.search(r'\d+',sp.stem).group(0) # same first num
                ):
                logger.error(f"{m} and {s} likely not match")
            
            pairs.append([m, s])
        return pairs

    # Convert env_source to a Path object and get all directories
    env_source = Path(env_source)
    all_directory_identifiers = filter(os.path.isdir, glob(str(env_source / "*")))

    for directory in all_directory_identifiers:
        identifier = Path(directory).name  # Use directory name as identifier
        all_files_in_directory = glob(str(Path(directory) / '**'), recursive=True)

        # Initialize data structure for each identifier
        all_info[identifier] = {
            'images': [],
            'resources': None # [[music, subt]]
        }

        music = []
        subtitle = []

        # Iterate over all files in the directory
        for file_path in all_files_in_directory:
            file_path = Path(file_path)
            if not(file_path.is_file()):
                continue

            file_str = str(file_path)

            if image_pattern.match(file_str):
                all_info[identifier]['images'].append(file_str)

            elif audio_pattern.match(file_str):
                music.append(file_str)

            elif subtitle_pattern.match(file_str):
                subtitle.append(file_str)
        
        
        music = natsorted(music)
        subtitle = natsorted(subtitle)

        all_info[identifier]['resources'] = index_matching(music, subtitle)

    return all_info


def convert_server_resource2client(server_dict):
    only_stem = lambda x : Path(x).stem
    only_name = lambda x : Path(x).name
    client_dict = {
        "images" : [only_name(im) for im in server_dict["images"]],
        "resources" : [
            only_stem(resource[0]) for resource in  server_dict["resources"]
        ]
    }
    return client_dict


# can turn into DB if later continued
SERVER_RESOURCE_LOOKUP = init(SOURCE_FOLDER)
ALL_RESOURCES_IDENTIFIERS = list(SERVER_RESOURCE_LOOKUP.keys())
CLIENT_RESOURCE_LOOKUP = {
    key : convert_server_resource2client(SERVER_RESOURCE_LOOKUP[key]) for key in ALL_RESOURCES_IDENTIFIERS
}

# import json
# with open('data-client.json', 'w', encoding='utf-8') as f:
#     json.dump(CLIENT_RESOURCE_LOOKUP, f, ensure_ascii=False, indent=4)



app = FastAPI()


@app.get("/resources/page/{page_number}")
async def page_resources(page_number : int):
    # returning 3?/2 resources : image, meta(optional), identifier to audio/video
    """
    Considering the structure
    Currently:
    resources:
        identifier:
            resource : [[audio: (mp3, wav),sub: (lrc, vtt)], ...]
            image: (jpge, png, jpg)s
            meta: [json | Optional]  = {
                name: str
                source: str
                tags : []
                ...
                (author, language)
            }
    """
    # in start, will ask for identifier
    # NOTE : for now as I only have few files, only 1 page
    return JSONResponse(content=ALL_RESOURCES_IDENTIFIERS)

@app.get("/resource/{identifier}")
async def get_client_resource(identifier : str):
    return CLIENT_RESOURCE_LOOKUP[identifier]

@app.get("/image/{identifier}/{index}")
async def get_image(identifier : str, index : int):
    return FileResponse(SERVER_RESOURCE_LOOKUP[identifier]["images"][index])

@app.get("/audio/{identifier}/{index}")
async def get_audio(identifier : str, index : int):
    return FileResponse(
        SERVER_RESOURCE_LOOKUP[identifier]["resources"][index][0],
        media_type="audio/mp3",
    )

@app.get("/subtitle/{identifier}/{index}")
async def get_subtitle(identifier : str, index : int):
    file = SERVER_RESOURCE_LOOKUP[identifier]["resources"][index][1]
    suffix = Path(file).suffix[1:]
    try:
        operation = {
            "lrc" : parse_lrc,
            "vtt" : parse_vtt
        }[suffix]
    except:
        logger.error(f"Unfound extension [{suffix}]")
        raise NotImplementedError(f"subtitle extension : {suffix} not implemented")

    return JSONResponse(content=operation(file))

