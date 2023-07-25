import React from 'react';
export default function Rules() {

  return (
    <>
      <h5>Gameplay</h5>
      <p>
              Each round, one player is designated the storyteller. 
              
              That player chooses a card from their hand
              and enters a clue word or phrase to help other players pick the card they selected.
      </p>

      <p>
              The storyteller wants to enter a clue specific enough that at least one player guesses their card but
              vague enough that not everyone guesses their card.
      </p>
            
      <p>
              Every other player then picks a card from their hand in an attempt to fool
              other players into picking their card instead of the storyteller&apos;s.
      </p>
      <p><em>Note: In a 3-player game, non-storytellers submit two cards each.</em></p>

      <p>
              Once all non-storyteller players have submitted a card, they get to view the cards all other players submitted.
              They then guess which card the storyteller submitted.
      </p>
      <h5>Scoring</h5> 
      <p>If all other players guess the storyteller&apos;s card, the storyteller gets 0 points and all other players get 2 points.</p>
      <p>If no other players guess the storyteller&apos;s card, the storyteller gets 0 points and all other players get 2 points.</p>
      <p>If at least one player but not every player guesses the storyteller&apos;s card, the storyteller and players who guessed correctly get 3 points.</p>
      <p>If a non-storyteller fools another player into guessing their card, they get an additional point per player fooled.</p>
    </>
  );
}