import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { Container } from 'react-bootstrap';

// justifies according to justifyType unless oveflow is detected, in which case it will justify content start
export default function JustifySafelyContainer({
  justifyType,
  overflowType,
  className,
  children,
  containerRef,
}: {
  justifyType: 'center' | 'evenly';
  overflowType?: 'auto' | 'hidden' | 'visible';
  className: string;
  children: ReactNode;
  containerRef?: React.MutableRefObject<HTMLDivElement | null>;
}) {
  const containerElement =
    containerRef !== undefined ? containerRef : useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflowing = () => {
      if (containerElement.current !== null) {
        setOverflowing(
          containerElement.current.scrollHeight >
            containerElement.current.offsetHeight,
        );
      }
    };

    // on component load or ater change
    checkOverflowing();
    // check again after event loop has had some time
    const timeouts = [setTimeout(checkOverflowing, 100)];
    timeouts.push(setTimeout(checkOverflowing, 200));
    timeouts.push(setTimeout(checkOverflowing, 300));
    timeouts.push(setTimeout(checkOverflowing, 400));
    timeouts.push(setTimeout(checkOverflowing, 500));

    const observer = new ResizeObserver(() => checkOverflowing);
    // keep updating every time a resize happens
    if (containerElement.current !== null) {
      observer.observe(containerElement.current);
    }
    // check for window resize too
    window.addEventListener('resize', checkOverflowing);
    // cleanup
    return () => {
      timeouts.forEach(t => clearTimeout(t));
      window.removeEventListener('resize', checkOverflowing);
      observer.disconnect();
    };
  }, [overflowType, containerElement.current]);

  return (
    <Container
      className={`${
        overflowing
          ? `justify-content-start overflow-${overflowType ? overflowType : 'visible'}`
          : `justify-content-${justifyType}`
      }
      ${className}`}
      ref={containerElement}
    >
      {children}
    </Container>
  );
}
