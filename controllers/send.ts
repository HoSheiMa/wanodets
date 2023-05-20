import { z } from "zod";
import Core from "../Core/controllers/AppController";
import WhatsappAdapter from "../Whatsapp";
import response from "../response";
import register from "./register";
import ora from "ora";
import cliSpinners from "cli-spinners";

const send = async (req, res) => {
  const _token = z.string().min(11).max(64);
  const _to = z.string().min(11).max(35);
  const _message = z.string().min(1).max(160);
  const token = req.body.token;
  const to = req.body.to;
  const message = req.body.message;

  if (!token || _token.safeParse(token).success == false) {
    return res.send(response.Require_token);
  }

  if (!to || _to.safeParse(to).success == false) {
    return res.send(response.Require_to);
  }

  if (!message || _message.safeParse(message).success == false) {
    return res.send(response.Require_message);
  }
  // init core, auth, adapter
  const wa = await new WhatsappAdapter().init(token);

  // sending
  let status = await wa.send(to, message);

  if (status == false) {
    return res.send(response.inValidCreds);
  }

  // response
  res.send(response.sent);
};

export default send;
