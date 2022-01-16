
const got = require('got');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const filesystem = require('fs');
const chessUrl= 'https://www.chessgames.com/chessecohelp.html';
interface IChessData{
  code:string;
  name:string;
moves:string;
}
let chessdata:IChessData[] ;
got(chessUrl).then((response: any) => {
    const dom = new JSDOM(response.body);
    chessdata=[];
    const trows = dom.window.document.querySelectorAll('tr');
    trows.forEach((row: any) => {

        var tdatas = row.querySelectorAll('td');
        var code = tdatas[0].childNodes[0].innerHTML
        var name = tdatas[1].childNodes[0].childNodes[0].innerHTML
        var moves = tdatas[1].childNodes[0].childNodes[3].innerHTML
        chessdata.push({
            code,
            name,
            moves
        })
            
    });
    filesystem.writeFileSync('../chessmoves.json', JSON.stringify(chessdata));
    console.log("File writing completed");
}).catch((err: any) => {
    console.log(err);
});
