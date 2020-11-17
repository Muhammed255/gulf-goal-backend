import { appConfig } from "./app-config.js";

const date = new Date();
const from_date = date.toISOString().split("T")[0];
const to_date = new Date(date.setDate(date.getDate() + 10));

export const footballPi = {
  event_url: `https://apiv2.apifootball.com/?action=get_events&from=2020-11-17&to=2020-11-30&APIkey=277eaabfa4cd25e30e3e7b3eb96756c2e470d6a20c0e73835663ddc69c50afbb`,
  teams_url: `https://apiv2.apifootball.com/?action=get_teams&from=2020-11-17&to=2020-11-30&league_id=148&APIkey=${appConfig.football_API_KEY}`,
  league_url: `https://apiv2.apifootball.com/?action=get_leagues&from=2020-11-15&to=2020-11-30&league_id=148&APIkey=${appConfig.football_API_KEY}`,
};
