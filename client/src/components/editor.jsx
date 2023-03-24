import { useEffect, useState } from 'react'; 
import {Box} from '@mui/material';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import styled from '@emotion/styled';
import {io} from 'socket.io-client'
import { useParams } from 'react-router-dom';
const Component=styled.div`
 background:#F5F5F5;
 `

const toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    ['blockquote', 'code-block'],
  
    [{ 'header': 1 }, { 'header': 2 }],               // custom button values
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
    [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
    [{ 'direction': 'rtl' }],                         // text direction
  
    [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  
    [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
    [{ 'font': [] }],
    [{ 'align': [] }],
  
    ['clean']                                         // remove formatting button
  ];

const Editor=()=>{
  const [quill, setQuill] = useState();
  const [socket, setSocket] = useState();
  const {id} = useParams();

  useEffect(()=>{
    const quillServer = new Quill('#container',{theme:'snow',modules:{toolbar:toolbarOptions}});
    quillServer.disable();
    quillServer.setText("Loading the document.....");
    setQuill(quillServer);
  },[]);

  useEffect(()=>{
    const socketServer  = io("");
    setSocket(socketServer);

    return ()=>{
      socketServer.disconnect();
    }
  },[]);

  useEffect(()=>{
    if(socket === null || quill === null) return;

    const handleChanges = (delta, oldData,source)=>{
      if(source !== "user") return ;
      socket && socket.emit("send-changes",delta);
    }

    quill && quill.on("text-change",handleChanges);

    return ()=>{
      quill && quill.off("text-change",handleChanges);
    }
  },[socket,quill]);

  useEffect(()=>{
    if(quill === null || socket === null) return ;

    const handleChanges = (delta)=>{
      quill && quill.updateContents(delta);
    }

    socket && socket.on("receive-changes",handleChanges);

    return ()=>{
      socket && socket.off("receive-changes",handleChanges)
    }
  },[socket,quill]);

  useEffect(()=>{
    if(socket === null || quill === null) return;

    socket && socket.once("load-document",(document)=>{
      quill && quill.setContents(document);
      quill && quill.enable();

    })

    socket && socket.emit("get-document",id);

  },[socket,quill,id]);

  useEffect(()=>{
    if(socket === null || quill === null) return; 

    const interval = setInterval(()=>{
      socket && socket.emit("save-changes",quill.getContents())
    },2000)

    return ()=>{
      clearInterval(interval);
    }
  },[quill,socket]);

  return (
      <Component>
      <Box className='container' id='container'></Box>
      </Component>
  )
}

export default Editor;