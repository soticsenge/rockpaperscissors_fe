import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {SocketIoConfig, SocketIoModule} from 'ngx-socket-io';
import {MessageService} from './socket.service';
import {RpsInboxComponent} from './rps-inbox/rps-inbox.component';

const config: SocketIoConfig = { url: 'http://127.0.0.1:8080/events/', options: { path: '', query: {} } };


@NgModule({
  declarations: [
    AppComponent,
    RpsInboxComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SocketIoModule.forRoot(config)
  ],
  providers: [MessageService],
  bootstrap: [AppComponent]
})
export class AppModule { }
