const {NodeProvider} = require("../../js/src/responder/node_state");
const {Permission} = require("../../js/src/common/permission");

const {BaseLocalNode} = require("../../js/src/responder/base_local_node");
const {HttpClientLink: DSLink, RootNode, ValueNode, ActionNode} = require("../../js/src/http/client_link");
const {PrivateKey} = require("../../js/src/crypto/pk");


async function main() {
  let key = PrivateKey.loadFromString('M6S41GAL0gH0I97Hhy7A2-icf8dHnxXPmYIRwem03HE');
  let link = new DSLink('http://localhost:8080/conn', 'test-', key, {
    isRequester: true,
    format: 'json'
  });
  await link.connect();
  console.log('connected');

  let {requester} = link;

  console.log(await requester.subscribeOnce('/sys/dataOutPerSecond'));

  console.log(
    (await requester.listOnce('/sys'))
      .children.size
  );

  console.log(
    (await requester.invokeOnce('/sys/get_server_log', {lines: 5}))
      .result.log
  );
}

main();