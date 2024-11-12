import { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./AudioComponent.css";

/** CHATGPT - GENERATED -> Yes, I've read it
 * LyricsAudioPlayer Component
 *
 * A component that plays an audio file and displays synchronized lyrics,
 * animating each character individually. Provides customization for timing
 * and text separation for flexibility across different media files.
 *
 * Props:
 * - `audioUrl` (string): URL of the audio file to play.
 * - `subtitleURL` (string): URL of the LRC file containing timestamped lyrics data.
 * - `percentBeforeComplete` (number, optional): Determines completion percentage for
 *    lyric animation relative to timestamp. Defaults to 0.5.
 * - `splitChar` (string, optional): Custom character for separating visible and upcoming lyrics.
 *    Defaults to '\u001F' (Unit Separator). | specific to each data set, but just ensure it's uncommon
 *
 * Example Usage:
 *
 * ```jsx
 * import LyricsAudioPlayer from './LyricsAudioPlayer';
 *
 * function MyApp() {
 *   return (
 *     <LyricsAudioPlayer
 *       audioUrl="/path/to/audio.mp3"
 *       subtitleURL="/path/to/lyrics.lrc"
 *       percentBeforeComplete={0.4}
 *       splitChar="§"
 *       onAudioEnd=callback
 *     />
 *   );
 * }
 *
 * export default MyApp;
 * ```
 *
 * Core Features:
 * 1. Dynamic Character-by-Character Animation: Displays lyrics with characters revealed
 *    progressively, based on timing in the audio file. Animation delay is calculated per character.
 *
 * 2. Custom Split Character: Allows customization of where the split character appears in the lyrics,
 *    enhancing display without interfering with actual lyric text.
 *
 * 3. Auto-Sync with Audio: Handles audio playback and synchronizes lyric timing with
 *    the audio's `currentTime`, adjusting animation state as the audio plays or pauses.
 *
 * Notes:
 * - Ensure accompanying CSS styles are present for `lyric`, `active`, and `running`
 *   classes to control appearance and animation behavior.
 * - LRC data should be JSON formatted, where keys are timestamps (in seconds or ms)
 *   and values are the corresponding lyric lines.
 */

const LyricsAudioPlayer = ({
    audioUrl, // URL of audio file
    subtitleURL, // URL of LRC data
    percentBeforeComplete = 0.5, // Completion percentage for lyric animation
    splitChar = "\u001F", // Custom character for splitting lyrics
    onAudioEnd = () => null, // When audio finish
    auto = false,
}) => {
    const [subtitleData, setSubtitleData] = useState(new Map());
    const [allowedTimes, setAllowedTimes] = useState([]);
    const [audioSrc, setAudioSrc] = useState(null);
    const [currentLyric, setCurrentLyric] = useState("");
    const [isActive, setIsActive] = useState(false);
    const [runningAnimation, setRunningAnimation] = useState(false);
    const [animationDelayTime, setAnimationDelayTime] = useState(0);

    const audioRef = useRef(null);

    // Fetch LRC data and audio source from URLs
    const fetchData = async () => {
        try {
            // Fetch LRC data
            const response = await axios.get(subtitleURL);
            const mapData = new Map(response.data);
            setSubtitleData(mapData);
            setAllowedTimes([...mapData.keys()]);

            // Fetch audio source
            const audioResponse = await axios.get(audioUrl, {
                responseType: "blob",
            });
            const audioURL = URL.createObjectURL(audioResponse.data);
            setAudioSrc(audioURL);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [audioUrl, subtitleURL]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!audioRef.current) return;

            const currentTime = audioRef.current.currentTime;
            let previous = 0;
            let next = 0;

            // Find the closest lyric timing
            for (let time of allowedTimes) {
                if (currentTime === 0) {
                    break;
                }
                if (currentTime > previous && currentTime < time) {
                    next = time;
                    break;
                }
                previous = time;
            }

            let newLyric = subtitleData.get(previous) || "";
            const averageTime = (
                ((next - previous) * (1 - percentBeforeComplete)) /
                newLyric.length
            ).toFixed(2);
            const visibleChars = Math.round(
                (currentTime - previous) / averageTime
            );
            if (visibleChars < newLyric.length) {
                newLyric =
                    newLyric.slice(0, visibleChars) +
                    splitChar +
                    newLyric.slice(visibleChars);
            }


            if (
                newLyric.replace(splitChar, "") !==
                currentLyric.replace(splitChar, "")
            ) {
                setIsActive(false);
                setTimeout(() => {
                    setAnimationDelayTime(averageTime);
                    setCurrentLyric(newLyric);
                    setIsActive(true);
                }, 10);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [
        subtitleData,
        currentLyric,
        allowedTimes,
        percentBeforeComplete,
        splitChar,
    ]);

    const handlePlayPause = () => {
        setRunningAnimation(!audioRef.current.paused);
    };

    return (
        <div style={{ width: 300, margin: "50px auto" }}>
            {subtitleData.size > 0 && (
                <div>
                    <div
                        className={`lyric ${isActive ? "active" : ""} ${
                            runningAnimation ? "running" : ""
                        }`}
                    >
                        <span key={`${currentLyric}`}>
                            {currentLyric.split(splitChar)[0]}
                        </span>

                        {currentLyric
                            ?.split(splitChar)[1]
                            ?.split("")
                            .map((char, index) => (
                                <span
                                    key={`${currentLyric}-${index}`}
                                    style={{
                                        animationDelay: `${
                                            index * animationDelayTime
                                        }s`,
                                    }}
                                >
                                    {/* So white space is still showed */}
                                    {char === " " ? "\u00A0" : char} 
                                </span>
                            ))}
                    </div>

                    <audio
                        autoPlay={auto}
                        ref={audioRef}
                        src={audioSrc}
                        controls
                        onPlay={handlePlayPause}
                        onPause={handlePlayPause}
                        onEnded={onAudioEnd} // Event triggered when audio finishes
                    />
                </div>
            )}
        </div>
    );
};

export default LyricsAudioPlayer;
