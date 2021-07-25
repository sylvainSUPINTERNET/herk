import logo from './logo.svg';
import './App.css';
import { nanoid } from 'nanoid'

import react, {useEffect, useState, useRef} from "react";

function App() {
  const [sharingUuid, setSharingUuid] = useState(nanoid(5));
  
  let [filesUrls, setFilesUrl] = useState([])

  useEffect( () => {
  }, [filesUrls]);


  window.addEventListener("dragover", (event) => {
    event.preventDefault();
    console.log("test");
  });

  
  window.addEventListener("drop", (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    Array.from(event.dataTransfer.files).map(file => {
      filesUrls = [...filesUrls, URL.createObjectURL(file)];
    })
    setFilesUrl(filesUrls);
    console.log(event.dataTransfer.files)
  });


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
        <code>{filesUrls.length}</code>
        { filesUrls && filesUrls.length > 0 && 
        filesUrls.map( url => { <div>
          <a src={url}>MONKA</a>
          </div>
        })
        }
      </div>
      </header>
    </div>
  );
}

export default App;
