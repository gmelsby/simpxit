import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { Container } from 'react-bootstrap';


// justifies according to justifyType unless oveflow is detected, in which case it will justify content start
export default function JustifySafelyContainer({justifyType, overflowType, className, children, ref}: 
  {
    justifyType: 'center' | 'evenly', 
    overflowType?: 'auto' | 'visible', 
    className: string, children: ReactNode, 
    ref?: React.MutableRefObject<HTMLDivElement | null>
  }) {

  const containerElement = ref !== undefined ? ref : useRef<HTMLDivElement>(null);
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
          `justify-content-start overflow-${overflowType ? overflowType : 'visible'}` :
          `justify-content-${justifyType}`
        }
      ${className}`}
      ref={containerElement}
    >
      {children}
    </Container>
  );
}