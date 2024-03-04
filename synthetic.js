// Start config

const RULE_NAMES=["Your-Mute-Rule-Name-Here"]; // List of rule names (regex supported!)
const ACCOUNT_ID=1234567;   // Your account ID to lookup mute status
const DATACENTER="US";      // Your account data center (US/EU)
const USER_KEY="NRAK-xxxx"; // Your (User) API key PLEASE USE A SECURE CREDENTIAL!

// For more details about using secure credentials see: https://docs.newrelic.com/docs/synthetics/synthetic-monitoring/using-monitors/store-secure-credentials-scripted-browsers-api-tests/
//e.g. const USER_KEY=$secure.YOUR_SECURE_CRED;

// --- End config ---
got=require("got"),RUNNING_LOCALLY=!1;const IS_LOCAL_ENV=void 0===$http;var $http;IS_LOCAL_ENV&&(RUNNING_LOCALLY=!0,$http=require("got"),console.log("Running in local mode"));let assert=require("assert");const setAttribute=function(t,e){RUNNING_LOCALLY?console.log(`Set attribute '${t}' to `+e):$util.insights.set(t,e)};async function queryMutingStatus(t,e,a){const n="US"==e?"https://api.newrelic.com/graphql":"https://api.eu.newrelic.com/graphql";return(await(async(t,e)=>{t={method:"POST",headers:{"Content-Type":"application/json","API-Key":a},body:JSON.stringify({query:t,variables:e})},e=await got(n,t).json();return e.errors&&0<e.errors.length&&console.log("!! GQL Query error detected:",e.errors),e})("query ($accountId:Int!){ actor { account(id: $accountId) { alerts { mutingRules { id name status enabled } } } } }",{accountId:parseInt(t)}))?.data?.actor?.account?.alerts?.mutingRules}const determineMuteStatus=(t,e)=>{let a="NOTMUTED";e.forEach(e=>{"MUTED"!==a&&!0===e.enabled&&"ACTIVE"===e.status&&t.forEach(t=>{e?.name.match(t)&&(a="MUTED",console.log(`Mute rule matched and active '${e.name}'`))})}),console.log("Setting mute status to",a),setAttribute("muteStatus",a)},grabMutingStatus=async()=>{try{"undefined"!=typeof $util&&$util.insights.set("mutingRule",RULE_NAMES.toString());var t=await queryMutingStatus(ACCOUNT_ID,DATACENTER,USER_KEY);determineMuteStatus(RULE_NAMES,t)}catch(t){console.log("Config grab failed:",t),setAttribute("grabconfig","failed"),setAttribute("grabconfigfailedmessage",e.message)}};grabMutingStatus().then(function(){setAttribute("grabMuteStatus","true"),runScript()}).catch(t=>{console.log("Failed to obtain mute status."),setAttribute("muteStatus","UNKNOWN"),runScript()});

// --- Runtime code --
async function runScript()  {
    // Add your runtime code here!

    // Simple example
    let response = await got.get('https://www.newrelic.com');
    assert.ok(response.statusCode == 200, 'Expected 200 OK response'); 
}
  
