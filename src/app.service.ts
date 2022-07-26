/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

/**
 * TO-DO:
 * Lidar com main suportes
 * Tipagem do RaidGroup
 */

export interface PlayerEntry {
  timestamp: Date;
  playerName: string;
  characterName: string;
  characterClass: string;
  characterLevel: string;
  beingUsed: boolean;
}

export enum CharacterLevel {
  DPS_CARRY = 'DPS Carry ( 1445+ )',
  SUPPORT_CARRY = 'Suporte ( 1445+ )',
  MID_LEVEL = 'Intermediário ( 1400 ~ 1445 | 3+ Engravings )',
  ALT = 'Carregado ( 1370 ~1399 )',
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

  createRaid() {
    const data = this.getDataFromJson();

    const playersEntries: PlayerEntry[] = data.map((entry) => {
      return {
        timestamp: entry['Carimbo de data/hora'],
        playerName: entry['Nome no discord'],
        characterName: entry['Nome do personagem'],
        characterClass: entry['Classe'],
        characterLevel: entry['ilvl'],
        beingUsed: false,
      };
    });

    const carryCharacters = this.getCharactersFromType(
      playersEntries,
      CharacterLevel.DPS_CARRY,
    );
    const altCharacters = this.getCharactersFromType(
      playersEntries,
      CharacterLevel.ALT,
    );
    const midLevelCharacters = this.getCharactersFromType(
      playersEntries,
      CharacterLevel.MID_LEVEL,
    );
    const mainSupports = this.getCharactersFromType(
      playersEntries,
      CharacterLevel.SUPPORT_CARRY,
    );

    //Número total de raids, arredondando pra cima para não ficar ninguém de fora. Último grupo pode precisar de mais dps/alts.
    const totalRaids = Math.ceil(carryCharacters.length / 2);

    const raidGroups: RaidGroup[] = [];

    for (let i = 0; i < totalRaids; i++) {
      const group = new RaidGroup();

      let remainingAlts = 6;

      group.dps1 = this.getAvailableCharacterFromType(
        playersEntries,
        CharacterLevel.DPS_CARRY,
        group,
      );
      group.dps2 = this.getAvailableCharacterFromType(
        playersEntries,
        CharacterLevel.DPS_CARRY,
        group,
      );

      //Se acabarem os main DPS, busca dois intermediários
      if (!group.dps2) {
        group.dps2 = this.getAvailableCharacterFromType(
          playersEntries,
          CharacterLevel.MID_LEVEL,
          group,
        );

        group.alt6 = this.getAvailableCharacterFromType(
          playersEntries,
          CharacterLevel.MID_LEVEL,
          group,
        );

        remainingAlts--;
      }

      //Atribui alts programaticamente
      for (let j = 1; j <= remainingAlts; j++) {
        let result = this.getAvailableCharacterFromType(
          playersEntries,
          CharacterLevel.ALT,
          group,
        );

        //Se não tem mais alts disponíveis busca um intermediário
        if (!result) {
          result = this.getAvailableCharacterFromType(
            playersEntries,
            CharacterLevel.MID_LEVEL,
            group,
          );
        }

        const altId = 'alt' + j;
        group[altId] = result;
      }

      raidGroups.push(group);
    }

    return raidGroups.map((group) => {
      // return Object.values(group).map((value) => value?.playerName);
      return Object.values(group).map((value) => {
        if (value?.characterLevel === CharacterLevel.DPS_CARRY)
          return 'DPS: ' + value.playerName;
        if (value?.characterLevel === CharacterLevel.ALT)
          return 'ALT: ' + value.playerName;
        if (value?.characterLevel === CharacterLevel.MID_LEVEL)
          return 'INT: ' + value.playerName;
      });
    });
  }

  /**
   * Retorna todos personagens do tipo informado.
   */
  getCharactersFromType(entries: PlayerEntry[], type: string) {
    return entries.filter((entry) => entry.characterLevel === type);
  }

  /**
   * Retorna um personagem que não está sendo usado em algum grupo, e o marca como sendo usado.
   */
  getAvailableCharacterFromType(
    entries: PlayerEntry[],
    type: string,
    group: RaidGroup,
  ) {
    //Nome dos jogadores já presentes no grupo
    const playersInGroup = Object.values(group).map(
      (entry) => entry?.playerName,
    );

    //Busca um personagem do tipo informado, que não está sendo usado e de algum jogador que ainda não está no grupo
    const character = entries.find(
      (entry) =>
        entry.characterLevel === type &&
        !entry.beingUsed &&
        !playersInGroup.find((p) => p === entry.playerName),
    );

    //Se encontrar um personagem viável, marca-o como beingUsed.
    if (character) {
      const index = entries.findIndex(
        (entry) => entry.characterName === character.characterName,
      );

      entries[index].beingUsed = true;
    }

    return character;
  }
}
