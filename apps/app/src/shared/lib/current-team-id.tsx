import Cookies from "js-cookie";
import { CURRENT_TEAM_ID_COOKIE_NAME } from "../constants";

export function updateCurrentTeamIdCookie(teamId: string) {
	console.log("updateCurrentTeamIdCookie", teamId);
	Cookies.set(CURRENT_TEAM_ID_COOKIE_NAME, teamId, {
		path: "/",
		expires: 30,
	});
}
