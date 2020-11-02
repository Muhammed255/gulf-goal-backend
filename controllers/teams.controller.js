
import Axios from "axios";
import { appConfig } from "../middleware/app-config";

export default {
  getTeams(req, res, next) {
    Axios.get(appConfig.league_url).then(response => {
        response.data.forEach(el => {
            
            console.log(JSON.stringify(el.country_name));
        });
    }).catch(err => {
        console.log(err);
    })
  },
};
