import { React, useEffect, useState } from 'react';
import axios from 'axios';
import {Grid2 as Grid } from '@mui/material';

import LyricsAudioPlayer from './audio/AudioComponent';
import {ImageDrawer} from './sidebar/sidebar'
import ImageCard from './imageBlock';


function App(){
  const [resourceTable, setResourceTable] = useState(null); // init once per page
  const [sideBarOpen, setSideBarOpen] = useState(false);
  const [sideBar, setSideBar] = useState([])
  const [sideBarSelection, setSideBarSelection] = useState("")
  const [audioLk, setAudioLk] = useState("");
  const [subtitleLk, setSubtitleLk] = useState("");

  const fetchData = async () =>{
    try {
      const resources = await axios.get("/api/resources/page/0");
      const table = {}

      for (let identifier of resources.data){
        table[identifier] = (await axios.get(`/api/resource/${identifier}`)).data
      }
      setResourceTable(table)
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
  useEffect(()=>{
    fetchData()
  }, [])


  return (
  <div>
    <Grid container spacing={2} sx={{marginLeft : 2}}>

      {resourceTable && (Object.entries(resourceTable).map(([identifier, items]) => (
        <Grid item='true' xs={12} sm={6} md={4} sx={{ width: 128, height: 196 }} key={identifier}>
          <ImageCard 
            imageSources={[...Array(items["images"].length)].map((_, i) => `/api/image/${identifier}/${i}`)}
            title={identifier} 
            description={identifier} 
            onClick={()=>{
              setSideBarOpen(true)
              setSideBarSelection(identifier);
              setSideBar(items["resources"]);
            }}
            rotationInterval={1000}
            height={128}
          />
        </Grid>

      )))
    }
    </Grid>
    { (sideBarOpen && sideBarSelection && sideBar) && (
      <ImageDrawer 
        open={sideBarSelection !== ""} 
        onClose={()=>setSideBarOpen(false)} 
        clickWrapper={(ind)=>{
          setAudioLk(`/api/audio/${sideBarSelection}/${ind}`)
          setSubtitleLk(`/api/subtitle/${sideBarSelection}/${ind}`)
          setSideBarOpen(false)
        }}
        items={sideBar}
        imageSrc={`/api/image/${sideBarSelection}/0`} 
        title={sideBarSelection} 
        description={sideBarSelection} 
      />
    )}

    { (audioLk && subtitleLk) && (<LyricsAudioPlayer 
      audioUrl={audioLk}
      subtitleURL={subtitleLk}
    />) }
  </div>
  )
}

export default App;
