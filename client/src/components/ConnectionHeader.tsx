import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert } from 'react-bootstrap';

export default function ConnectionHeader({ isConnected }: {isConnected: boolean}) {
  return (
    <AnimatePresence>
      {!isConnected && 
        <motion.div 
          className="z-2 fluid position-absolute flex-column d-flex m-auto w-100 align-items-center text-center"
          key="connection-header"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ mass: 5 }}
        >
          <Alert variant="warning" className="mt-5 mx-2">Connection with server interrupted. Attempting to reconnect...</Alert>
        </motion.div>}
    </AnimatePresence>
  );

}