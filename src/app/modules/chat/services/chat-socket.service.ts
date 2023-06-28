import { Socket, SocketIoConfig } from "ngx-socket-io";
import { environment } from "../../../../environments/environment";

export class ChatSocketService extends Socket {
  constructor(private accessToken: string) {
    const config: SocketIoConfig = {
      url: environment.socketUrl,
      options: {
        transports: ["websocket"],

        //    extraHeaders: {
        //           Authorization: `Bearer ${accessToken || ""}` // Include the token in the headers
        //         }

        query: {
          Authorization: accessToken || null
        }
      }
    };
    super(config);
  }
}
