import response from "../response";
import { z } from "zod";
import WhatsappAdapter from "../Whatsapp";
const register = async (req, res) => {
  // console.log("wa_sessions", Object(global.wa_sessions).keys().length);

  const _token = z.string().min(11).max(64);
  const token = req.body.token;
  console.log("token", token);

  if (!token || _token.safeParse(token).success == false) {
    return res.send(response.Require_token);
  }

  if (token in global.wa_sessions) {
    return res.send(response.online);
  }
  const callback = (update) => {
    console.log(update);

    if (update.qr!) {
      return res.send(response.qrcode(update.qr));
    }

    // already registered and ready to use
    if (update.connection === "open") {
      return res.send(response.open);
    }
  };

  let wa;
  try {
    wa = await new WhatsappAdapter().init(token, callback);
  } catch (err) {
    return res.send({
      success: false,
      description: "server not available",
    });
  }

  return wa.core;
};

export default register;
