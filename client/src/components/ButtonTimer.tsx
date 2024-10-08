import React from 'react';
import { Button, ButtonProps, Spinner } from 'react-bootstrap';
import { useState, useEffect, useRef } from 'react';


interface TimerButtonProps extends ButtonProps {
  timer?: number;
}
/*
* Wrapper for react-bootstrap Button that activates a cooldown timer when pressed
* Default value for timeout is 6 seconds, can be modified by passing in "timer" as a prop
*/
export default function ButtonTimer(props: TimerButtonProps) {
  // copy props and store children seperately
  const buttonProps = { ...props };
  const children = buttonProps.children;
  delete buttonProps.children;


  // handles clearing timeout when component unmounted
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const [recentlyClicked, setRecentlyClicked] = useState(false);

  // modify passed-in onClick to use a timer
  buttonProps.onClick = (event) => {
    setRecentlyClicked(true);
    if (props.onClick !== undefined) {
      props.onClick(event);
    }

    // default is 6 seconds unless props.timer is defined
    timeoutRef.current = setTimeout(() => setRecentlyClicked(false), props.timer || 6000);
  };

  // keep button disabled if props indicate, otherwise disable when recently clicked
  buttonProps.disabled = props.disabled || recentlyClicked;

  if (recentlyClicked) {
    return (
      <Button {...buttonProps}>
        <Spinner as="span" animation="border" size="sm" />
        {' ' + children}
      </Button>
    );
  }

  return (<Button {...buttonProps}>{children}</Button>);



}