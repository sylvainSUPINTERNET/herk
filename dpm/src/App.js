import logo from './logo.svg';
import './App.css';
import { nanoid } from 'nanoid'
import { ToastContainer, toast } from 'react-toastify';
import react, {useEffect, useState, useRef} from "react";
import { conf } from './config';
import 'react-toastify/dist/ReactToastify.css';

import { Card, Button } from 'react-bootstrap';
import { FcDocument } from "react-icons/fc";
import { GiTeleport, GiThreeFriends, GiTabletopPlayers, GiStigmata } from "react-icons/gi";
import DeleteModal from "./components/DeleteModal"

function App() {
  const [sharingUuid, setSharingUuid] = useState("");
  
  let [filesUrls, setFilesUrl] = useState(new Map());
  let [ws, setWs] = useState(new WebSocket(conf.WS_URL)); // DEV - useState(new WebSocket("ws://localhost:5000"));

  let [downloadableBlobUrls, setDownloadableBlobsUrl] = useState([]);

  let convertFileSizeToMb = (bytes) => {
    return (bytes / (1024*1024)).toFixed(2);
  }
  
  /**
   * Use to generate b64 data url above the blob since it's local and chrome security block download local files from another devies
   * @param {*} blob 
   */
  const blob2b64 = (blob) => new Promise( (resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = () => {};
    reader.onload = () => {
         resolve(reader.result)
    };
    reader.readAsDataURL(blob);
  });

  const convertBlobToBase64 = (blob) => {
    const reader = new FileReader;
    reader.onerror = () => {};
    reader.onload = () => {
        return reader.result
    };
    reader.readAsDataURL(blob);
  };


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
      let arrFilesDataTransfer = Array.from(event.dataTransfer.files);
      arrFilesDataTransfer.map( async (file,i) => {
        console.log(file);
        if ( convertFileSizeToMb(file.size) > conf.UPLOAD_WS_PAYLOAD_MAX_SIZE ) {

          toast.error(`Size max is ${conf.UPLOAD_WS_PAYLOAD_MAX_SIZE} MB !`, {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            });

          return
        }
        blob2b64(file).then( b64Url => {

          m.set(file.name, `${file.name}$${URL.createObjectURL(file)}$${b64Url}`);

          if ( arrFilesDataTransfer.length - 1 === i ) {
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
      
          }
        }).catch(err => console.log(err))
      });


    });

      
    window.addEventListener("dragover", (event) => {
      event.preventDefault();
    });

    ws.onmessage = msg => {
  
      try {
        const {topic, payload} = JSON.parse(msg.data);
        if ( topic === "downloadable" ) {
          console.log("response")
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
        }));
      

    }

    
  }, [filesUrls, sharingUuid, downloadableBlobUrls]);


  
  const copyToClipboard = () => {
    console.log(sharingUuid);
    toast.dark(`Copied ${sharingUuid} !`, {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      });

      const el = document.createElement('textarea');
      el.value = window.location.href;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
  }
  

  return (
    <div>
      <div>
        <div style={{display: "flex", justifyContent: 'center', fontSize: "28px"}} onClick={copyToClipboard}>
          <p> <span style={{
            "background": "#FEAC5E",
            "background" :"-webkit-linear-gradient(to right, #4BC0C8, #C779D0, #FEAC5E)",
            "background": "linear-gradient(to right, #4BC0C8, #C779D0, #FEAC5E)",
             "padding" :"10px",
             "cursor": "pointer",
              "borderRadius": "15px"}} className="card-1"> 🤝 {sharingUuid} 👽</span> </p>
        </div>
      </div>


      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        />
        

      {/* <div style={{"flex":1}}>
          <div>
            <h1 style={{textAlign: 'center'}}>Uploaded</h1>
            { filesUrls && filesUrls.size > 0 && 
                [...filesUrls.keys()].map( (key,i) => {
                    return <div>
                          <a href={filesUrls.get(key).split("$")[1]} key={i} download>{key}</a>
                      </div>
                })
              }
          </div>
        </div> */}

        <div>
          <div>
            <h1 style={{textAlign: 'center', color: "ghostwhite", margin: "0.5em"}} className="">Sharing your files !</h1>
              <div className="container text-center" style={{"color": "ghostwhite"}}>
                <p className="mt-2" style={{"fontSize": "1.5em"}} >👽 Share the code to your friends</p>
                <p className="mt-2" style={{"fontSize": "1.5em"}} >🗃️ Drag and drop your files here</p>
                <p className="mt-2" style={{"fontSize": "1.5em"}} >💸 It's free and anonymous forever</p>
              </div>





              <div style={{"display": "flex", "flexFlow": "wrap", justifyContent: "center"}}>

                  {downloadableBlobUrls && downloadableBlobUrls.length > 0 && downloadableBlobUrls.map((blobUrl, i) => {
                    return <div className="card-1 m-2" style={{"maxWidth": "15em", alignSelf: "start"}}>
                      <Card style={{ borderRadius: "10px", color:"white", backgroundImage:"linear-gradient(to left bottom, #001816, #00222c, #002b4c, #00306d, #002b81, #173090, #28369e, #383bad, #5357c2, #6d74d7, #8791eb, #a3afff)"}}>
                        <Card.Body>
                          <DeleteModal link={blobUrl} ws={ws} sharingUuid={sharingUuid} pos={i}/>
                          <Card.Title> 🗂️ <a style={{"color": "ghostwhite"}} href={blobUrl.split("$")[2]} key={i} download={`${blobUrl.split("$")[0]}`}>{blobUrl.split("$")[0]}</a> </Card.Title>
                        </Card.Body>
                      </Card>
                      </div>
                  })}
              </div> 



          </div>




        </div>




                

    </div>
  );
}

export default App;


