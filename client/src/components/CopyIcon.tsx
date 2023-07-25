import React, { useState } from 'react';
import { BiCopy, BiCheck } from 'react-icons/bi';
import { Toast, ToastContainer } from 'react-bootstrap';

// icon that when clicked copies text to browser clipboard
export function CopyIcon({ text, descriptor }: { text: string, descriptor: string}) {
  const [clicked, setClicked] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const putTextInClipboard = () => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setIsSuccessful(true);
        setClicked(true);
      })
      .catch(() => {
        setIsSuccessful(false);
        setClicked(true);
      });
  };

  return (
    <>
      <ToastContainer className="pb-3 pt-5 px-3" position='top-end' style={{zIndex: 1}}>
        <Toast show={clicked} onClose={() => setClicked(false)} delay={2000} autohide bg="light" className="rounded mb-2">
          <Toast.Header className="bg-success text-light">
            <strong className="me-auto">Copy {isSuccessful ? 'Successful': 'Error'}</strong>
          </Toast.Header>
          <Toast.Body>
            {isSuccessful ? `Copied ${descriptor} to clipboard` : 'Error copying to clipboard'}
          </Toast.Body>
        </Toast>
      </ToastContainer>
      {clicked ? 
        <BiCheck className='text-success copying'/> : 
        <BiCopy className='selectable' onClick={putTextInClipboard}/>
      }
    </>
    
  );
}
