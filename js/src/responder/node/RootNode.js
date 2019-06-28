"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_local_node_1 = require("../base_local_node");
const node_state_1 = require("../node_state");
class RootNode extends base_local_node_1.BaseLocalNode {
    constructor(data) {
        super('/', new node_state_1.NodeProvider());
        this.provider.setRoot(this);
        if (data) {
            this.load(data);
        }
    }
}
exports.RootNode = RootNode;
//# sourceMappingURL=RootNode.js.map