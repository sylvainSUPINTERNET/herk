import logo from './logo.svg';
import './App.css';
import { nanoid } from 'nanoid'

import react, {useEffect, useState, useRef} from "react";

function App() {
  const [sharingUuid, setSharingUuid] = useState(nanoid(5));
  
  let [filesUrls, setFilesUrl] = useState(new Map());

  useEffect( () => {

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
    
  }, [filesUrls]);


  


  return (
    <div className="App">
      <header className="App-header">
      <div className="container">
        <div style={{background: 'red'}}>
          <h1>Uplaod</h1>
        </div>
      </div>
      <div>
        Uploaded : 
        <code>{filesUrls.size}</code>
        { filesUrls && filesUrls.size > 0 && 
          [...filesUrls.keys()].map( key => {
              return <div>
                  <a href={filesUrls.get(key)} key={filesUrls.get(key)+key} download>{key}</a>
                </div>
          })
        }
      </div>
      </header>
    </div>
  );
}

export default App;
