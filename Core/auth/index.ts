import {
  AuthenticationCreds,
  BufferJSON,
  decodeBinaryNode,
  initAuthCreds,
  SignalKeyStore,
} from "@adiwajshing/baileys";
const { proto } = require("@adiwajshing/baileys/WAProto");
import AppController from "../controllers/AppController";
// @ts-nocheck
const response = async (token, creds, options) => {
  const db: { Keys } = options.database;
  const writeData = async (data, key) => {
    // console.log("write ::", key);
    await removeData(key);
    key = token + "-" + key;
    await db.Keys.create({
      key: key,
      value: JSON.stringify(data, BufferJSON.replacer),
    });
  };
  const readData = async (key) => {
    // console.log("read ::", key);
    key = token + "-" + key;
    let k = await db.Keys.findOne({
      where: {
        key: key,
      },
    });
    // console.log("readed ::");
    // console.log(
    //   "type: ",
    //   k
    //     ? JSON.parse(
    //         JSON.parse(k["value"], BufferJSON.reviver),
    //         BufferJSON.reviver
    //       )
    //     : null
    // );

    return k
      ? JSON.parse(
          JSON.parse(k["value"], BufferJSON.reviver),
          BufferJSON.reviver
        )
      : null;
  };
  const removeData = async (key) => {
    // console.log("remove ::", key);
    key = token + "-" + key;
    await db.Keys.destroy({
      where: {
        key: key,
      },
    });
  };

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data = {};
          await Promise.all(
            ids.map(async (id) => {
              let value = await readData(`${type}-${id}`);
              if (type === "app-state-sync-key" && value) {
                value = proto.Message.AppStateSyncKeyData.fromObject(value);
              }
              data[id] = value;
            })
          );
          return data;
        },
        set: async (data) => {
          let tasks: Promise<void>[] = [];
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id];
              const file = `${category}-${id}`;
              tasks.push(value ? writeData(value, file) : removeData(file));
            }
          }
          await Promise.all(tasks);
        },
      },
    },
    saveCreds: async () => {
      if (options.database) {
        await writeData(creds, "creds");
      }
      return async () => {};
    },
  };
};
const Auth = async (
  token,
  creds: null | AuthenticationCreds = null,
  options
) => {
  if (!creds) {
    creds = initAuthCreds();
  }

  return response(token, creds, options);
};
export default Auth;
function decodeMessageNode(value: any): any {
  throw new Error("Function not implemented.");
}
