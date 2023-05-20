import cliSpinners from "cli-spinners";
import ora from "ora";

class terminal {
  listeners = {};
  addListener(key, message) {
    this.listeners[key] = ora({ spinner: cliSpinners.moon }).start(message);
  }
  update(key, message) {
    this.listeners[key].text = message;
  }
}
export default terminal;
