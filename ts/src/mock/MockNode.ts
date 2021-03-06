import {BaseLocalNode} from '../responder/base-local-node';
import {ActionNode} from '../responder/node/action-node';
import {MockActionNode} from './MockAction';
import {NodeProvider} from '../responder/node_state';

function evaluateNodeData(data: {[p: string]: any}): {[p: string]: any} {
  let result: any = {};
  for (let key in data) {
    let value = data[key];
    if (key !== '?value' && typeof value === 'function') {
      result[key] = value();
    } else {
      result[key] = value;
    }
  }
  return result;
}
export class MockNode extends BaseLocalNode {
  static profileName = 'mock';
  static interval: number = 1000;

  setValueTimer: any;

  numRepeat = 0;
  repeat: any;

  shouldSaveConfig(key: string) {
    return true;
  }

  load(data: {[p: string]: any}) {
    super.load(evaluateNodeData(data));
    if (data.hasOwnProperty('?value')) {
      let value = data['?value'];
      if (typeof value === 'function') {
        // change value with a timer
        this.setValue(value());

        this.setValueTimer = setInterval(() => this.setValue(value()), MockNode.interval);
      } else {
        this.setValue(value);
      }
    }
    if (data.hasOwnProperty('?repeat')) {
      this.repeat = data['?repeat'];
      for (let i = 0; i < this.repeat.count; ++i) {
        this.addRepeatNode();
      }
      if (this.repeat.allowAddReduce) {
        this.createChild('add', AddChildAction);
        this.createChild('reduce', ReduceChildAction);
      }
    }
  }

  addRepeatNode() {
    this.loadChild(`${this.repeat.namePrefix}${this.numRepeat}`, this.repeat.data);
    this.numRepeat++;
  }

  reduceRepeatNode() {
    if (this.numRepeat > 0) {
      this.numRepeat--;
      this.removeChild(`${this.repeat.namePrefix}${this.numRepeat}`);
    }
  }

  loadChild(name: string, data: {[key: string]: any}) {
    if (!this.children.has(name)) {
      if (data.hasOwnProperty('$invokable')) {
        let node = this.createChild(name, MockActionNode);
        node.load(data);
      } else {
        let node = this.createChild(name, MockNode);
        node.load(data);
      }
    }
  }

  destroy() {
    if (this.setValueTimer) {
      clearInterval(this.setValueTimer);
    }
    super.destroy();
  }
}

export class RootMockNode extends MockNode {
  constructor(data?: {[key: string]: any}) {
    super('/', new NodeProvider());
    this.provider.setRoot(this);
    if (data) {
      this.load(data);
    }
  }
}

class AddChildAction extends ActionNode {
  onInvoke(params: {[key: string]: any}, parentNode: MockNode) {
    parentNode.addRepeatNode();
  }
}

class ReduceChildAction extends ActionNode {
  onInvoke(params: {[key: string]: any}, parentNode: MockNode) {
    parentNode.reduceRepeatNode();
  }
}
