export const appConfig = {
  football_API_KEY:
    "290ec875c73e45bba490754b61ba1c1dabf300d2d30d5dd81bb25eab35f59a16",
  securityCode: "$#GR24T4344$#$@#%WTEWTEAE%$6",
  database:
    "mongodb+srv://Mhmd:cs6kwkD7aduEmSZ@cluster0.8xdx0.mongodb.net/gulf-goal?retryWrites=true&w=majority",
  port: process.env.PORT || 3000,
  sendGrid_API_Key:
    "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",
  google: {
    clientId:
      "131881189995-6u4f4fhkco7h0jjq1ak6kmnqrfn6q6od.apps.googleusercontent.com",
    clientSecret: "9CiPDwTaNLO_02uaiCUN6eWd",
    redirectUrl: "http://localhost:3000/api/users/google/callback",
  },
  facebook: {
    appId: 759056357982078,
    appSecret: "aad6f493e269d002df8669226b174a9e",
    redirectUrl: "http://localhost:3000/api/users/facebook/callback",
  },
};
