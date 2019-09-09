var prompts = require('prompts');	
var request = require('request');
var xml2js = require('xml2js');


/*
código do serviço.

https://www.correios.com.br/a-a-z/pdf/calculador-remoto-de-precos-e-prazos/manual-de-implementacao-do-calculo-remoto-de-precos-e-prazos/at_download/file
*/


(async () => {
    const response = await prompts({
      type: 'text',
      name: 'cep',
      message: 'Qual é o cep?'
    });
    
    var cep = await response.cep
    // console.log(cep);

    

    var params = {
        'nCdEmpresa': '',
        'sDsSenha': '',
        'sCepOrigem': '74425340',
        'sCepDestino': cep,
        'nVlPeso': '1',
        'nCdFormato': '1',
        'nVlComprimento': '30',
        'nVlAltura': '20',
        'nVlLargura': '33',
        'nVlDiametro': '0',
        'sCdMaoPropria': 'n',
        'nVlValorDeclarado': '0',
        'sCdAvisoRecebimento': 'n',
        'StrRetorno': 'xml',
        'nCdServico': '04014,04065,04510,04707,40169,40215,40290'
    };
    
    var url = 'http://ws.correios.com.br/calculador/CalcPrecoPrazo.aspx';

    var options = {
        'uri': url,
        'method': 'GET',
        'qs': params
    };


    await request(options, function(error, response, body) {

        if (error) {
            return console.log('Erro ', error);
        }
        var parser = new xml2js.Parser({'async': true, 'attrkey': '@', 'explicitArray': false});
    
        parser.parseString(body, function (err, xml) {
            if (err) {
                return console.log('Erro ', err);
            }
    
            console.log('')
            console.log('Serviço\t\t\t\t\tFrete\t\tEmbalagem\tTotal\t\tPrazo');
            for (var i = 0; i < xml.Servicos.cServico.length; i++) {
                var row = xml.Servicos.cServico[i];
                // console.log(JSON.stringify(row, null, 2));
                
                if(row.MsgErro ==""){
                    imprimir(row);
                } else {
                    imprimir(row);
                }
            }
            console.log('\n\n')

        });
    });
  })();


  function imprimir(row) {
    switch(row.Codigo){
        case '04014':
            servico = 'SEDEX à vista                     ';
            break;
        case '04065':
            servico = 'SEDEX à vista pagamento na entrega ';
            break;
        case '04510':
            servico = 'PAC à vista                        ';
            break;
        case '04707':
            servico = 'PAC à vista pagamento na entrega   ';
            break;
        case '40169':
            servico = 'SEDEX 12 ( à vista e a faturar)*  ';
            break;
        case '40215':
            servico = 'SEDEX 10 (à vista e a faturar)*    ';
            break;
        case '40290':
            servico = 'SEDEX Hoje Varejo*                  ';
            break;
        default:
            servico = 'codigo não cadastrado               ';
    }
    
    

    var resposta = '';

    if(row.MsgErro == ''){
        var frete = parseFloat(row.Valor.replace(/,/g, '.'));
        var embalagem = 5.0;
        var total = frete + embalagem;
        resposta = servico + '\tR$ ' +frete.toFixed(2) +'\tR$ '+embalagem.toFixed(2)+'\t\tR$ '+total.toFixed(2)+'\t'+row.PrazoEntrega+' dias';
    } else {
        resposta = servico + '\t\tindisponível para esse cep'
    }


    console.log(resposta);
    // console.log('\njson: '+JSON.stringify(row, null, 2));
  }
