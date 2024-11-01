from fastapi import FastAPI
from fastapi.responses import JSONResponse, FileResponse
from lrc_utils import parse_lrc

app = FastAPI()


@app.get("/lrc_file")
async def lrc_file():
    # Empty now
    lrc_content = parse_lrc("")
    return JSONResponse(content=lrc_content)
    
@app.get("/audio")
async def get_audio():
    return FileResponse("")