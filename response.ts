const response = {
  qrcode: (qr) => ({
    success: true,
    description: "please, scan qrcode",
    qrcode: qr,
  }),
  open: {
    success: true,
    description:
      "You are already registered, and your INSTANCE SERVER is online.",
  },
  online: {
    success: true,
    description: "your INSTANCE SERVER already online.",
  },
  close: {
    success: false,
    description: "You",
  },
  inValidCreds: {
    success: false,
    description: "please, re-register your credentials",
  },
  Require_token: {
    success: false,
    description: "ERROR-001: require token.",
    code: "ERROR-001",
  },
  Require_to: {
    success: false,
    description: "ERROR-002: require photo that message go to it {to}.",
    code: "ERROR-002",
  },
  Require_message: {
    success: false,
    description: "ERROR-003: require message.",
    code: "ERROR-003",
  },
  Require_image: {
    success: false,
    description: "ERROR-001: require image url.",
    code: "ERROR-004",
  },
  sent: {
    success: true,
    description: "sent.",
  },
};

export default response;
