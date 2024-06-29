import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { Container } from 'react-bootstrap';


// justifies evenly unless oveflow is detected, in which case it will justify content start
export default function JustifyEvenlyContainer({className, children}: {className: string, children: ReactNode}) {

  const containerElement = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflowing = () => {
      if (containerElement.current !== null) {
        setOverflowing(containerElement.current.scrollHeight > containerElement.current.offsetHeight);
      }
    };

    // on component load
    checkOverflowing();

    const observer = new ResizeObserver(() => checkOverflowing);
    // keep updating every time a resize happens
    if (containerElement.current !== null) {
      observer.observe(containerElement.current);
    }
    // check for window resize too
    window.addEventListener('resize', checkOverflowing);
    // cleanup
    return (() => {
      window.removeEventListener('resize', checkOverflowing);
      observer.disconnect();
    });
  }, [containerElement.current]);

  return (
    <Container 
      className=
        {`${overflowing ? 
          'justify-content-start overflow-auto' : 
          'justify-content-evenly overflow-hidden'
        }
      ${className}`}
      ref={containerElement}
    >
      {children}
    </Container>
  );
}