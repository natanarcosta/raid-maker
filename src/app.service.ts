/* eslint-disable prettier/prettier */
import { ConsoleLogger, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

/**
 * TO-DO:
 * Lidar com main suportes
 * Tipagem do RaidGroup
 */

export interface CharacterEntry {
  timestamp: Date;
  playerName: string;
  characterName: string;
  characterClass: string;
  characterLevel: string;
  beingUsed: boolean;
}

export interface PlayerEntry {
  playerName: string;
  dpsCharacters: CharacterEntry[];
  altCharacters: CharacterEntry[];
  midCharacters: CharacterEntry[];
  supCharacters: CharacterEntry[];
  mustCarryAlts?: number;
  score?: number;
}

export enum CharacterLevel {
  DPS_CARRY = 'DPS Carry ( 1445+ )',
  SUPPORT_CARRY = 'Main Suporte ( 1445+ )',
  MID_LEVEL = 'Intermediário ( 1400 ~ 1445 | 3+ Engravings )',
  ALT = 'Alt ( 1370 ~1399 )',
}

export class RaidGroup {
  dps1: any;
  dps2: any;
  alt1: any;
  alt2: any;
  alt3: any;
  alt4: any;
  alt5: any;
  alt6: any;
}

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getDataFromJson() {
    const fullPath = path.join(__dirname, '../src/data/csvjson.json');

    const rawData = fs.readFileSync(fullPath);

    return JSON.parse(rawData.toString());
  }

  async createRaid() {
    const data = this.getDataFromJson();

    const characterEntries: CharacterEntry[] = data.map((entry) => {
      return {
        timestamp: entry['Carimbo de data/hora'],
        playerName: entry['Apelido no discord da guild'],
        characterName: entry['Nome do personagem'],
        characterClass: entry['Classe'],
        characterLevel: entry['ilvl'],
        beingUsed: false,
      };
    });

    const carryCharacters = this.getCharactersFromType(
      characterEntries,
      CharacterLevel.DPS_CARRY,
    );
    const altCharacters = this.getCharactersFromType(
      characterEntries,
      CharacterLevel.ALT,
    );
    const midLevelCharacters = this.getCharactersFromType(
      characterEntries,
      CharacterLevel.MID_LEVEL,
    );
    const mainSupports = this.getCharactersFromType(
      characterEntries,
      CharacterLevel.SUPPORT_CARRY,
    );

    const playerNames = new Set();

    characterEntries.forEach((entry) => playerNames.add(entry.playerName));

    const playersEntries: PlayerEntry[] = [];

    playerNames.forEach((name: string) => {
      playersEntries.push({
        playerName: name,
        dpsCharacters: carryCharacters.filter(
          (char) => char.playerName === name,
        ),
        altCharacters: altCharacters.filter((char) => char.playerName === name),
        midCharacters: midLevelCharacters.filter(
          (char) => char.playerName === name,
        ),
        supCharacters: mainSupports.filter((char) => char.playerName === name),
      });
    });

    playersEntries.forEach((entry) => {
      //Quantidade de alts que DEVEM ser carregados. Alts além dessa quantidade terão menos prioridade.
      entry.mustCarryAlts =
        entry.dpsCharacters.length * 3 +
        entry.midCharacters.length +
        entry.supCharacters.length;
      entry.score = entry.mustCarryAlts / entry.altCharacters.length;
    });

    playersEntries.sort((a, b) => (a.score > b.score ? -1 : 1));

    characterEntries.sort((a, b) => {
      const playerA = playersEntries.find((p) => p.playerName === a.playerName);
      const playerB = playersEntries.find((p) => p.playerName === b.playerName);
      return playerB.score > playerA.score ? 1 : -1;
    });

    //Número total de raids, arredondando pra cima para não ficar ninguém de fora. Último grupo pode precisar de mais dps/alts.
    const totalRaids = Math.ceil(carryCharacters.length / 2);

    const raidGroups: RaidGroup[] = [];

    for (let i = 0; i < totalRaids; i++) {
      const group = new RaidGroup();

      let remainingAlts = 6;

      group.dps1 = await this.getAvailableCharacterFromType(
        characterEntries,
        CharacterLevel.DPS_CARRY,
        group,
        playersEntries,
        raidGroups[i - 1],
      );

      group.dps2 = await this.getAvailableCharacterFromType(
        characterEntries,
        CharacterLevel.DPS_CARRY,
        group,
        playersEntries,
        raidGroups[i - 1],
      );

      //Se acabarem os main DPS, busca um intermediário + 1 main sup
      if (!group.dps2) {
        group.dps2 = await this.getAvailableCharacterFromType(
          characterEntries,
          CharacterLevel.MID_LEVEL,
          group,
          playersEntries,
          raidGroups[i - 1],
        );

        group.alt6 = await this.getAvailableCharacterFromType(
          characterEntries,
          CharacterLevel.SUPPORT_CARRY,
          group,
          playersEntries,
          raidGroups[i - 1],
        );

        if (!group.alt6) {
          group.alt6 = await this.getAvailableCharacterFromType(
            characterEntries,
            CharacterLevel.MID_LEVEL,
            group,
            playersEntries,
            raidGroups[i - 1],
          );
        }

        if (group.alt6) remainingAlts--;
      }

      // Atribui alts programaticamente
      for (let j = 1; j <= remainingAlts; j++) {
        let result = await this.getAvailableCharacterFromType(
          characterEntries,
          CharacterLevel.ALT,
          group,
          playersEntries,
          raidGroups[i - 1],
        );

        //Se não tem mais alts disponíveis busca um intermediário
        if (!result) {
          result = await this.getAvailableCharacterFromType(
            characterEntries,
            CharacterLevel.MID_LEVEL,
            group,
            playersEntries,
            raidGroups[i - 1],
          );

          if (!result) {
            result = await this.getAvailableCharacterFromType(
              characterEntries,
              CharacterLevel.SUPPORT_CARRY,
              group,
              playersEntries,
              raidGroups[i - 1],
            );
          }
        }

        const altId = 'alt' + j;
        group[altId] = result;
      }

      raidGroups.push(group);
    }

    const output = raidGroups.map((group) => {
      // return Object.values(group).map((value) => value?.playerName);
      return Object.values(group).map((value) => {
        if (value?.characterLevel === CharacterLevel.DPS_CARRY)
          return 'DPS: ' + value.playerName;
        if (value?.characterLevel === CharacterLevel.ALT)
          return 'ALT: ' + value.playerName;
        if (value?.characterLevel === CharacterLevel.MID_LEVEL)
          return 'INT: ' + value.playerName;
        if (value?.characterLevel === CharacterLevel.SUPPORT_CARRY)
          return 'SUP: ' + value.playerName;
      });
    });

    this.formatOutput(output);

    return {
      output,
      playersEntries,
      unused: characterEntries.filter((c) => !c.beingUsed),
    };
  }

  /**
   * Retorna todos personagens do tipo informado.
   */
  getCharactersFromType(entries: CharacterEntry[], type: string) {
    return entries.filter((entry) => entry.characterLevel === type);
  }

  /**
   * Retorna um personagem que não está sendo usado em algum grupo, e o marca como sendo usado.
   */
  async getAvailableCharacterFromType(
    entries: CharacterEntry[],
    type: string,
    group: RaidGroup,
    players: PlayerEntry[],
    previousGroup: RaidGroup,
  ) {
    //Nome dos jogadores já presentes no grupo
    const playersInGroup = Object.values(group).map(
      (entry) => entry?.playerName,
    );

    if (previousGroup) {
      const playersInPreviousGroup = Object.values(previousGroup).map(
        (entry) => entry?.playerName,
      );

      let character = entries.find(
        (entry) =>
          //Do tipo informado
          entry.characterLevel === type &&
          //Que não está sendo usado
          !entry.beingUsed &&
          //De player não participante do grupo
          !playersInGroup.find((p) => p === entry.playerName) &&
          !playersInPreviousGroup.find((p) => p === entry.playerName) &&
          //De player que trouxe ao menos 1 carry
          players.find((p) => p.playerName === entry.playerName).score > 0 &&
          //De player que não estourou a cota de alts
          players.find((p) => p.playerName === entry.playerName)
            .mustCarryAlts >=
            this.countAltsBeingUsedByPlayer(
              players.find((p) => p.playerName === entry.playerName).playerName,
              entries,
            ),
      );

      //Se encontrar um personagem viável, marca-o como beingUsed.
      if (character) {
        const index = entries.findIndex(
          (entry) => entry.characterName === character.characterName,
        );

        entries[index].beingUsed = true;

        return character;
      }
    }

    //Sort na array de personagens para priorizar pessoas que tem menos alts incluidos
    entries.sort((a, b) => {
      const aCount = this.countAltsBeingUsedByPlayer(a.playerName, entries);
      const bCount = this.countAltsBeingUsedByPlayer(b.playerName, entries);
      return aCount > bCount ? 1 : -1;
    });

    //Busca um personagem do tipo informado, que não está sendo usado e de algum jogador que ainda não está no grupo.
    let character = entries.find(
      (entry) =>
        //Do tipo informado
        entry.characterLevel === type &&
        //Que não está sendo usado
        !entry.beingUsed &&
        //De player não participante do grupo
        !playersInGroup.find((p) => p === entry.playerName) &&
        //De player que trouxe ao menos 1 carry
        players.find((p) => p.playerName === entry.playerName).score > 0 &&
        //De player que não estourou a cota de alts
        players.find((p) => p.playerName === entry.playerName).mustCarryAlts >=
          this.countAltsBeingUsedByPlayer(
            players.find((p) => p.playerName === entry.playerName).playerName,
            entries,
          ),
    );

    //Se encontrar um personagem viável, marca-o como beingUsed.
    if (character) {
      const index = entries.findIndex(
        (entry) => entry.characterName === character.characterName,
      );

      entries[index].beingUsed = true;
    } else {
      character = entries.find(
        (entry) =>
          //Do tipo informado
          entry.characterLevel === type &&
          //Que não está sendo usado
          !entry.beingUsed &&
          //De player não participante do grupo
          !playersInGroup.find((p) => p === entry.playerName),
      );
      if (character) {
        const index = entries.findIndex(
          (entry) => entry.characterName === character.characterName,
        );

        entries[index].beingUsed = true;
      }

      if (character) {
        const index = entries.findIndex(
          (entry) => entry.characterName === character.characterName,
        );

        entries[index].beingUsed = true;
      }
    }

    return character;
  }

  countAltsBeingUsedByPlayer(
    playerName: string,
    entries: CharacterEntry[],
  ): number {
    const count = entries.filter(
      (char) =>
        char.playerName === playerName &&
        char.characterLevel === CharacterLevel.ALT &&
        char.beingUsed,
    ).length;

    return count;
  }

  formatOutput(output: string[][]) {
    for (const group of output) {
      const lines = Object.values(group).map((val) => {
        const nameLength = val?.split(':')[1].length;

        return (
          `| ${val?.split(':')[0] || '---'} | ${
            val?.split(':')[1] || '---------------'
          }` + `${' '.repeat(15 - nameLength) + '|'}`
        );
      });
    }
  }
}
