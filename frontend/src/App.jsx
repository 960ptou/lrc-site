import { React, useEffect, useState, useRef } from 'react';
import axios from 'axios';

import LyricsAudioPlayer from './AudioComponent';
import { Card, CardMedia, CardContent, ButtonBase, Typography , Grid2 as Grid } from '@mui/material';

import { Drawer, IconButton, CardActionArea , Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function ImageCardHorizontal({ imageSrc, title, onClick, height, width }) {
  return (
    <CardActionArea onClick={onClick} style={{ alignItems: 'center', width: '100%' }}>
      <Card sx={{ display: 'flex', flexDirection: 'row', width: '95%', boxShadow: 'none',}}>
        <CardMedia
          component="img"
          src={imageSrc}
          alt={title}
          sx={{ width: width, height: height }}
        />
        <Tooltip title={title} arrow>
          <Typography
            variant="h6"
            sx={{
              marginLeft: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </Typography>
        </Tooltip>
      </Card>
    </CardActionArea>
  );
}


// Drawer Component
const ImageDrawer = ({ open, onClose, clickWrapper, items, imageSrc, title, description }) => {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <div style={{ width: '384px', padding: '8px' }}>
        <IconButton onClick={onClose} style={{ float: 'right' }}>
          <CloseIcon />
        </IconButton>

        <img src={imageSrc} alt={title} style={{ height: '64px', width: '100%', borderRadius: '8px' }} />
        <Typography variant="h6" style={{ marginTop: '16px' }}>{title}</Typography>
        <Typography variant="body1">{description}</Typography>

        <Grid container spacing={0.5} sx={{ marginTop: 2 }} columns={2} >
          {items.map((id, ind) => (
            <Grid xs={4} sm={4} md={4} key={id} sx={{ flexShrink: 0 }} width={"100%"}>
              <ImageCardHorizontal
                imageSrc={imageSrc}
                title={id}
                onClick={() => clickWrapper(ind)}
                height={32}
                width={64}
              />
            </Grid>
          ))}
        </Grid>
      </div>
    </Drawer>
  );
};



function ImageCard({ 
  imageSrc, 
  title, 
  onClick,
  height = 100,
}) {
    return (
      <ButtonBase onClick={onClick} style={{ width: '100%' }}>
        <Card>
          <CardMedia
            component="img"
            alt={title}
            height={`${height}`}
            image={imageSrc}
          />
          <CardContent>
            <Typography variant="h5" component="div">
              {title}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </CardContent>
        </Card>
      </ButtonBase>

    );
}


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
    <Grid container spacing={2}>

      {resourceTable && (Object.entries(resourceTable).map(([identifier, items]) => (
        <Grid item='true' xs={12} sm={6} md={4} key={identifier}>
          <ImageCard 
            imageSrc={`/api/image/${identifier}/0`} 
            title={identifier} 
            description={identifier} 
            onClick={()=>{
              setSideBarOpen(true)
              setSideBarSelection(identifier);
              setSideBar(items["resources"]);
            }}
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
