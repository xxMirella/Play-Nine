import React, { Component } from 'react';
import '../style/game.css'
import range from 'range'

  const Stars = (props) => {
    return (
      <div className="col-5">
        {range.range(props.numberOfStars).map(i =>
          <i key={i} className="fa fa-star"/>
        )}
      </div>
    );
  };

  const Button = (props) => {
    let button;

    switch (props.answerIsCorrect) {
      case true:
        button =
          <button className="btn btn-success"
                  onClick={props.acceptAnswer}>
            <i className="fa fa-check"/>
          </button>;
        break;
      case false:
        button =
          <button className="btn btn-danger">
            <i className="fa fa-times"/>
          </button>;
        break;
      default:
        button =
          <button className="btn"
                  onClick={props.checkAnswer}
                  disabled={props.selectedNumbers.length === 0}>
            =
          </button>;
        break;
    }

    return (
      <div className="col-2 text-center">
        {button}
        <br/><br/>
        <button className="btn btn-warning btn-sm"
                onClick={props.redraw}
                disabled={props.redraws === 0}>
          <i className="fas fa-sync-alt"/>
          &nbsp;&nbsp;{props.redraws}
        </button>
      </div>
    );
  };

  const Answer = (props) => {
    return (
      <div className="col-5">
        {props.selectedNumbers.map((number, i) =>
          <span key={i}
                onClick={() => props.unselectNumber(number)}>
            { number }
          </span>
        )}
      </div>
    );
  };

  const Numbers = (props) => {
    const numberClassName = (number) => {
      if(props.usedNumbers.indexOf(number) >= 0) {
        return 'used'
      }
      if(props.selectedNumbers.indexOf(number) >= 0) {
        return 'selected'
      }
    };

    return (
      <div className="card text-center">
        <div>
          {Numbers.list.map((number, i) =>
            <span key={i}
                  className={numberClassName(number)}
                  onClick={() => props.selectNumber(number)}>
              { number }
            </span>
          )}
        </div>
      </div>
    )
  };

  const DoneFrame = (props) => {
    return (
      <div className="text-center">
        <h2>{props.doneStatus}</h2>
        <button className="btn btn-secondary"
                onClick={props.resetGame}>
          Play Angain
        </button>
      </div>
    )
  };

  const possibleCombinationSum = function(arr, n) {
    if (arr.indexOf(n) >= 0) { return true; }
    if (arr[0] > n) { return false; }
    if (arr[arr.length - 1] > n) {
      arr.pop();
      return possibleCombinationSum(arr, n);
    }
    const listSize = arr.length, combinationsCount = (1 << listSize);
    for (let i = 1; i < combinationsCount ; i++ ) {
      let combinationSum = 0;
      for (let j=0 ; j < listSize ; j++) {
        if (i & (1 << j)) { combinationSum += arr[j]; }
      }
      if (n === combinationSum) { return true; }
    }
    return false;
  };

  Numbers.list = range.range(1, 10);

class Game extends Component {

  static initializeState() {
    return {
      selectedNumbers: [],
      randomNumberOfStarts: Game.randomNumber(),
      answerIsCorrect: null,
      usedNumbers: [],
      redraws: 5,
      doneStatus: null
    }
  }

  static randomNumber() {
    return 1 + Math.floor(Math.random() * 9);
  }

  state = Game.initializeState();

  selectNumber = (clickedNumber)=> {
    if (this.state.selectedNumbers.indexOf(clickedNumber) >= 0) {
      return;
    }
    this.setState(prevState => ({
      answerIsCorrect: null,
      selectedNumbers: prevState.selectedNumbers.concat(clickedNumber)
    }));
  };

  unselectNumber = (clickedNumber) => {
    this.setState(prevState => ({
      answerIsCorrect: null,
      selectedNumbers: prevState.selectedNumbers.filter(number => number !== clickedNumber)
    }));
  };

  checkAnswer = () => {
    this.setState(prevState => ({
      answerIsCorrect: prevState.randomNumberOfStarts ===
        prevState.selectedNumbers.reduce((acc, n) => acc + n, 0)
    }))
  };

  acceptAnswer = () => {
    this.setState(prevState => ({
      usedNumbers: prevState.usedNumbers.concat(prevState.selectedNumbers),
      selectedNumbers: [],
      answerIsCorrect: null,
      randomNumberOfStarts: Game.randomNumber()
    }), this.updateDoneStatus)
  };

  redraw = () => {
    if (this.state.redraws === 0) { return; }

    this.setState(prevState => ({
      randomNumberOfStarts: Game.randomNumber(),
      answerIsCorrect: null,
      selectedNumbers: [],
      redraws: prevState.redraws -1
    }), this.updateDoneStatus);
  };

  possibleSolutions = ({randomNumberOfStars, usedNumbers}) => {
    const possibleNumbers = range.range(1, 10).filter(
      number => usedNumbers.indexOf(number) === -1
    );

    return possibleCombinationSum(possibleNumbers, randomNumberOfStars);
  };

  updateDoneStatus = () => {
    this.setState(prevState => {
      if (prevState.usedNumbers.length === 9) {
        return { doneStatus: 'Done. Nice!' };
      }

      if (prevState.redraws === 0 && !this.possibleSolutions(prevState)) {
        return { doneStatus: 'Game Over!' };
      }
    })
  };

  resetGame = () => this.setState(Game.initializeState());

  render() {

    const {
      randomNumberOfStarts,
      selectedNumbers,
      answerIsCorrect,
      usedNumbers,
      redraws,
      doneStatus
    } = this.state;

    return (
      <div className="container">
        <h3>Play Nine</h3>
        <hr/>
        <div className="row">
          <Stars numberOfStars={randomNumberOfStarts}/>

          <Button selectedNumbers={selectedNumbers}
                  redraws={redraws}
                  checkAnswer={this.checkAnswer}
                  answerIsCorrect={answerIsCorrect}
                  acceptAnswer={this.acceptAnswer}
                  redraw={this.redraw}/>

          <Answer selectedNumbers={selectedNumbers}
                  unselectNumber={this.unselectNumber}/>
        </div>
        <br/>
        {
          doneStatus ?
          <DoneFrame doneStatus={doneStatus}
                     resetGame={this.resetGame}/> :
          <Numbers selectedNumbers={selectedNumbers}
                   selectNumber={this.selectNumber}
                   usedNumbers={usedNumbers}/>
        }

        <br/>

      </div>
    );
  }

}

export default Game;
