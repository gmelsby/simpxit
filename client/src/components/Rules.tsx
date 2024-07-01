import React, {useState} from 'react';
import { Row, Col, Tab, Tabs } from 'react-bootstrap';
export default function Rules() {

  const [tabKey, setTabKey] = useState('gameplay');

  return (
    <Tabs activeKey={tabKey} onSelect={key => key !== null && setTabKey(key)} className='mb-2'>
      <Tab eventKey={'gameplay'} title="Gameplay">
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

      </Tab>
      <Tab eventKey={'scoring'} title="Scoring">
        <p>Points are earned at the end of each round based on these conditons:</p>
        <ScoringCase title='Player X guesses a card submitted by a non-storyteller player Y' 
          agents={[
            {agent: 'X', score: 0},
            {agent: 'Y', score: 1},
          ]}
        />
        <ScoringCase title='Everyone guesses the storyteller&apos;s card' 
          agents={[
            {agent: 'Storyteller', score: 0},
            {agent: 'Other players', score: 2},
          ]}
        />
        <ScoringCase title='No one guesses the storyteller&apos;s card' 
          agents={[
            {agent: 'Storyteller', score: 0},
            {agent: 'Other players', score: 2},
          ]}
        />
        <ScoringCase title='At least one player but not everyone guesses the storyteller&apos;s card' 
          agents={[
            {agent: 'Storyteller', score: 3},
            {agent: 'Players who guessed correctly', score: 3},
          ]}
        />
        <p>The game ends when a player&apos;s score is greater than or equal to the target score.</p>
      </Tab>
    </Tabs>
  );
}

const ScoringCase = ({title, agents}: {title: string, agents: {agent: string, score: number}[]}) => {
  return (
    <div className='mb-4'>
      <Row><h6><b>{title}</b></h6></Row>
      {agents.map(({agent, score}, i) => {
        return (
          <Row key={i}>
            <Col xs={8}>{agent}</Col>
            <Col xs={4} className='text-center d-flex flex-column justify-content-center'>+ {score}</Col>
          </Row>
        );
      })}
    </div>
  );
};