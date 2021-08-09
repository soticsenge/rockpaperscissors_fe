import {Component, OnInit} from '@angular/core';
import {MessageService} from '../socket.service';

export type Response = {
  messageType: string;
};

export type GameRequestResponse = {
  gameId: string;
} & Response;

export type GameResultResponse = {
  winner: string;
  moves: { [index: string]: string }
} & Response;

@Component({
  selector: 'app-rps-inbox',
  templateUrl: './rps-inbox.component.html',
  styleUrls: ['./rps-inbox.component.scss']
})

export class RpsInboxComponent implements OnInit {
  socketService: MessageService;
  playerId = '';
  gameIdInput = '';
  gameId: string;
  messages: string[] = [];
  createdOrJoinedGame = false;
  joinInProgress = false;

  constructor(socket: MessageService) {
    this.socketService = socket;
  }

  ngOnInit(): void {
    this.socketService.incomingMessageHandler.subscribe({
      next: (msg) => {
        switch ((msg as Response).messageType) {
          case 'createGameResponse':
            this.messages = [...this.messages, 'Game has been set up successfully. Join with code: ' + msg.gameId];
            this.messages = [...this.messages, 'Please select your next move'];
            this.gameId = (msg as GameRequestResponse).gameId;
            this.playerId = 'player1' + '_' + this.gameId;
            console.log(this.messages);
            break;
          case 'gameResult':
            this.messages = [...this.messages,
              'Other player\'s choice: ' +
              JSON.stringify(msg.moves[(this.playerId.startsWith('player1') ? 'player2_' : 'player1_') + this.gameId])];
            if (msg.winner === this.playerId) {
              this.messages = [...this.messages, 'Congratulations, you won!'];
            } else if (msg.winner === 'draw') {
              this.messages = [...this.messages, 'It\'s a draw'];
            } else {
              this.messages = [...this.messages, 'You lost this game, maybe next time.'];
            }
            break;
          default:
            this.messages = [...this.messages, JSON.stringify(msg)];
            break;
        }
      }
    });
  }

  setPlayerId(event: any) {
    this.playerId = event.target.value;
  }

  setGameId(event: any) {
    this.gameIdInput = event.target.value;
  }

  SendMessage(message: string) {
    let moveReadable;
    switch (message) {
      case 'R': {
        moveReadable = 'Rock';
        break;
      }
      case 'P': {
        moveReadable = 'Paper';
        break;
      }
      case 'S': {
        moveReadable = 'Scissors';
        break;
      }
    }
    this.messages = [...this.messages, 'Your move: ' + moveReadable];
    this.socketService.send(JSON.stringify({
      messageType: 'gameMoveRequest',
      movement: message,
      playerId: this.playerId,
      gameId: this.gameId
    }));
  }

  CreateGame() {
    this.createdOrJoinedGame = true;
    this.socketService.send(JSON.stringify({messageType: 'createGameRequest'}));
  }

  OnJoinButton() {
    this.joinInProgress = true;
  }

  CancelJoin() {
    this.joinInProgress = false;
  }

  JoinGame() {
    this.createdOrJoinedGame = true;
    this.messages = [...this.messages, 'Joined to game. Please select your next move.'];
    this.gameId = this.gameIdInput;
    this.playerId = 'player2' + '_' + this.gameId;
  }
}
