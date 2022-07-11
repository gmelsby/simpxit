import { React } from 'react';

export default function StoryTellerPick({ 
                                        isStoryteller
                                        }) {

  if (!isStoryteller) {
    return (
      <>
        <p>Wait for the Storyteller to pick a card...</p>
      </>
    );
  }
  
  return (<><p>Pick a card!</p></>);
    
}