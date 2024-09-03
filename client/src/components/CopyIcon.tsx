import React, { useState } from 'react';
import { BiCopy, BiCheck } from 'react-icons/bi';
import { Alert } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';

// icon that when clicked copies text to browser clipboard
export function CopyIcon({ text, descriptor }: { text: string, descriptor: string }) {
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
        setTimeout(resetAlert, 1500);
      });
  };

  const resetAlert = () => {
    setClicked(false);
    setIsSuccessful(false);
  };

  return (
    <>
      <AnimatePresence>
        {clicked &&
          <motion.div
            className='z-1 position-absolute d-flex justify-content-center top-0 start-0 w-100 mt-5 align-items-center'
            key="copy-notification"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ mass: 5 }}
          >
            <Alert variant={isSuccessful ? 'success' : 'danger'} className="rounded">
              <p>
                {isSuccessful ? `Copied ${descriptor} to clipboard` : 'Error copying to clipboard'}
              </p>
            </Alert>
          </motion.div>}
      </AnimatePresence>


      {clicked ?
        <BiCheck className='text-success copying' /> :
        <BiCopy className='selectable' onClick={putTextInClipboard} />
      }
    </>
  );
}
