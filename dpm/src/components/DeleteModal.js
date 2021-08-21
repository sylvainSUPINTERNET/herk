import react, {useEffect, useState, useRef} from "react";
import { Card, Button, Modal } from 'react-bootstrap';
import {GiStigmata } from "react-icons/gi";
import { conf } from '../config';

function DeleteModal ({link, ws, sharingUuid, pos}) {
    const [show, setShow] = useState(false);

    const handleClose = () => {
        setShow(false);
        
        ws.send(JSON.stringify({
            "topic":"removeFile",
            "hash": sharingUuid,
            "position": pos
          }));
    };
    const handleShow = () => {
        setShow(true);
    };



    return (<div>

                <GiStigmata style={{  background: "linear-gradient(to right, #870000,#830000)", fontSize:"2em", "cursor": "pointer", borderRadius: "10px"}} onClick={handleShow}/>

                <Modal show={show} onHide={handleClose}>
                    <Modal.Header closeButton>
                    <Modal.Title>Do you want to delete ?</Modal.Title>
                    </Modal.Header>
                    <Modal.Footer>
                    <Button variant="danger" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleClose}>
                        Confirm
                    </Button>
                    </Modal.Footer>
                </Modal>
        </div>)
}

export default DeleteModal;