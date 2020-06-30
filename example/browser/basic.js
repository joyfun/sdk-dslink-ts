// const {DSLink} = require('dslink/js/web');
const {DSLink} = require('../../js/web');
const {PrivateKey}=require('../../js/src/crypto/pk')
import axios from 'axios';

async function main(data) {
    let dsId = data.dsId;
    let auth =  data.auth;
    let url='ws://localhost:8080/ws?auth='+auth+'&dsId='+dsId;
    console.log(url);
    let link = new DSLink(url, 'json');
  

    link.connect();

    let {requester} = link;

    console.log(await requester.subscribeOnce('/sys/dataOutPerSecond'));

    console.log(
        (await requester.listOnce('/sys'))
            .children
    );

    console.log(
        (await requester.invokeOnce('/sys/get_server_log', {lines: 5}))
            .result.log
    );
}
axios.get('http://localhost:8080/jsconn')
  .then(function (response) {
    main(response.data);
  })

//main();
