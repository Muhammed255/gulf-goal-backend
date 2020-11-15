import { appConfig } from "./app-config.js";

export const footballPi = {
  event_url: `https://apiv2.apifootball.com/?action=get_events&from=2020-11-15&to=2020-11-30%22&league_id=148&APIkey=${appConfig.football_API_KEY}&fbclid=IwAR330OYclVHEKQsWYrSrx9ejcUQBKxkbXmnPyWWZbiSp0loP3FmhcPBsu1U`,
  teams_url: `https://apiv2.apifootball.com/?action=get_teams&from=2020-11-15&to=2020-11-30%22&league_id=148&APIkey=${appConfig.football_API_KEY}&fbclid=IwAR330OYclVHEKQsWYrSrx9ejcUQBKxkbXmnPyWWZbiSp0loP3FmhcPBsu1U`,
  league_url: `https://apiv2.apifootball.com/?action=get_leagues&from=2020-11-15&to=2020-11-30%22&league_id=148&APIkey=${appConfig.football_API_KEY}&fbclid=IwAR330OYclVHEKQsWYrSrx9ejcUQBKxkbXmnPyWWZbiSp0loP3FmhcPBsu1U`,
};
