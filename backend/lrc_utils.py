import re


def parse_lrc(lrc_file) -> list[list[float, str]]:
    """Parses the LRC file and returns a list of [timestamp, lyric]."""
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

def parse_vtt(file_path) -> list[list[float, str]]:
    # Pattern to match timestamps (e.g., 00:00:01.000 --> 00:00:04.000)
    timestamp_pattern = re.compile(r"(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})")
    lyrics_list = []
    current_timestamp = None
    def convert_timestamp_to_float(timestamp):
        hours, minutes, seconds = timestamp.split(':')
        total_seconds = int(hours) * 3600 + int(minutes) * 60 + float(seconds)
        return total_seconds
    with open(file_path, 'r', encoding='utf-8-sig') as file:
        for line in file:
            line = line.strip()
            # Match timestamp lines
            timestamp_match = timestamp_pattern.match(line)
            if timestamp_match:
                # Set the current timestamp to the start time of the line
                current_timestamp = timestamp_match.group(1)
            elif line and current_timestamp:
                # If line is not empty and there's a current timestamp, it's a lyric/caption
                lyrics_list.append([convert_timestamp_to_float(current_timestamp), line])
                current_timestamp = None  # Reset timestamp for next entry
    return lyrics_list
