import { DisconnectReason } from "@adiwajshing/baileys";
import terminal from "./monitor/terminal";
import response from "./response";
import { Boom } from "@hapi/boom";
import Core from "./Core/controllers/AppController";
import AppController from "./Core/controllers/AppController";

class WhatsappAdapter {
  core: AppController;
  callback = [];
  status = "QRCODE";
  static core: any;
  async init(token = null, callback: null | Function = null) {
    this.core =
      token && token in global.wa_sessions
        ? global.wa_sessions[token]
        : await this.register(token, callback);
    return this;
  }
  listeners: Function[] = [];
  addListeners(fn: Function) {
    this.listeners.push(fn);
  }
  dispatch(event: Object) {
    this.listeners.forEach((fn) => fn(event));
  }
  async isValidCreds() {
    return await this.core.isValidCreds();
  }
  async Ready() {
    return await this.core.Ready();
  }
  async send(to, message, image: any = null) {
    let msg: any = {};
    if (!image) msg.text = message;
    if (image) msg.image = image;
    if (image) msg.caption = message;
    let x = await this.core.isValidCreds();
    if ((await this.isValidCreds()) === false) {
      return false;
    }
    await this.Ready();
    await this.core.sock.sendMessage(to, msg);
    return true;
  }

  async register(token, callback: Function | null = null) {
    this.core = new Core();
    await this.core.Auth(token);
    this.core.event("connection.update", async (update) => {
      const { connection, lastDisconnect } = update;
      // console.log("connection: ");
      // console.log(JSON.stringify(update));
      callback?.(update);

      if (update.qr!) {
        // need to register by QRCODE
        this.core.setCredsStatus(false); // invalid credentials
      }
      if (connection === "close") {
        const shouldReconnect =
          (lastDisconnect.error as Boom)?.output?.statusCode !==
          DisconnectReason.loggedOut;
        // console.log(
        //   "connection closed due to ",
        //   lastDisconnect.error,
        //   ", reconnecting ",
        //   shouldReconnect
        // );
        if (!this.core.ableToReconnect) return;
        if (shouldReconnect) {
          await this.core.reconnect();
        } else {
          this.core.setCredsStatus(false); // not valid credentials
          // await this.disconnect();
          // await this.reconnect();
        }
      } else if (connection === "open") {
        this.core.setCredsStatus(true); // not valid credentials
        this.core.ready = true; // connection is open
        global.wa_sessions[token] = this.core;
        // console.log("opened connection");
      }
    });
    return this.core;
  }
  async close() {
    this.core.ableToReconnect = false;
    this.core.sock.ws.close();
  }

  clear() {
    this.core.clear();
  }
}

export default WhatsappAdapter;
