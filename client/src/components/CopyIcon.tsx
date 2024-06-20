import React, { useState } from 'react';
import { BiCopy, BiCheck } from 'react-icons/bi';
import { Alert, Container } from 'react-bootstrap';

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
      })
      .finally(() => {
        setTimeout(resetAlert, 2000);
      });
  };

  const resetAlert = () => {
    setClicked(false);
    setIsSuccessful(false);
  };

  return (
    <>
      <Container className={`${clicked ? 'position-absolute top-0 start-50 translate-middle pt-5 mt-5' :  'd-none'}`}>
        <Alert variant="success" className="mt-5">
          <Alert.Heading>Copy {isSuccessful ? 'Successful': 'Error'}</Alert.Heading>
          <p>
            {isSuccessful ? `Copied ${descriptor} to clipboard` : 'Error copying to clipboard'}
          </p>
        </Alert>
      </Container>
      {clicked ? 
        <BiCheck className='text-success copying'/> : 
        <BiCopy className='selectable' onClick={putTextInClipboard}/>
      }
    </>
    
  );
}
