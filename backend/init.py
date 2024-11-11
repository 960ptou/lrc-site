import re, os, glob
from pathlib import Path
from fuzzywuzzy import fuzz
from natsort import natsorted


def init(env_source, logger):
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
    all_directory_identifiers = filter(os.path.isdir, glob.glob(str(env_source / "*")))

    for directory in all_directory_identifiers:
        identifier = Path(directory).name  # Use directory name as identifier
        all_files_in_directory = glob.glob(str(Path(directory) / '**'), recursive=True)

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