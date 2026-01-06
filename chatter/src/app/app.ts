import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  request = { "message": "Hello, World!" };

  client = inject(HttpClient);

  response: any = signal(null);

  ngOnInit() { 
    console.log(this.request);

    this.client.post("https://test-worker.maniarhamza01.workers.dev/", JSON.stringify(this.request))
      .subscribe(thing => {
        console.log(thing);
        this.response.set(JSON.stringify(thing));
      });
  }
}
