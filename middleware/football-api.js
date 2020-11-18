import { appConfig } from "./app-config.js";

const date = new Date();
const from_date = date.toISOString().split("T")[0];

export const footballPi = {
  event_url: `https://apiv2.apifootball.com/?action=get_events&from=${from_date}&to=${from_date}&APIkey=${appConfig.football_API_KEY}`,
  teams_url: `https://apiv2.apifootball.com/?action=get_teams&from=2020-11-17&to=2020-11-30&league_id=148&APIkey=${appConfig.football_API_KEY}`,
  league_url: `https://apiv2.apifootball.com/?action=get_leagues&from=2020-11-15&to=2020-11-30&league_id=148&APIkey=${appConfig.football_API_KEY}`,
};
