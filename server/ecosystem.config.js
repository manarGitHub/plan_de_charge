module.exports = {
  apps: [
    {
      name: "plan-de-charge",
      script: "npm",
      args: "run dev",
      env: {
        NODE_ENV: "development",
      },
    },
  ],
};