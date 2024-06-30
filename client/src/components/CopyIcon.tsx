import React, { useState } from 'react';
import { BiCopy, BiCheck } from 'react-icons/bi';
import { Alert } from 'react-bootstrap';

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
      <div className={clicked ? 'z-1 position-absolute d-flex justify-content-center top-0 start-0 w-100 mt-5 align-items-center' : 'd-none'}>
        <Alert variant={isSuccessful ? 'success': 'danger'} className="rounded">
          <p>
            {isSuccessful ? `Copied ${descriptor} to clipboard` : 'Error copying to clipboard'}
          </p>
        </Alert>
      </div>
      {clicked ? 
        <BiCheck className='text-success copying'/> : 
        <BiCopy className='selectable' onClick={putTextInClipboard}/>
      }
    </>
  );
}
