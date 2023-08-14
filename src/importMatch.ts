import * as cheerio from 'cheerio';
import axios from 'redaxios';
import { InferModel, eq } from 'drizzle-orm';
import { playerMinutes, players, teams } from './db/schema';
import db from './db/db';

type Player = {
  name: string;
  minutes: number;
};

type Team = {
  teamName: string;
  players: Player[];
};

type DbTeam = InferModel<typeof teams, 'select'>;
type DbPlayer = InferModel<typeof players, 'select'>;
type NewPlayerMinutes = InferModel<typeof playerMinutes, 'insert'>;

const url = process.argv[2];
const loadHtml = async (url: string) => {
  const { data }: { data: string } = await axios(url);
  const $ = cheerio.load(data);
  const matchId = parseInt(
    $('ul.gameXtras').find('li').first().text().split(':')[1],
    10
  );
  console.log(matchId, 'this is matchId');
  const teams = $('div.game-header > a.team-name')
    .map(function (_id, element) {
      return $(element).text();
    })
    .toArray();

  const homeTeam: Team = {
    teamName: teams[1].toString(),
    players: [],
  };
  const awayTeam: Team = {
    teamName: teams[0].toString(),
    players: [],
  };

  $('table.stat_table')
    .slice(1)
    .each((teamId, element) => {
      $($(element).find('tbody'))
        .children('tr')
        .each((_playerId, element) => {
          if (teamId % 2 === 0) {
            awayTeam.players.push({
              name: $(element)
                .find('td.player_name > a')
                .text()
                .replace(/^[^A-Za-z]*/, ''),
              minutes: parseInt($(element).children('td').eq(2).text(), 10),
            });
          } else {
            homeTeam.players.push({
              name: $(element).find('td.player_name > a').text(),
              minutes: parseInt($(element).children('td').eq(2).text(), 10),
            });
          }
        });
    });
  return { homeTeam, awayTeam, matchId };
};

const getTeam = async (name: string) => {
  const team: DbTeam[] = await db
    .select()
    .from(teams)
    .where(eq(teams.name, name));
  return team;
};

export const getPlayer = async (name: string) => {
  const playersResult: DbPlayer[] = await db
    .select()
    .from(players)
    .where(eq(players.name, name.toUpperCase()));
  return playersResult;
};

const importMatch = async (url: string) => {
  const { homeTeam, awayTeam, matchId } = await loadHtml(url);
  const homeTeamResult = await getTeam(homeTeam.teamName);
  const awayTeamResult = await getTeam(awayTeam.teamName);
  const missingPlayers: string[] = [];
  const playerMinutesToAdd: NewPlayerMinutes[] = [];
  homeTeam.players.forEach(async (player) => {
    const result = await getPlayer(player.name);
    if (result.length <= 0) {
      missingPlayers.push(player.name);
    } else {
      playerMinutesToAdd.push({
        minutes: player.minutes,
        matchId,
        playerId: result[0].id,
        teamId: homeTeamResult[0].id,
      });
    }
  });
  awayTeam.players.forEach(async (player) => {
    const result = await getPlayer(player.name);
    if (result.length <= 0) {
      missingPlayers.push(player.name);
    } else {
      playerMinutesToAdd.push({
        minutes: player.minutes,
        matchId,
        playerId: result[0].id,
        teamId: awayTeamResult[0].id,
      });
    }
  });
  setTimeout(async () => {
    console.log(missingPlayers, playerMinutesToAdd);
    await db.insert(playerMinutes).values(playerMinutesToAdd);
  }, 6000);
};

importMatch(url);
