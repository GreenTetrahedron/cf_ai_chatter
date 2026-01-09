import { Injectable, isDevMode } from "@angular/core";

@Injectable({
    providedIn: 'root'
})

export class LogService {
    public log(message: any) {
        if (!isDevMode())
            return;

        console.log("Log: ", message);
    }

    public error(message: any) {
        if (!isDevMode())
            return;

        console.error("Error: ", message)
    }

    public warn(message: any) {
        if (!isDevMode())
            return;

        console.warn("Warn: ", message);
    }
}