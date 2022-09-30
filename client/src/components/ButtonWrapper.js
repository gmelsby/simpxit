import { Button, Spinner } from 'react-bootstrap';
import { useState } from 'react';

export default function ButtonWrapper(props) {
  const buttonProps = {...props};
  const children = buttonProps.children;
  delete buttonProps.children;

  const [recentlyClicked, setRecentlyClicked] = useState(false);

  // modify passed-in onClick to use a timer
  buttonProps.onClick  = () => {
    setRecentlyClicked(true);
    if (props.onClick !== undefined) {
      props.onClick();
    }

    setTimeout(() => setRecentlyClicked(false), 6000);
  }

  buttonProps.disabled = recentlyClicked;
  
  if (recentlyClicked) {
    return (
      <Button {...buttonProps}>
        <Spinner as="span" animation="border" size="sm" />
        {' ' + children}
      </Button>
    );}

  return (<Button {...buttonProps}>{children}</Button>);



}