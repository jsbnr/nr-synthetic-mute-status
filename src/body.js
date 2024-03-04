


got = require('got')

RUNNING_LOCALLY=false;
const IS_LOCAL_ENV = typeof $http === 'undefined';
if (IS_LOCAL_ENV) {  
  RUNNING_LOCALLY=true
  var $http=require('got');
  console.log("Running in local mode")
} 

let assert = require('assert');

/*
* setAttribute()
* Sets a custom attribute on the synthetic record
*
* @param {string} key               - the key name
* @param {Strin|Object} value       - the value to set
*/
const setAttribute = function(key,value) {
  if(!RUNNING_LOCALLY) { //these only make sense when running on a minion
      $util.insights.set(key,value);
  } else {
      console.log(`Set attribute '${key}' to ${value}`);
  }
}

/*
* queryMutingStatus()
* Gathers the muting rules status from graphql endpoint.
*/
async function queryMutingStatus(ACCOUNT_ID, REGION, QUERY_KEY) {
  
    const GRAPHQL_URL= REGION=="US" ? "https://api.newrelic.com/graphql" : "https://api.eu.newrelic.com/graphql"

    const gqlQuery = async (query, variables) => {
      const options =  {
          method: 'POST',
          headers :{
            "Content-Type": "application/json",
            "API-Key": QUERY_KEY
          },
          body: JSON.stringify({ "query": query, "variables": variables })
      };
    
      let jsonBody = await got(GRAPHQL_URL, options).json();
      //check for gql errors
      if(jsonBody.errors && jsonBody.errors.length > 0) {
        console.log("!! GQL Query error detected:",jsonBody.errors);
      }
      return jsonBody;
    };

    const GQL_gatherMutingRules=`query ($accountId:Int!){ actor { account(id: $accountId) { alerts { mutingRules { id name status enabled } } } } }`;
    const GQL_gatherMutingRules_variables={ "accountId": parseInt(ACCOUNT_ID) };
    const mutingStatus=await gqlQuery(GQL_gatherMutingRules,GQL_gatherMutingRules_variables);
    return mutingStatus?.data?.actor?.account?.alerts?.mutingRules;
}


/*
* determineMuteStatus()
* Determines a single definitive mute status for this run from the current muting data.
* Muting ruleNames are tested using regex. 
*/
const determineMuteStatus = (ruleNames,mutingRules) => {
  let status="NOTMUTED";
  mutingRules.forEach((mutingRule)=>{
      if(status!== "MUTED" && mutingRule.enabled === true && mutingRule.status==="ACTIVE") {
        ruleNames.forEach((ruleNameRegex)=>{
          if(mutingRule?.name.match(ruleNameRegex)) {
            status="MUTED";
            console.log(`Mute rule matched and active '${mutingRule.name}'`);
          }
        });
    }
  });
  console.log("Setting mute status to", status);
  setAttribute("muteStatus",status);
}

/*
* grabMutingStatus()
* Lookup and determine mute status from API's
*/
const grabMutingStatus = async () => {
  try {
        //Record the config used by this monitor so that it can be queried with NRQL for diagnosis
        if(typeof $util !=='undefined') {
          $util.insights.set("mutingRule",RULE_NAMES.toString());
        }
      
      let mutingRules = await queryMutingStatus(ACCOUNT_ID, DATACENTER, USER_KEY) ;
      determineMuteStatus(RULE_NAMES,mutingRules);
  } catch (error) {
      console.log("Config grab failed:",error);
      setAttribute("grabconfig","failed");
      setAttribute("grabconfigfailedmessage",e.message);
  }
}


// Try and determine mute status, continue if failed
grabMutingStatus().then(function() {
  setAttribute("grabMuteStatus","true")
  runScript();
})
.catch(e => {
  console.log("Failed to obtain mute status.")
  setAttribute("muteStatus","UNKNOWN");
  runScript();
});



// - customer code here 

