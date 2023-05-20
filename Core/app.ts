import Core from "./controllers/AppController";
let token = "Q1QWEQWRQWEWQ123124EDDWEWEWERFWEF";
const CoreApp = async () => {
  const app = new Core();
  await app.Auth(token);
  app.event("messages.upsert", async (m) => {
    console.dir(m);
    console.log("replying to", m.messages[0].key.remoteJid);
    // await app.sendMessage(m.messages[0].key.remoteJid!, {
    //   text: "Hello from bahaa!",
    // });
  });
};

CoreApp();
