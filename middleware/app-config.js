export const appConfig = {
    securityCode: '$#GR24T4344$#$@#%WTEWTEAE%$6',
    database: 'mongodb+srv://Mhmd:cs6kwkD7aduEmSZ@cluster0.8xdx0.mongodb.net/gulf-goal?retryWrites=true&w=majority',
    port: process.env.PORT || 3000,
    google: {
        clientId: '131881189995-6u4f4fhkco7h0jjq1ak6kmnqrfn6q6od.apps.googleusercontent.com',
        clientSecret: '9CiPDwTaNLO_02uaiCUN6eWd',
        redirectUrl: 'http://localhost:3000/api/users/google/callback'
    },
    facebook: {
        appId: 759056357982078,
        appSecret: 'aad6f493e269d002df8669226b174a9e',
        redirectUrl: 'http://localhost:3000/api/users/facebook/callback'
    },
    event_url: 'https://apiv2.apifootball.com/?action=get_events&from=2020-10-31&to=2020-10-31%22&league_id=148&APIkey=290ec875c73e45bba490754b61ba1c1dabf300d2d30d5dd81bb25eab35f59a16&fbclid=IwAR330OYclVHEKQsWYrSrx9ejcUQBKxkbXmnPyWWZbiSp0loP3FmhcPBsu1U',
    teams_url: 'https://apiv2.apifootball.com/?action=get_teams&from=2020-10-31&to=2020-10-31%22&league_id=148&APIkey=290ec875c73e45bba490754b61ba1c1dabf300d2d30d5dd81bb25eab35f59a16&fbclid=IwAR330OYclVHEKQsWYrSrx9ejcUQBKxkbXmnPyWWZbiSp0loP3FmhcPBsu1U',
    league_url: 'https://apiv2.apifootball.com/?action=get_leagues&from=2020-10-31&to=2020-10-31%22&league_id=148&APIkey=290ec875c73e45bba490754b61ba1c1dabf300d2d30d5dd81bb25eab35f59a16&fbclid=IwAR330OYclVHEKQsWYrSrx9ejcUQBKxkbXmnPyWWZbiSp0loP3FmhcPBsu1U'
};