from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse, FileResponse
import os, logging
from pathlib import Path
from functools import wraps

from util.subtitle_utils import parse_lrc, parse_vtt
from init import init, convert_server_resource2client

# init processes
SOURCE_FOLDER = os.getenv("SOURCE")
LOG_FOLDER = os.getenv("LOG")

logging.basicConfig(
    filename= str(Path(LOG_FOLDER) / "server.log"),
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',  # Custom date format
    filemode='w',
)
logger = logging.getLogger()

# can turn into DB if later continued
SERVER_RESOURCE_LOOKUP = init(SOURCE_FOLDER, logger)
ALL_RESOURCES_IDENTIFIERS = list(SERVER_RESOURCE_LOOKUP.keys())
CLIENT_RESOURCE_LOOKUP = {
    key : convert_server_resource2client(SERVER_RESOURCE_LOOKUP[key]) for key in ALL_RESOURCES_IDENTIFIERS
}

# https://stackoverflow.com/questions/64497615/how-to-add-a-custom-decorator-to-a-fastapi-route
def index_hash_identifier_exception_handler(func):
    @wraps(func)
    async def wrapper(request : Request, *args, **kwargs):
        try:
            return await func(request, *args, **kwargs)
        except KeyError as e:
            logger.error(f"Error processing {request.url.path} with params {kwargs}. Error: {e}")
            raise HTTPException(status_code=404, detail=f"Resource not found for {request.url.path}")
    return wrapper

app = FastAPI()

@app.get("/resources/page/{page_number}")
async def page_resources(request : Request,page_number : int):
    # NOTE : for now as I only have few files, only 1 page
    return JSONResponse(content=ALL_RESOURCES_IDENTIFIERS)

@app.get("/resource/{identifier}")
@index_hash_identifier_exception_handler
async def get_client_resource(request : Request,identifier : str):
    return CLIENT_RESOURCE_LOOKUP[identifier]

@app.get("/image/{identifier}/{index}")
@index_hash_identifier_exception_handler
async def get_image(request : Request,identifier : str, index : int):
    return FileResponse(SERVER_RESOURCE_LOOKUP[identifier]["images"][index])

@app.get("/audio/{identifier}/{index}")
@index_hash_identifier_exception_handler
async def get_audio(request : Request,identifier : str, index : int):
    return FileResponse(
        SERVER_RESOURCE_LOOKUP[identifier]["resources"][index][0],
        media_type="audio/mp3",
    )

@app.get("/subtitle/{identifier}/{index}")
@index_hash_identifier_exception_handler
async def get_subtitle(request : Request, identifier : str, index : int):
    file = SERVER_RESOURCE_LOOKUP[identifier]["resources"][index][1]
    suffix = Path(file).suffix[1:]
    try:
        operation = {
            "lrc" : parse_lrc,
            "vtt" : parse_vtt
        }[suffix]
    except KeyError:
        logger.error(f"Unfound extension {suffix} in [{request.url.path}]")
        return HTTPException(status_code=501, detail=f"Subtitle unable to be processed")

    return JSONResponse(content=operation(file))