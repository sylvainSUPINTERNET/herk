import logo from './logo.svg';
import './App.css';
import { nanoid } from 'nanoid'

import react, {useEffect, useState, useRef} from "react";

function App() {
  const [sharingUuid, setSharingUuid] = useState("");
  
  let [filesUrls, setFilesUrl] = useState(new Map());
  let [ws, setWs] = useState(new WebSocket("ws://localhost:5000"));

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
    });

      
    window.addEventListener("dragover", (event) => {
      event.preventDefault();
    });

    ws.onmessage = msg => {
      try {
        const { data } = msg;
        console.log(data);
      } catch ( e ) {
        console.log(e);
      }
    }
    ws.onopen = ev => {
      ws.send(JSON.stringify({
        "topic":"incomming",
        "hash": sharingUuid
      }))
    }

    
  }, [filesUrls, sharingUuid]);


  


  return (
    <div className="App">
      <header className="App-header">
      <div className="container">
        <p> 🤝 {sharingUuid} </p>
        <div>
          <h1>Uplaod</h1>
        </div>
      </div>
      <div>
        Uploaded : 
        <code>{filesUrls.size}</code>
        { filesUrls && filesUrls.size > 0 && 
          [...filesUrls.keys()].map( (key,i) => {
              return <div>
                  <a href={filesUrls.get(key)} key={i} download>{key}</a>
                </div>
          })
        }
      </div>
      </header>
    </div>
  );
}

export default App;
