import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface PlayerEntry {
  timestamp: Date;
  playerName: string;
  characterName: string;
  characterClass: string;
  characterLevel: string;
}

export enum CharacterLevel {
  DPS_CARRY = 'DPS Carry ( 1445+ )',
  SUPPORT_CARRY = 'Suporte ( 1445+ )',
  MID_LEVEL = 'Intermediário ( 1400 ~ 1445 | 3+ Engravings )',
  ALT = 'Carregado ( 1370 ~1399 )',
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

    return {
      playersEntries,
      carryCharacters,
      altCharacters,
      midLevelCharacters,
      mainSupports,
    };
  }

  getCharactersFromType(entries: PlayerEntry[], type: string) {
    return entries.filter((entry) => entry.characterLevel === type);
  }
}
