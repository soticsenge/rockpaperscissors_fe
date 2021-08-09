import {Injectable} from '@angular/core';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import {Observable, Subject, timer} from 'rxjs';
import {delayWhen, retryWhen, tap} from 'rxjs/operators';

@Injectable()
export class MessageService {

  private subject: WebSocketSubject<any>;

  incomingMessageHandler: Subject<any> = new Subject<any>();

  constructor() {
    this.connect();
  }

  public connect() {
    this.subject = webSocket({
      url: 'ws://localhost:8080/events',
      openObserver: {
        next: () => {
          console.log('connection ok');
        }
      },
      closeObserver: {
        next: () => {
          console.log('disconnect ok');
        }
      }
    });

    this.subject.pipe(this.reconnect).subscribe(
      msg => {console.log(JSON.stringify((msg))); this.incomingMessageHandler.next(msg); },
      err => console.log(err),
      () => console.log('complete')
    );
  }

  public send(msg: string) {
    this.subject.next(msg);
  }

  public disconnect() {
    this.subject.complete();
  }

  private reconnect(observable: Observable<any>): Observable<any> {
    return observable.pipe(retryWhen(errors => errors.pipe(tap(val => console.log('[Data Service] Try to reconnect', val)),
      delayWhen(_ => timer(2000))))); }
}

