const { getGlobalDefaultAccount } = require("C:/Users/lp_08/AppData/Roaming/npm/node_modules/firebase-tools/lib/auth.js");
const { requireAuth } = require("C:/Users/lp_08/AppData/Roaming/npm/node_modules/firebase-tools/lib/requireAuth.js");
const { Client } = require("C:/Users/lp_08/AppData/Roaming/npm/node_modules/firebase-tools/lib/apiv2.js");
(async () => {
  await requireAuth({ project: "koreanlottery25", ...getGlobalDefaultAccount() });
  const api = new Client({ urlPrefix: "https://identitytoolkit.googleapis.com", apiVersion: "v2" });
  await api.patch("/projects/koreanlottery25/config",
    { signIn: { anonymous: { enabled: true } } },
    { queryParams: { updateMask: "signIn.anonymous.enabled" } });
  console.log("Anonymous sign-in enabled.");
})().catch(error => { console.error(error.message); process.exitCode = 1; });
