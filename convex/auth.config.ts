// Dynamic auth config based on deployment
// Uses production domain for prod deployment, dev domain for dev deployment

const isProd = process.env.CONVEX_CLOUD_URL?.includes("fast-lark-394");

export default {
  providers: [
    {
      domain: isProd 
        ? "https://clerk.tars.pranavnigade.me"  // Production
        : "https://modest-collie-28.clerk.accounts.dev",  // Development
      applicationID: "convex",
    },
  ],
};
