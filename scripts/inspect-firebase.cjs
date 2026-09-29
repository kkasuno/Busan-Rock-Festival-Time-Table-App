const { getGlobalDefaultAccount } = require("C:/Users/lp_08/AppData/Roaming/npm/node_modules/firebase-tools/lib/auth.js");
const { requireAuth } = require("C:/Users/lp_08/AppData/Roaming/npm/node_modules/firebase-tools/lib/requireAuth.js");
const { Client } = require("C:/Users/lp_08/AppData/Roaming/npm/node_modules/firebase-tools/lib/apiv2.js");
const fs = require("node:fs");
(async () => {
  const options = { project: "koreanlottery25", ...getGlobalDefaultAccount() };
  await requireAuth(options);
  const rules = new Client({ urlPrefix: "https://firebaserules.googleapis.com", apiVersion: "v1" });
  const release = await rules.get("/projects/koreanlottery25/releases/cloud.firestore");
  const source = await rules.get("/" + release.body.rulesetName);
  fs.mkdirSync("firebase-review", { recursive: true });
  fs.writeFileSync("firebase-review/existing.rules", source.body.source.files[0].content);
  console.log("Existing rules saved for review.");
  const identity = new Client({ urlPrefix: "https://identitytoolkit.googleapis.com", apiVersion: "v2" });
  const config = await identity.get("/projects/koreanlottery25/config");
  console.log(JSON.stringify({ anonymous: config.body.signIn?.anonymous?.enabled, authorizedDomains: config.body.authorizedDomains }));
})().catch(error => { console.error(error.message); process.exitCode = 1; });
