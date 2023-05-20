// @ts-nocheck
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
import { Boom } from "@hapi/boom";
import makeWASocket, {
  AnyMessageContent,
  delay,
  DisconnectReason,
  BufferJSON,
  fetchLatestBaileysVersion,
  isJidBroadcast,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
} from "@adiwajshing/baileys";
import Auth from "../auth";
import MAIN_LOGGER from "@adiwajshing/baileys/lib/Utils/logger";
import Cache from "file-system-cache";
import Database from "../database";
const Options = {
  database: Database(),
};
const logger = MAIN_LOGGER.child({});
logger.level = "silent";
class Core {
  sock;
  ready = false;
  validCreds = null;
  ableToReconnect = true;
  saveCreds;
  myCache;
  token;
  events = [
    {
      event: "connection.update",
      fn: async (update) => {
        const { connection, lastDisconnect } = update;
        // console.log("connection: ");
        // console.log(JSON.stringify(update));

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
          if (!this.ableToReconnect) return;
          if (shouldReconnect) {
            await this.reconnect();
          } else {
            // resend qrcode to make reconnect
            await this.disconnect();
            await this.reconnect();
          }
        } else if (connection === "open") {
          this.ready = true; // connection is open
          // console.log("opened connection");
        }
      },
    },
    {
      event: "creds.update",
      fn: async () => {
        // console.log("save creds", app);
        // console.log("updated creds");
        await this.saveCreds();
      },
    },
  ]; // have default events functions to be ready to go
  options = Options;
  constructor() {
    this.myCache = Cache({
      basePath: "../.creds", // Optional. Path where cache files are stored (default).
      ns: "creds", // Optional. A grouping namespace for items.
    });
  }
  setCredsStatus(status) {
    this.validCreds = status;
  }
  async isValidCreds() {
    return await new Promise((resolve, reject) => {
      let c = setInterval(() => {
        if (this.validCreds == true) {
          clearInterval(c);
          return resolve(true);
        } else if (this.validCreds == false) {
          clearInterval(c);
          return resolve(false);
        } else {
          // creds status not defined yet. loop
        }
      }, 100);
    });
  }
  async Ready() {
    await new Promise((resolve, reject) => {
      let c = setInterval(() => {
        if (this.ready) {
          clearInterval(c);
          return resolve(true);
        }
      }, 100);
    });
  }
  async getCreds(token, creds, options = Options) {
    if (creds) return creds;
    if (!this.options.database) return null;
    let db = this.options.database;
    let database_creds = await db.Keys.findOne({
      where: {
        key: token + "-" + "creds",
      },
    });
    if (!database_creds) return null;
    database_creds = JSON.parse(
      JSON.parse(database_creds["value"], BufferJSON.reviver),
      BufferJSON.reviver
    );
    return database_creds;
  }
  async Auth(token, creds = null, options = Options) {
    this.token = token;
    creds = await this.getCreds(token, creds);
    // console.log("reconnecting", this.creds, this.options, options);

    // console.log("creds/  : ", creds);
    const { state, saveCreds } = await Auth(token, creds, options);
    // const { state, saveCreds } = await useMultiFileAuthState(
    //   "baileys_auth_info"
    // );

    // fetch latest version of WA Web
    const { version, isLatest } = await fetchLatestBaileysVersion();
    // console.log(`using WA v${version.join(".")}, isLatest: ${isLatest}`);
    const sock = makeWASocket({
      logger,
      version,
      printQRInTerminal: true,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
      },
      generateHighQualityLinkPreview: true,
    });
    this.sock = sock;
    this.creds = state.creds;
    this.saveCreds = saveCreds;
    this.options = options;
    this.events.map(({ event, fn }) => this.sock.ev.on(event, fn));

    return this;
  }
  async sendMessage(to, message) {
    return await this.sock.sendMessage(to, message);
  }
  sendMessageWTyping = async (msg: AnyMessageContent, jid: string) => {
    await this.sock.presenceSubscribe(jid);
    await delay(500);

    await this.sock.sendPresenceUpdate("composing", jid);
    await delay(2000);

    await this.sock.sendPresenceUpdate("paused", jid);

    await this.sendMessage(jid, msg);
    return this;
  };
  event(event, fn) {
    this.events.push({ event, fn });
    this.sock.ev.on(event, fn);
    return this;
  }
  reset() {
    return this;
  }
  clear() {
    this.events.map(({ event, fn }) => this.event(event, () => {}));
  }
  async reconnect() {
    // console.log("reconnecting!!!!");
    await this.Auth(this.token, this.creds, this.options);
    this.events.map(({ event, fn }) => this.event(event, fn));
  }
  async disconnect() {
    // console.log("disconnecting!!!!");
    this.creds = null;
    await this.options.database.Keys.destroy({
      where: {
        key: {
          [Op.like]: this.token + "%",
        },
      },
    });

    return this;
  }
}

export default Core;
