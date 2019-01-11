import React from 'react';
import ReactDOM from 'react-dom';

import sortAsc from './sort-asc.svg';
import sortDesc from './sort-desc.svg';
import './index.css';

function Square(props) {
  return (
    <button className={'square' + props.winner} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    const { winningSquares } = this.props;
    const winner = winningSquares && winningSquares.squares.includes(i);

    return (
      <Square
        key={`square${i}`}
        winner={winner ? '-winner' : ''}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  renderSquares(row) {
    const rows = [[0, 1, 2], [3, 4, 5], [6, 7, 8]];
    const squares = rows[row].map(square => this.renderSquare(square));

    return (
      <div key={`row${row}`} className="board-row">
        {squares}
      </div>
    );
  }

  renderRows() {
    let renderedRows = [];
    for (let j = 0; j < 3; j++) {
      renderedRows.push(this.renderSquares(j));
    }
    return renderedRows;
  }

  render() {
    return <div>{this.renderRows()}</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
        },
      ],
      ascSortOrder: true,
      stepNumber: 0,
      xIsNext: true,
    };
  }

  handleSortClick() {
    this.setState({
      ascSortOrder: !this.state.ascSortOrder,
    });
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([
        {
          squares: squares,
        },
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    if (step === 0) {
      this.setState({
        history: [
          {
            squares: Array(9).fill(null),
          },
        ],
        stepNumber: step,
        xIsNext: step % 2 === 0,
      });
    } else {
      this.setState({
        stepNumber: step,
        xIsNext: step % 2 === 0,
      });
    }
  }

  getLocation(lastStep, currentStep) {
    const columns = [[0, 3, 6], [1, 4, 7], [2, 5, 8]];
    for (let i = 0; i < currentStep.length; i++) {
      if (currentStep[i] !== lastStep[i]) {
        let col = 0;
        for (let j = 0; j < columns.length; j++) {
          if (columns[j].includes(i)) {
            col = j + 1;
            break;
          }
        }
        const row = Math.floor(i / 3) + 1;
        return `(${col}, ${row})`;
      }
    }
  }

  renderMoveList(history) {
    const indices = history.map((el, i) => i);

    if (!this.state.ascSortOrder) {
      indices.sort((a, b) => b - a);
    }

    const last = indices.length - 1;

    return indices.map(index => {
      let desc = 'Go to game start';
      if (index) {
        const currentStep = history[index];
        const lastStep = history[index - 1];
        desc = `Go to move #${index} ${this.getLocation(
          lastStep.squares,
          currentStep.squares
        )}`;
      }

      return (
        <li key={index}>
          <button
            className={index === last ? 'game-button bold' : 'game-button'}
            onClick={() => this.jumpTo(index)}
          >
            {desc}
          </button>
        </li>
      );
    });
  }

  renderSortButton() {
    const image = () =>
      this.state.ascSortOrder ? (
        <img alt="desc" src={sortDesc} width="15px" />
      ) : (
        <img alt="asc" src={sortAsc} width="15px" />
      );

    return (
      <button className="game-button" onClick={() => this.handleSortClick()}>
        {image()}
      </button>
    );
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
    const moves = this.renderMoveList(history);

    let status;
    if (winner) {
      status = 'Winner: ' + winner.player;
    } else if (!current.squares.includes(null)) {
      status = 'Game is a draw';
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            winningSquares={winner}
            onClick={i => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>
            <div className={winner ? 'bold' : ''}>{status}</div>
            <div className="sort">Sort:&nbsp;{this.renderSortButton()}</div>
          </div>
          <div className="moves">
            Moves:
            <ol className="move-list">{moves}</ol>
          </div>
        </div>
      </div>
    );
  }
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { player: squares[a], squares: lines[i] };
    }
  }
  return null;
}

// ========================================

ReactDOM.render(<Game />, document.getElementById('root'));
