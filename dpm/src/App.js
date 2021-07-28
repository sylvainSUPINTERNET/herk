import logo from './logo.svg';
import './App.css';
import { nanoid } from 'nanoid'

import react, {useEffect, useState, useRef} from "react";
import { conf } from './config';

function App() {
  const [sharingUuid, setSharingUuid] = useState("");
  
  let [filesUrls, setFilesUrl] = useState(new Map());
  let [ws, setWs] = useState(new WebSocket(conf.WS_URL)); // DEV - useState(new WebSocket("ws://localhost:5000"));

  let [downloadableBlobUrls, setDownloadableBlobsUrl] = useState([]);

  useEffect( () => {

    let parts = new URL(window.location).pathname.split("/")
    if ( parts.length === 2 && parts[1] !== "") {
      setSharingUuid(parts[1]);
    } else {
      let newUrl = `${window.location.origin}/${nanoid(5)}`;
      window.location.href = `${newUrl}`;
    }
    

    window.addEventListener("drop", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      let m = new Map();
      Array.from(event.dataTransfer.files).map(file => {
        m.set(file.name, URL.createObjectURL(file));
      })
      filesUrls = m;
      setFilesUrl(filesUrls);
    

      let blobUrlsList = [];
      [...filesUrls.keys()].map( (key,i) => {
        blobUrlsList = [...blobUrlsList, filesUrls.get(key)]
      })
      ws.send(JSON.stringify({
        "topic": "uploadFiles",
        "blobFiles": blobUrlsList,
        "hash": parts[1]
      }));

    });

      
    window.addEventListener("dragover", (event) => {
      event.preventDefault();
    });

    ws.onmessage = msg => {
  
      try {
        const {topic, payload} = JSON.parse(msg.data);
        if ( topic === "downloadable" ) {
          setDownloadableBlobsUrl(payload);
        }

        if ( topic === "newUser" ) {
          if (  JSON.parse(msg.data).currentFiles ) {
            setDownloadableBlobsUrl(JSON.parse(msg.data).currentFiles);
          }
        }
      } catch ( e ) {
        console.log(e);
      }
    }
    ws.onopen = ev => {
      ws.send(JSON.stringify({
        "topic":"join",
        "hash": sharingUuid
      }))
    }

    
  }, [filesUrls, sharingUuid, downloadableBlobUrls]);


  


  return (
    <div>

      <div>
        <div style={{display: "flex", justifyContent: 'center'}}>
          <p> 🤝 <span style={{"background": "red", "padding" :"10px", "borderRadius": "15px"}} className="card-1">{sharingUuid}</span> </p>
        </div>
      </div>



      <div style={{"display": "flex", "flexFlow":"wrap"}}>

      <div style={{"flex":1}}>
          <div>
            <h1 style={{textAlign: 'center'}}>Uploaded</h1>
            { filesUrls && filesUrls.size > 0 && 
                [...filesUrls.keys()].map( (key,i) => {
                    return <div>
                          <a href={filesUrls.get(key)} key={i} download>{key}</a>
                      </div>
                })
              }
          </div>
        </div>

        <div style={{"flex":1}}>
          <div>
            <h1 style={{textAlign: 'center'}}>Exposed medias</h1>
            {downloadableBlobUrls && downloadableBlobUrls.length > 0 && downloadableBlobUrls.map( (blobUrl, i) => {
              return <div>
                  <a href={blobUrl} key={i} download>{blobUrl}</a>
                </div>
            })}
          </div>
        </div>
      </div>




    </div>
  );
}

export default App;
