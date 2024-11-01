import re


def parse_lrc(lrc_file) -> list[list[int, str]]:
    """Parses the LRC file and returns a list of (timestamp, lyric) tuples."""
    pattern = r"\[(\d{1,2}):(\d{2}\.\d+)\](.*)"  # Match format [mm:ss.xx]lyric
    lyrics = []

    # https://stackoverflow.com/questions/17912307/u-ufeff-in-python-string
    with open(lrc_file, 'r',  encoding='utf-8-sig') as f:
        for line in f:
            match = re.match(pattern, line.strip())
            if match:
                minutes = int(match.group(1))
                seconds = float(match.group(2))
                lyric = match.group(3)
                timestamp = minutes * 60 + seconds  # Convert to total seconds
                lyrics.append([timestamp, lyric])
    
    return lyrics