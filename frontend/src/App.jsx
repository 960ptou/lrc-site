import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

import LyricsAudioPlayer from './AudioComponent';

function App(){
  return (
  <div>
    <LyricsAudioPlayer 
      audioUrl={'/api/audio'}
      lrcUrl={'/api/lrc_file'}
    /> 
  </div>
  )
}

export default App;
