import {MockBroker} from "./mock_broker";
import {assert} from "chai";
import {TestRootNode} from "./responder_nodes";
import {shouldHappen, sleep} from "./test_util";
import {ValueUpdate} from "../src/common/value";
import {Logger, logger} from "../src/utils/logger";
import {HttpClientLink} from "../src/http/client_link";
import {Requester} from "../src/requester/requester";

describe('subscribe', function () {
  let broker = new MockBroker();
  logger.setLevel(Logger.ERROR | Logger.WARN, false);

  after(() => {
    broker.destroy();
  });

  let rootNode = new TestRootNode();
  let requesterClient: HttpClientLink;
  let responderClient: HttpClientLink;
  let requester: Requester;

  beforeEach(async () => {
    rootNode = new TestRootNode();
    requesterClient = await broker.createRequester();
    responderClient = await broker.createResponder(rootNode);
    requester = requesterClient.requester;
  });
  afterEach(() => {
    requesterClient.close();
    responderClient.close();
  });

  it('subscribe', async function () {
    let updates: any[] = [];
    requester.subscribe('/val', (update: ValueUpdate) => {
      updates.push(update.value);
    });
    await shouldHappen(() => updates[0] === 123);
    rootNode.val.setValue(456);
    await shouldHappen(() => updates[1] === 456);
    rootNode.val.setValue(null);
    await shouldHappen(() => updates[2] === null);
  });

  it('subscribeOnce', async function () {
    assert.equal((await requester.subscribeOnce('/val')).value, 123);
    await sleep();
    assert.equal(requester._subscription.subscriptions.size, 0); // everything should be unsubscribed
  });
});
