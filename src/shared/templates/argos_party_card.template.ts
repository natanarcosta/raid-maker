const template = `<html>
<head>
  <style>
    body {
      height: 320px;
      width: 600px;
    }
    .container {
      display: grid;
      font-family: Verdana, Geneva, Tahoma, sans-serif;
    }

    hr {
      width: 100%;
    }

    .card {
      width: 100%;
      height: auto;
      display: flex;
      justify-content: center;
      box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
      background-color: #212121;
    }
    .party {
      width: 50%;
      display: flex;
      justify-content: center;
    }

    .party ul {
      list-style-type: none;
      display: flex;
      justify-items: center;
      flex-direction: column;
      width: 100%;
      padding-right: 3em;
    }

    .party ul img {
      width: 40px;
      height: 40px;
    }

    .party ul li {
      color: white;
    }

    .party ul li div {
      padding: 1em;
      display: flex;
      align-items: center;
    }

    .party ul li div span {
      margin-left: 1em;
    }

    .dps {
      color: red;
    }

    .debug {
      border: 1px red solid;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="party">
        <ul>
          <li>
            <div><img src="%IMAGE1%" /> <span class="dps"> %DPS1%</span></div>
          </li>
          <hr />
          <li>
            <div><img src="%IMAGE3%" /> <span> %ALT1%</span></div>
          </li>
          <li>
            <div><img src="%IMAGE4%" /> <span> %ALT2%</span></div>
          </li>
          <li>
            <div><img src="%IMAGE5%" /> <span> %ALT3%</span></div>
          </li>
        </ul>
      </div>
      <div class="party">
        <ul>
          <li>
            <div><img src="%IMAGE2%" /> <span class="dps"> %DPS2%</span></div>
          </li>
          <hr />
          <li>
            <div><img src="%IMAGE6%" /> <span> %ALT4%</span></div>
          </li>
          <li>
            <div><img src="%IMAGE7%" /> <span> %ALT5%</span></div>
          </li>
          <li>
            <div><img src="%IMAGE8%" /> <span> %ALT6%</span></div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</body>
</html>

`;
export interface CreateImage {
  dps1: {
    name: string;
    image: string;
  };
  dps2: {
    name: string;
    image: string;
  };
  alt1: {
    name: string;
    image: string;
  };
  alt2: {
    name: string;
    image: string;
  };
  alt3: {
    name: string;
    image: string;
  };
  alt4: {
    name: string;
    image: string;
  };
  alt5: {
    name: string;
    image: string;
  };
  alt6: {
    name: string;
    image: string;
  };
}

export class ArgosCardTemplate {
  getTemplate(data: CreateImage): string {
    const { dps1, dps2, alt1, alt2, alt3, alt4, alt5, alt6 } = data;
    return template
      .replace('%DPS1%', dps1.name || 'VAGA')
      .replace('%DPS2%', dps2.name || 'VAGA')
      .replace('%ALT1%', alt1.name || 'VAGA')
      .replace('%ALT2%', alt2.name || 'VAGA')
      .replace('%ALT3%', alt3.name || 'VAGA')
      .replace('%ALT4%', alt4.name || 'VAGA')
      .replace('%ALT5%', alt5.name || 'VAGA')
      .replace('%ALT6%', alt6.name || 'VAGA')
      .replace('%IMAGE1%', dps1.image)
      .replace('%IMAGE2%', dps2.image)
      .replace('%IMAGE3%', alt1.image)
      .replace('%IMAGE4%', alt2.image)
      .replace('%IMAGE5%', alt3.image)
      .replace('%IMAGE6%', alt4.image)
      .replace('%IMAGE7%', alt5.image)
      .replace('%IMAGE8%', alt6.image);
  }
}
