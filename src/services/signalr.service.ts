// services/signalr.service.ts
import * as signalR from '@microsoft/signalr';

class SignalRService {
    private connection: signalR.HubConnection | null = null;

    async startConnection() {
        if (this.connection) return;

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:1212/notificationHub") // Your SignalR hub URL
            .withAutomaticReconnect()
            .build();

        try {
            await this.connection.start();
            console.log("SignalR Connected");
        } catch (err) {
            console.error("SignalR Connection Failed:", err);
        }
    }

    async stopConnection() {
        if (this.connection) {
            await this.connection.stop();
            this.connection = null;
        }
    }
}

export const signalRService = new SignalRService();