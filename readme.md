# Synthetic mute status lookup
This wrapper script for New Relic scripted API monitors allows you to lookup the mute status for an alert muting rule(s) and record as a custom attribute. This enables you know the mute status derived at the time of the monitor run.

Use case: Record the mute status of a synhtetic check at runtime to be able to calculate availability whilst both muted and non muted.

Note: Only the scheduling of muting rules is taken into account, further entity filtering by the muting rule does not affect status.

## Operation overview
The script makes an API call to the New Relic graphQL API to gather the current mute rule statue. This is then fitlered by the configured list of of mute rules to take into account only the rules of interest. The mute status is recored in the custom attribute `muteStatus` which can be queried on the `SyntheticCheck` event type via NRQL. Possible values for this are: `NOTMUTED`, `MUTED` and `UNKNOWN`. (The `UNKNOWN` value is recorded if the lookup for the mute status fails, the user script should continue to run even if this lookup fails.)

## Setup
1. Create a new "Endpoint availability" (scripted API) monitor
2. Paste in the content of the [`synthetic.js`](synthetic.js) file.
3. Update the configuration items in the head of the script appropriately:
    - RULE_NAMES: This is an array of muting rule names. Rules that match these list will be considered, if any rule is currently muted then the monitor status will be set to MUTED. These names are proceseed as regular expressions, allows standard jsvascript regex patters to be used to taarget mutliple rules more easily.
    - ACCOUNT_ID:  This is the account ID in which the muting rules are found
    - DATACENTER: This is the data center the above acocunt is located, wither US or EU.
    - USERK_KEY: The user API key for gathering the mute status from the graphQL API. We advise using a [secure credential](https://docs.newrelic.com/docs/synthetics/synthetic-monitoring/using-monitors/store-secure-credentials-scripted-browsers-api-tests/) to pass the key. The User API key requires permissions to read muting rules.
4. Update the `runScript()` function with your code. This function is run once the mute status has been derived.
