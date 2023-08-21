import * as cheerio from 'cheerio';
import axios from 'redaxios';

export type Player = {
  name: string;
  minutes: number;
};

export type Team = {
  teamName: string;
  players: Player[];
};

export const loadMatchHtml = async (url: string) => {
  const { data }: { data: string } = await axios(url);
  const $ = cheerio.load(data);
  console.log($('ul.gameXtras').find('li').first().text().split(':'));
  const matchId = parseInt(
    $('ul.gameXtras').find('li').first().text().split(':')[1],
    10
  );
  console.log(matchId, 'is the matchId');
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

  const division = $('div.sport-colors > h2 > a').text();

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
  return { homeTeam, awayTeam, matchId, division };
};
