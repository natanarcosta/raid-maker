import { Injectable } from '@nestjs/common';
import {
  GoogleSpreadsheet,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet';
import { CharacterEntry } from 'src/app.service';
import { SheetHeaders } from 'src/shared/enums/sheets.enum';

const key = `-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDOs+VD5wcEZsVA\nr5fDU96IZwAXNCNkGJoZ0iQqh45uWigBs8sU2q3xGa30HL8/jbeplA5tALPl0Reb\nTGs5uOFA4Hp2HFKsmaBPKXBrfvazsiPaJ4pv0HGjWzCr89UCPQ45m7LLhpHU2K8R\nf00Sjc76P5/9VFdsU1oaMO6NKRlupyrUykLGLRPACVX70V7kcguZXE1zH1UR8tbI\nqtz4INQuRqBZYHfyUsa1KrAb9O58NuoJPoDZZe/C0mZ1SL7U20O9N9eGAWlAidzq\ndyARxJV1fQXAnp8ijF1+bkDRHQF4+Mq3KfE2jmrM7z0DfFcxJ4VfpaSlgtegctDo\ntj2HTvHLAgMBAAECggEAH11jzhRp16yihMjAPhblXwxGEr9KGX+0LnPZIgz0u2D5\nzhxSlgUCvOF5KGAOUx31fwlk0Px4z8gVDW8gnB8mKvqFCpQMpX0gOrLeiKk41RaU\nYx953bKi87c8IPN8YH0UQgCStlhim4oPspd/AfA7tnReGgoow9q4At5m7EuOvN/i\nCTPy0v/rlLUSmEecRPDcufQ1FOJF5hQRZtoNAzuAG+CI6N9QdqVV8w+ArBAP79Cc\nPE7DMZyOIXtnsrTBxQixCmh/v9vcDMVZ0Mop9+hXqIh0RLx2hpc3cB+CdHgqcr2B\nc3AxIxL4qmarOko7kGrgMynm7LINfDQ6oz26RZ7J7QKBgQDp7Q/VPnN+OC9jRBij\nFDLRUnzFp//y8kZq1o7lTR4YMLE7p21QjM44wWkaLf4hX8Aq3OPMG2huy2yvbssF\nsxZMXyqabSjHK2H/zJ8eBourjs4J82bVb/R+hRtdTN0uEWF9POE8+jkIxkeLalHF\nnDgqJgudDwPuQo26chYm/SAyXwKBgQDiNTOpyF8y5MDhMMj55B359ogHjY/vza7u\nnl5wZREkPU5s/Jkv0MSMgBg+OM4xHM9nZ7ESxW+3+ltZSu4AV5KwQ1RgAg+cAQO0\npSlmelIQEXCGDIA1bh+z2IqlUoYbIHBck8qgWvb6RcswmhF8atI5qwxC6OmCF7bb\njTSPSmcwFQKBgQCMj9o3tLMJYRF4gG6db4GprfszeeOeRF5zzEFJH7G5r2iQA+b3\nw+QWzoEtLf3KaBK8rsZi2wVBrhK8x8JOxnHbqkObT4R1SWg1oOrry9sZV1IPQKbG\nEePEMo9i3ND64Y7HBlIBpgmncB2FdHl2WIyXJw1Lbr5Z6LvpEKym+Orj2QKBgQCN\neI5uAbWgI7aJX7RhrIwe11Mtvhgl9rIP5BXWHy9AReM1gCjh4aP65uXCjE5QIt+H\noS76OWZsXnQg/R6qMhq4h/NN9BwFChFiOeURhTCrgeyouUq5n7zOAoB7cogSkRAU\npg2Uii9qSJoSNFj5QelmTZZmhjn7tY8T8lTLxNGSHQKBgEYfwTSximZqQFaNrYXE\nQjK2RKFjTb+srmWTUKe+6BK5cbCAmjwH4AL1D4oSYNJScN+AfCTHOnhIQGN3ka6p\nk76HHNrxlkIl5xaR/EvaU3YMgirqc9ThsHzAyBvMMYN+wViCa/W3/cHT/XIz3WeU\nCNRMFR2Z/S4og0spXvBqnKdx\n-----END PRIVATE KEY-----\n`;

@Injectable()
export class GoogleSheetsService {
  doc: GoogleSpreadsheet;
  sheet: GoogleSpreadsheetWorksheet;
  constructor() {
    this.doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID);

    this.doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: key,
    });
  }

  async loadData(): Promise<void> {
    await this.doc.loadInfo();
    this.sheet = this.doc.sheetsByIndex[0];
  }

  async getData(): Promise<CharacterEntry[]> {
    await this.loadData();

    const rows = await this.sheet.getRows();

    const data: CharacterEntry[] = [];

    rows.forEach((row) => {
      if (row[SheetHeaders.TIMESTAMP]) {
        data.push({
          playerName: row[SheetHeaders.DISCORD_NAME],
          characterName: row[SheetHeaders.CHARACTER_NAME],
          characterLevel: row[SheetHeaders.CHARACTER_LVL],
          characterClass: row[SheetHeaders.CHARACTER_CLASS],
          timestamp: null,
          beingUsed: false,
        });
      }
    });

    return data;
  }
}
